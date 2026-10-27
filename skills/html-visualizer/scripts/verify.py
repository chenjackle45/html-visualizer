#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""html-visualizer 產出自檢 — 一行跑完 SKILL.md Step 3 的所有檢查。

用法：
    python3 <skill 目錄>/scripts/verify.py <file.html> [--no-layout] [--no-stamp]

檢查前會先「蓋章」（改寫受檢檔）：套用使用者設定檔、把寫死的字級與間距改成可調、補上調整面板。
範本原檔不蓋；唯讀環境或審查時加 --no-stamp。

規則來源：SKILL.md § Step 3。
會依產出類型自動分流：有拍板題跑拍板類檢查，純展示跑骨架與呈現檢查。

exit code：0 = 全過（或僅剩待人工確認），1 = 有項目未過。
"""
import json
import re
import sys
import os
import shutil
import subprocess
import tempfile
from html.parser import HTMLParser

SKILL_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
import importlib.util as _ilu

# 用檔案路徑載入：標準庫也有一個 profile 模組（效能分析），用 import profile 可能拿錯
_spec = _ilu.spec_from_file_location("vt_profile", os.path.join(os.path.dirname(os.path.abspath(__file__)), "profile.py"))
profile_mod = _ilu.module_from_spec(_spec)
_spec.loader.exec_module(profile_mod)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import stamp as stamp_mod  # noqa: E402

# 彩色 emoji 與 ✓✗⚠ 這類符號（設定檔 checks.noEmoji 開啟時擋）。箭頭 →←、⌘ 是一般文字符號，不算
EMOJI = re.compile("[\U0001F000-\U0001FAFF\u2600-\u27BF\u2B50\u2B55\u231A\u231B\u23E9-\u23FA]")
WIDTHS = [390, 768, 1440]  # 手機／平板／桌機；main() 依設定檔 checkWidths 覆寫
CHECKLIST = os.path.join(SKILL_DIR, "references", "cn-en-translation-checklist.md")

OK, BAD, WARN, SKIP, UNVERIFIED = "✓", "✗", "!", "–", "?"
_C = {"✓": "\033[32m", "✗": "\033[31m", "!": "\033[33m", "–": "\033[90m"}
_R = "\033[0m"

results = []


def report(mark, label, detail=""):
    results.append((mark, label, detail))
    color = _C.get(mark, "") if sys.stdout.isatty() else ""
    reset = _R if sys.stdout.isatty() else ""
    print(f"    {color}{mark}{reset} {label}" + (f"  {detail}" if detail else ""))


def head(title):
    print(f"\n  \033[1m{title}\033[0m" if sys.stdout.isatty() else f"\n  {title}")


def visible_text(h):
    """去掉 script / style / 註解後的可見文字。"""
    t = re.sub(r"<script.*?</script>", " ", h, flags=re.S)
    t = re.sub(r"<style.*?</style>", " ", t, flags=re.S)
    t = re.sub(r"<!--.*?-->", " ", t, flags=re.S)
    return " ".join(re.findall(r">([^<>]+)<", t))


def load_mixed_words():
    """從中英對照表抽出「該換掉的英文詞」。"""
    if not os.path.exists(CHECKLIST):
        return []
    words = []
    for line in open(CHECKLIST, encoding="utf-8"):
        m = re.match(r"\|\s*([A-Za-z][A-Za-z0-9 /\-\.]*?)\s*\|", line)
        if not m:
            continue
        w = m.group(1).strip()
        if w.lower() in ("英文", "english"):
            continue
        for part in re.split(r"\s*/\s*", w):
            part = part.strip()
            if len(part) >= 3:
                words.append(part)
    return sorted(set(words), key=len, reverse=True)


def inline_scripts(h):
    """抽出所有 inline <script> 區塊（跳過 src= 外連）。回傳 [(序號, 內容, 是否 module)]。"""
    out = []
    for i, m in enumerate(re.finditer(r"<script([^>]*)>(.*?)</script>", h, re.S | re.I)):
        attrs, body = m.group(1), m.group(2)
        if re.search(r'\bsrc\s*=', attrs, re.I):
            continue
        if not body.strip():
            continue
        is_mod = bool(re.search(r'type\s*=\s*["\']module["\']', attrs, re.I))
        out.append((i, body, is_mod))
    return out


def check_js_syntax(h):
    """對每個 inline script 跑 node --check。回傳 (可否檢查, 失敗清單)。

    存在理由：2026-08-13 一份決策頁 13 項自檢全過，但 JS 字串裡混進真正的換行字元、
    整個 script 區塊 SyntaxError，事件監聽器從未掛上——按鈕按了完全沒反應。
    結構、拍板機制、文案檢查全都看不到這種錯：它不在標記裡，在腳本能不能跑。
    """
    if not shutil.which("node"):
        return False, []
    fails = []
    for idx, body, is_mod in inline_scripts(h):
        suffix = ".mjs" if (is_mod or re.search(r"^\s*(import|export)\s", body, re.M)) else ".js"
        with tempfile.NamedTemporaryFile("w", suffix=suffix, delete=False, encoding="utf-8") as f:
            f.write(body)
            tmp = f.name
        try:
            r = subprocess.run(["node", "--check", tmp], capture_output=True, text=True)
            if r.returncode != 0:
                err = r.stderr
                kind = re.search(r"^\w*Error: .+$", err, re.M)
                lineno = re.search(re.escape(tmp) + r":(\d+)", err)
                near = ""
                for ln in err.splitlines():
                    st = ln.strip()
                    if st and not st.startswith(("^", "~")) and tmp not in ln and "Error" not in ln \
                       and not st.startswith("at ") and not st.startswith("Node.js"):
                        near = st
                        break
                msg = kind.group(0) if kind else "SyntaxError"
                if lineno:
                    msg += f"（區塊內第 {lineno.group(1)} 行）"
                if near:
                    msg += f" 附近：{near[:40]}"
                fails.append((idx, msg))
        finally:
            os.unlink(tmp)
    return True, fails


def inline_styles(h):
    """回傳 [(序號, style 區塊內容)]。"""
    return [(i + 1, m.group(1)) for i, m in enumerate(re.finditer(r"<style[^>]*>(.*?)</style>", h, re.S))]


def check_css_syntax(h):
    """掃每個 inline <style>，抓三種會讓瀏覽器丟棄「後面全部規則」的結構錯。

    存在理由：2026-09-08 一份決策頁 9 項自檢全過、open 給使用者後整頁沒有樣式。
    根因是前一天用 sed 從範本切 CSS 時切在規則中間，留下一段孤兒屬性和一個沒收尾的
    規則——從那一行之後的所有 CSS 全被瀏覽器丟棄。**括號總數是平衡的**，所以數括號
    看不出來；標記、腳本、文案、版面檢查也全都看不到——它不在標記裡，在樣式能不能解析。

    只抓高信心形狀，不做完整解析：
      1. 深度轉負 → 多了一個 }
      2. 結束時深度非 0 → 有規則沒收尾
      3. 深度 0 出現 `屬性: 值;` → 孤兒屬性（規則開頭被切掉）
    """
    fails = []
    for idx, css in inline_styles(h):
        body = re.sub(r"/\*.*?\*/", "", css, flags=re.S)   # 去註解
        depth, went_negative = 0, False
        for line_no, line in enumerate(body.split("\n"), 1):
            stripped = line.strip()
            if depth == 0 and stripped and not stripped.startswith("@") \
               and "{" not in stripped and stripped.endswith(";") and ":" in stripped:
                fails.append((idx, f"孤兒屬性（規則開頭被切掉）第 {line_no} 行附近：{stripped[:44]}"))
                break
            depth += line.count("{") - line.count("}")
            if depth < 0 and not went_negative:
                went_negative = True
                fails.append((idx, f"多了一個 }} — 第 {line_no} 行附近：{stripped[:44]}"))
                break
        else:
            if depth > 0:
                fails.append((idx, f"有 {depth} 個規則沒收尾（缺 }}）"))
    return fails


def check_js_dom_refs(h):
    """JS 用 getElementById 抓的 id，HTML 裡是否真的有。

    抓不到會回 null，接著存取屬性就整段拋錯——症狀與語法錯一樣（後面全部不執行），
    但 node --check 看不出來。動態產生的元素會誤報，所以只當提醒不當失敗。
    """
    ids = set(re.findall(r'\sid="([^"]+)"', h))
    want = set()
    for _, body, _ in inline_scripts(h):
        want |= set(re.findall(r'getElementById\(\s*["\']([^"\']+)["\']\s*\)', body))
    return sorted(want - ids)


def check_layout(path):
    """真的把頁面渲染出來、量它有沒有跑版。回傳 (狀態, 輸出行)。

    狀態：'ok' 全寬度乾淨 / 'bad' 有跑版 / 'skip' 沒有瀏覽器可跑。
    存在理由：跑版不在標記裡——同一份 HTML 在 390px 整片凸出、在 1440px 好好的。
    靜態掃 class 名稱猜不到，只有量出來的座標算數。
    """
    script = os.path.join(os.path.dirname(os.path.abspath(__file__)), "layout-check.mjs")
    if not shutil.which("node") or not os.path.exists(script):
        return "skip", ["找不到 node 或 layout-check.mjs"]
    try:
        env = dict(os.environ, HTML_VISUALIZER_WIDTHS=",".join(str(w) for w in WIDTHS))
        r = subprocess.run(["node", script, os.path.abspath(path)],
                           capture_output=True, text=True, timeout=180, env=env)
    except subprocess.TimeoutExpired:
        return "skip", ["渲染逾時"]
    if r.returncode == 2 or "NO_PLAYWRIGHT" in r.stderr or "NO_BROWSER" in r.stderr:
        why = ("找不到 playwright 套件（可設 HTML_VISUALIZER_PLAYWRIGHT_ROOT 指定安裝位置）"
               if "NO_PLAYWRIGHT" in r.stderr
               else "playwright 自帶 chromium 與系統 Chrome 都起不來")
        return "skip", [why]
    lines = [ln for ln in r.stdout.splitlines() if ln.strip()]
    return ("bad" if r.returncode == 1 else "ok"), lines


def check_runtime(path):
    """真的把頁面跑起來：抓載入時的 pageerror、按複製鈕看有沒有反應。回傳 (狀態, 輸出行)。

    存在理由：node --check 只證明解析得過。2026-09-09 決策頁砍掉題目地圖那段 HTML，
    腳本 qmap.remove() 對 null 炸掉，同區塊後面的複製鈕監聽器全沒掛上——
    語法、版面、拍板機制全綠，使用者按複製鈕沒反應。只有實跑抓得到。
    """
    script = os.path.join(os.path.dirname(os.path.abspath(__file__)), "runtime-check.mjs")
    if not shutil.which("node") or not os.path.exists(script):
        return "skip", ["找不到 node 或 runtime-check.mjs"]
    try:
        r = subprocess.run(["node", script, os.path.abspath(path)],
                           capture_output=True, text=True, timeout=120)
    except subprocess.TimeoutExpired:
        return "skip", ["執行逾時"]
    if r.returncode == 2 or "NO_PLAYWRIGHT" in r.stderr or "NO_BROWSER" in r.stderr:
        why = ("找不到 playwright 套件（可設 HTML_VISUALIZER_PLAYWRIGHT_ROOT 指定安裝位置）"
               if "NO_PLAYWRIGHT" in r.stderr
               else "playwright 自帶 chromium 與系統 Chrome 都起不來")
        return "skip", [why]
    lines = [ln for ln in r.stdout.splitlines() if ln.strip()]
    return ("bad" if r.returncode == 1 else "ok"), lines


def check_scale(path):
    """字級拉到 200%，量有多少文字真的變大（≥95%）；同一倍率下有沒有橫向溢出。回傳 (狀態, 輸出行)。

    存在理由：蓋章改得到 <style> 與 style="" 裡的字級，改不到腳本執行期才寫進去的行內樣式；
    改不到的字拉滑桿時不會動，同一頁大小字混雜。只有量得出來。
    """
    script = os.path.join(os.path.dirname(os.path.abspath(__file__)), "scale-check.mjs")
    if not shutil.which("node") or not os.path.exists(script):
        return "skip", ["找不到 node 或 scale-check.mjs"]
    try:
        r = subprocess.run(["node", script, os.path.abspath(path)], capture_output=True, text=True, timeout=120)
    except subprocess.TimeoutExpired:
        return "skip", ["執行逾時"]
    if r.returncode == 2 or "NO_PLAYWRIGHT" in r.stderr or "NO_BROWSER" in r.stderr:
        return "skip", ["找不到 playwright 或瀏覽器"]
    lines = [ln for ln in r.stdout.splitlines() if ln.strip()]
    m = re.search(r"橫向溢出 (\d+)px", r.stdout)
    status = "bad" if r.returncode == 1 else ("warn" if m and int(m.group(1)) > 2 else "ok")
    return status, lines


class DecisionSelectParser(HTMLParser):
    """依元素巢狀範圍找出使用下拉選單的拍板卡。"""

    def __init__(self):
        super().__init__()
        self.stack = []
        self.questions = set()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        decision = attrs.get("data-id") if "data-decision" in attrs else None
        if tag == "select":
            self.questions.update(d for _, d in self.stack if d)
        self.stack.append((tag, decision))

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break


# 畫面樣張的外層結構（2026-10-27 補）：原本只數 class="mock" 字面，editorial 的 .cmp／.mkf、spec 的 .screen
# 全數不到，帶兩張樣張的拍板頁也報「0 個畫面樣張」。一個 class 名命中就算一張；巢狀的只算最外層，
# 例：.cmp-col 裡包 .mkf 只算 1 張（.cmp 是兩欄容器、不算）。marathon 範本目前沒有這類結構
SAMPLE_CLASSES = ("mock", "ba-col", "cmp-col", "mkf", "screen")


class SampleCounter(HTMLParser):
    """數畫面樣張：命中 SAMPLE_CLASSES 的最外層元素各算一張。"""

    def __init__(self):
        super().__init__()
        self.stack = []  # (tag, 是不是樣張)
        self.total = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        cls = (attrs.get("class") or "").split()
        hit = any(c in SAMPLE_CLASSES for c in cls) and not any(s for _, s in self.stack)
        self.total += hit
        self.stack.append((tag, hit))

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break


# 會決定「東西排在哪、多大」的屬性
_LAYOUT_PROPS = ("display", "position", "grid-template-columns", "grid-template-rows",
                 "flex-direction", "float", "width", "height", "max-width", "max-height")
# 換掉排版模式的屬性——只要一邊碰這些、另一邊也在管佈局，兩套規則就會互相覆蓋
_MODEL_PROPS = ("display", "position", "grid-template-columns", "grid-template-rows",
                "flex-direction", "float")


def _css_class_table(h):
    """{class 名: {屬性: (值, 來自第幾個 style 區塊)}}；只收單一 class 選擇器。"""
    table = {}
    for bi, css in enumerate(re.findall(r"<style[^>]*>(.*?)</style>", h, re.S)):
        css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
        # @media / @supports 內層是刻意覆寫，不算撞車
        css = re.sub(r"@(?:media|supports|container)[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}", "", css, flags=re.S)
        for m in re.finditer(r"([^{}]+)\{([^{}]*)\}", css):
            for sel in m.group(1).split(","):
                mm = re.fullmatch(r"\.([A-Za-z0-9_-]+)(?::[a-z-]+)?", sel.strip())
                if not mm:
                    continue
                props = table.setdefault(mm.group(1), {})
                for decl in m.group(2).split(";"):
                    if ":" not in decl:
                        continue
                    k, v = decl.split(":", 1)
                    k = k.strip().lower()
                    if k in _LAYOUT_PROPS:
                        props[k] = (v.strip(), bi)
    return table


def check_class_collision(h):
    """同一元素掛了兩個都在管佈局的 class → 兩套規則互相覆蓋。

    回傳 (跨區塊衝突, 同區塊衝突)。跨區塊＝自訂 CSS 撞到共用樣式，是 0908 事故的形狀；
    同區塊多半是作者刻意組合（例如 .ba-grid.venn 覆寫欄數），只提示不擋。
    """
    table = _css_class_table(h)
    cross, same, seen = [], [], set()
    for m in re.finditer(r'class="([^"]+)"', h):
        names = [c for c in m.group(1).split() if c in table and table[c]]
        for i in range(len(names)):
            for j in range(i + 1, len(names)):
                a, b = names[i], names[j]
                if (a, b) in seen:
                    continue
                pa, pb = table[a], table[b]
                model = [k for k in _MODEL_PROPS if k in pa or k in pb]
                if not model:
                    continue
                seen.add((a, b))
                k = model[0]
                owner, ov = (a, pa[k]) if k in pa else (b, pb[k])
                other = b if owner == a else a
                other_blk = list((pb if owner == a else pa).values())[0][1]
                desc = f".{owner} 的 {k}={ov[0]}　vs　.{other} 也在管佈局"
                (cross if ov[1] != other_blk else same).append(
                    (f".{a} + .{b}", desc, m.group(1)[:48]))
    return cross, same


def main(path):
    global WIDTHS
    h = open(path, encoding="utf-8").read()
    decisions = re.findall(r'data-decision[^>]*data-id="([^"]+)"', h)
    kind = f"拍板類 · {len(decisions)} 題" if decisions else "純展示類"
    print(f"\n▸ {os.path.basename(path)}  （{kind}）")
    is_template = any(p in os.path.abspath(path) for p in ("/references/examples/", "/assets/", "/templates/"))
    profile_error = None
    try:
        profile, profile_exists = profile_mod.load()
    except ValueError as e:  # 設定檔寫壞：照空白設定繼續跑，但要明講
        profile, profile_exists, profile_error = dict(profile_mod.EMPTY), False, str(e)
    WIDTHS = [int(w) for w in (profile.get("checkWidths") or [390, 768, 1440])]
    stamped = False

    # ── 蓋章（檢查前先做，後面的檢查量的是蓋好的頁面）──────────
    # 範本不蓋：蓋了會把使用者自己的設定帶進範本、再被複製給別人
    head("蓋章（設定檔／字級與間距可調／調整面板）")
    if profile_error:
        report(BAD, "設定檔讀不進來：這次不蓋章，其他檢查照空白設定跑", profile_error[:140])
    if profile_error:
        # 設定檔壞了不蓋章：照空白設定蓋會把頁面上原本蓋好的設定值洗掉
        report(SKIP, "設定檔壞了，這次不蓋章", "修好設定檔再跑一次 verify")
    elif is_template:
        report(SKIP, "範本原檔不蓋章", "複製出去的產出跑 verify 時才蓋")
    elif "--no-stamp" in sys.argv:
        report(SKIP, "--no-stamp", "這次不改檔；下方字級覆蓋率也跳過")
    else:
        try:
            new, rep = stamp_mod.stamp_page(h, profile)
        except Exception as e:  # 資產壞了（例如內嵌腳本含結尾標籤）要擋下來，不能默默略過
            report(BAD, "蓋章失敗", str(e)[:100])
            new, rep = h, None
        if rep is not None:
            wrote = True
            new_changed = new != h
            if new_changed:
                try:
                    with open(path, "w", encoding="utf-8") as f:
                        f.write(new)
                    h = new
                except OSError as e:
                    wrote = False
                    report(UNVERIFIED, "未蓋章：檔案寫不進去", f"{e.__class__.__name__}（唯讀環境？）——頁面沒有套用設定檔與調整面板")
            if wrote:
                stamped = True
                src = "你的設定檔" if profile_exists else "沒有設定檔，全部沿用範本原值"
                what = "本次有更新" if new_changed else "已是最新，檔案沒有變動"
                report(OK, "已蓋章", f"{src}；{what}；調整面板 {rep['tweaks_ver']}")

    # 下面的靜態檢查量的是作者寫的內容：蓋章加上的東西（面板、設定檔變數、字級算式）先還原，否則按篇幅算的
    # 檢查會誤判（短頁被當長文件、第一題位置被往後推）。腳本健檢仍看蓋好的整頁，面板也要實際跑過
    full, h = h, stamp_mod.unstamp(h)

    # ── 結構完整性 ───────────────────────────────
    head("結構完整性")
    depth = h.count("<div") - h.count("</div>")
    report(OK if depth == 0 else BAD, "div 標籤平衡", "" if depth == 0 else f"收支差 {depth}")
    so, sc = h.count("<section"), h.count("</section>")
    report(OK if so == sc else BAD, f"section {so} 段", "" if so == sc else f"未閉合 {so - sc}")
    # 結束標籤重複（2026-10-27 加）：存檔時的格式化工具會替暫存片段補一組 </body></html>，
    # 拼回整頁後中間多出一組，後面的評論系統與腳本就落在 </html> 之後。三個代理同一晚各撞一次
    n_end = len(re.findall(r"</html\s*>", h, re.I))
    n_body = len(re.findall(r"</body\s*>", h, re.I))
    report(OK if n_end <= 1 and n_body <= 1 else BAD, "結束標籤不重複",
           "" if n_end <= 1 and n_body <= 1 else f"</body> {n_body} 個、</html> {n_end} 個：刪掉中間那組，內容要在唯一的 </body> 之前")
    if "<title>" in h:
        title = re.search(r"<title>(.*?)</title>", h, re.S)
        t = title.group(1).strip() if title else ""
        bad_title = (not t) or t in ("Untitled", "Document")
        report(BAD if bad_title else OK, "標題已命名", t[:46])
    else:
        report(BAD, "缺 <title>")

    # ── 腳本健檢 ─────────────────────────────────
    # 靜態檢查全過、但腳本跑不起來 → 所有互動靜默失效（2026-08-13 實際踩過）
    scripts = inline_scripts(full)
    if scripts:
        head("腳本健檢")
        can_check, js_fails = check_js_syntax(full)
        if not can_check:
            report(UNVERIFIED, "JS 語法檢查", "找不到 node，無法驗證腳本能否解析")
        elif js_fails:
            for idx, msg in js_fails:
                report(BAD, f"第 {idx + 1} 個 script 區塊語法錯", msg[:80])
            report(BAD, "腳本無法解析 → 互動全部失效", "修好再 open")
        else:
            report(OK, f"{len(scripts)} 個 script 區塊語法通過", "node --check")

        missing = check_js_dom_refs(full)
        report(OK if not missing else WARN, "JS 參照的元素都存在",
               "" if not missing else f"HTML 裡找不到 {missing[:4]}（動態產生的可忽略；下方執行期健檢會實跑確認）")

        # 執行期健檢：靜態檢查永遠有下一種漏法，只有「載入→有沒有炸→按下去有沒有變」不會漏
        if "--no-layout" not in sys.argv:
            status, lines = check_runtime(path)
            if status == "skip":
                report(UNVERIFIED, "執行期健檢", "；".join(lines) + "——沒跑到不等於通過")
            elif status == "bad":
                report(BAD, "腳本執行期出錯或按鈕沒反應", "同一個 script 區塊裡炸掉之後的監聽器全沒掛上")
                for ln in lines:
                    print("     " + ln)
            else:
                report(OK, "執行期健檢", "載入無 pageerror；拍板按鈕按了有反應")

    # ── 樣式健檢 ─────────────────────────────────
    styles = inline_styles(h)
    if styles:
        head("樣式健檢")
        css_fails = check_css_syntax(h)
        if css_fails:
            for idx, msg in css_fails:
                report(BAD, f"第 {idx} 個 style 區塊解析中斷", msg)
            report(BAD, "此錯之後的 CSS 全部會被瀏覽器丟棄", "括號總數平衡也看不出來，必修")
        else:
            report(OK, f"{len(styles)} 個 style 區塊解析通過", "無孤兒屬性／未收尾規則")

        # class 撞車：0908 事故的直接根因——為了讓「每段都有視覺元件」變綠而套用
        # 共用樣式已定義的 .timeline，兩套佈局互相覆蓋、中文被壓成一個字一行
        cross, same = check_class_collision(h)
        if cross:
            report(BAD, f"class 撞車 {len(cross)} 組", "自訂樣式與共用樣式定義了同一個 class 名")
            for pair, desc, sample in cross[:4]:
                print(f"       {pair}：{desc}")
                print(f"         出現在 class=\"{sample}\"")
            print("       改法：換一個沒被定義過的 class 名（套用前先 rg '\\.<名字>\\s*{' 確認）")
        elif same:
            report(WARN, f"同區塊 class 組合 {len(same)} 組", "多半是刻意覆寫，確認是你要的即可")
        else:
            report(OK, "無 class 撞車", "沒有元素同時掛兩個管佈局的 class")

    # ── 浮動說明窗 ───────────────────────────────
    # 先拿掉腳本：探索層腳本的檔頭註解有 data-detail-open="<id>" 範例，§6.7 又規定整支不改內容貼進頁面
    h_markup = re.sub(r"<script\b[^>]*>.*?</script\s*>", " ", h, flags=re.S | re.I)
    details = re.findall(r'<template[^>]*\bdata-detail="([^"]+)"', h_markup)
    if details:
        head("浮動說明窗")
        # 只算探索層容器裡的節點：沒包 data-explore 的圖，腳本不會接上點擊
        # 只取 svg.xplore 本身（容器裡圖前面若有圖示 svg，抓「第一個 </svg>」會漏掉後面的節點）
        xp_html = "".join(re.findall(r'<svg\b[^>]*\bxplore\b[^>]*>.*?</svg>', h_markup, re.S))
        node_ids = set(re.findall(r'<g\b[^>]*\bclass="node[^"]*"[^>]*\bdata-id="([^"]+)"', xp_html))
        node_ids |= set(re.findall(r'<g\b[^>]*\bdata-id="([^"]+)"[^>]*\bclass="node', xp_html))
        openers = set(re.findall(r'data-detail-open="([^"]+)"', h_markup))
        orphan = sorted(set(details) - node_ids - openers)
        report(OK if not orphan else BAD, f"{len(details)} 段說明都對得到格子或按鈕",
               "" if not orphan else f"這些 template 對不到探索層容器（div[data-explore]）裡的節點，也沒有 data-detail-open：{orphan[:6]}——小圖要說明也得包 data-explore")
        dangling = sorted(openers - set(details))
        if dangling:
            report(BAD, "data-detail-open 指向不存在的說明", str(dangling[:6]))
        if "diagram-explore" not in h and "xp-panel" not in h:
            report(BAD, "寫了說明但沒內嵌探索層腳本", "把 assets/diagram-explore.{css,js} 整段貼進頁面")

    # ── Session 識別 ─────────────────────────────
    head("Session 識別")
    # 範本原檔本來就該留空（複製去用時才填），不算未過
    m = re.search(r'VT_SESSION\s*=\s*\{[^}]*label:\s*"([^"]*)"', h, re.S)
    if not m:
        report(SKIP if is_template else BAD, "未內建識別 snippet",
               "範本原檔的預期狀態" if is_template else "見 references/session-identity.md")
    elif not m.group(1):
        report(SKIP if is_template else BAD, "識別留空",
               "範本原檔的預期狀態" if is_template else "跑 scripts/session-label.sh 取值後填入")
    else:
        report(OK, "已填值", m.group(1))

    # ── 拍板機制 ─────────────────────────────────
    if decisions:
        head("拍板機制")
        names = {n for n in re.findall(r'name="([^"]+)"', h) if not n.startswith("${") and n != "viewport"}
        gv = set(re.findall(r'getValue\("([^"]+)"\)', h))
        gc = set(re.findall(r'getComment\("([^"]+)"\)', h))
        cf = {x for x in re.findall(r'data-comment-for="([^"]+)"', h) if not x.startswith("${")}
        did = set(decisions)

        if did == names == gv:
            report(OK, f"決策卡 ↔ 選項 ↔ 摘要 三方一致", f"{len(did)} 題")
        else:
            report(BAD, "決策卡 / 選項 / 摘要 對不上",
                   f"卡{sorted(did - gv) or '·'} 摘要{sorted(gv - did) or '·'}")

        missing_box = did - cf
        report(OK if not missing_box else BAD, "每題都有補充框",
               "" if not missing_box else f"缺 {sorted(missing_box)}")
        not_read = cf - gc
        report(OK if not not_read else BAD, "補充框都被摘要抓取",
               "" if not not_read else f"沒抓 {sorted(not_read)}")

        trio = [
            (len(re.findall(r"window\.vtCollectComments\s*=", h)) >= 1, "評論收集器已定義"),
            (len(re.findall(r"vtCollectComments\?\.\(\)", h)) >= 1, "摘要有拼接評論"),
            (len(re.findall(r"window\.vtBuildDecisionExport", h)) >= 1, "已註冊匯出函式"),
        ]
        miss = [n for ok, n in trio if not ok]
        report(OK if not miss else BAD, "複製摘要三件套", "" if not miss else "缺：" + "、".join(miss))
        # 不預設勾選（2026-08-22 起；2026-10-27 範本仍有 18 題預設勾選、進度一開就 18/19，
        # 讀者分不出哪些是自己拍的）。推薦項改用 data-recommended＋「推薦」膠囊
        pre = sorted({n for n in did if re.search(r'<input\b[^>]*\bname="' + re.escape(n) + r'"[^>]*\bchecked\b', h_markup)
                      or re.search(r'<input\b[^>]*\bchecked\b[^>]*\bname="' + re.escape(n) + r'"', h_markup)})
        report(OK if not pre else BAD, "拍板選項不預設勾選",
               "" if not pre else f"{len(pre)} 題預設勾選 {pre[:6]}：拿掉 checked，推薦項改標 data-recommended")
        selects = DecisionSelectParser()
        selects.feed(h)
        report(OK if not selects.questions else BAD, "無下拉選單",
               "" if not selects.questions else f"拍板題 {sorted(selects.questions)} 請用單選按鈕")

        # 範本 placeholder 沒砍乾淨 → 使用者會在摘要看到不相干的舊題目
        PLACEHOLDER = {"b-1", "b-2", "b-3", "b-4", "c-1", "c-2", "c-3", "c-4", "c-5", "c-6",
                       "memory-1", "memory-2", "memory-3", "e-mode", "f-mode", "f-push",
                       "d-229", "d-230", "d-231"}
        left = did & PLACEHOLDER
        if is_template:
            report(SKIP, "範本 placeholder", "本身就是範本，不檢查")
        else:
            report(OK if not left else BAD, "無範本 placeholder 殘留",
                   "" if not left else f"複製範本後沒砍乾淨：{sorted(left)}")

        # ── 閱讀動線 ──
        head("閱讀動線")
        # 用「可見文字」算比例，不用原始碼字元（2026-10-27 改）：head 裡的 CSS 動輒佔整檔三成、
        # 格式化工具把整份展開又會改行數，原算法量的是原始碼長相、不是讀者要捲多遠。
        # 實例：editorial 範例原算法 38% 過關，可見文字 54%；spec 範例原算法 42% 不過，實際畫面 23%。
        def _vis_len(x):
            return len(re.sub(r"\s+", "", visible_text(x)))
        cut = h.find("data-decision")
        pos = _vis_len(h[:cut]) / max(1, _vis_len(h)) * 100
        has_map = "qmap-list" in h
        if pos <= 40:
            report(OK, f"第一題位置 {pos:.0f}%", "以可見文字計")
        elif has_map:
            report(OK, f"第一題位置 {pos:.0f}%", "超過 40%，但開頭有題目地圖可直接跳題")
        else:
            report(BAD, f"第一題位置 {pos:.0f}%", "門檻 40%（以可見文字計）；題目往前放，或在開頭放題目地圖（qmap-list）讓只想拍板的讀者直接跳")
        if len(decisions) >= 5:
            report(OK if "qmap-list" in h else BAD, "題數 ≥ 5，有題目地圖")
        else:
            report(SKIP, "題數 < 5，題目地圖可省", "第一題位置 > 40% 時仍要放（上一項會擋）")
        sc_ = SampleCounter()
        sc_.feed(h_markup)
        report(WARN, "UI 決策題需人工確認",
               f"{sc_.total} 個畫面樣張 / {len(decisions)} 題（涉及畫面的題每題應有 2 個：現況＋改後）")

    # ── 純展示 ───────────────────────────────────
    else:
        head("純展示骨架")
        long_doc = len(h) > 40000
        # class 清單含完整的 reveal 即可（例：class="reveal rv"）；reveal-x 這類不算
        has_reveal = re.search(r'class="(?:[^"]*\s)?reveal(?:\s[^"]*)?"', h) is not None
        if long_doc:
            report(OK if has_reveal else BAD, "長文件有漸進揭露",
                   "" if has_reveal else "細節應收進 <details class=\"reveal\">")
        else:
            report(SKIP, "篇幅不長，漸進揭露非必要")

    ids = re.findall(r'<section id="([^"]+)"', h)
    report(SKIP, "段落順序需人工對照骨架", " → ".join(ids) if ids else "（無 section）")

    # ── 版面健檢 ─────────────────────────────────
    # 最常見的產出缺陷是跑版，而它只有渲染出來才看得到（實際事故：自檢全綠但頁面跑版）
    if "--no-layout" not in sys.argv:
        head("版面健檢")
        status, lines = check_layout(path)
        if status == "skip":
            report(UNVERIFIED, "跑版檢查", (lines[0] if lines else "") + " → 未驗證，不等於通過")
        elif status == "ok":
            report(OK, f"{len(WIDTHS)} 個寬度無跑版、小字對比與列印都過", " / ".join(str(w) for w in WIDTHS) + "px（設定檔 checkWidths）")
        else:
            report(BAD, "偵測到跑版或可讀性問題", "詳如下（含小字對比不足、列印看不見、標題孤字）")
            for ln in lines:
                if "RADIO_HIDDEN" not in ln:
                    print("     " + ln)
        # 拍板選項要鍵盤選得到（2026-10-27 加，防 editorial 範本的 display:none 重犯）
        if decisions and status == "skip":
            report(UNVERIFIED, "拍板選項鍵盤選得到",
                   (lines[0] if lines else "瀏覽器沒跑起來") + "——量不到 radio 的實際樣式，未驗證不等於通過")
        elif decisions:
            hid = [ln.strip() for ln in lines if "RADIO_HIDDEN" in ln]
            report(OK if not hid else BAD, "拍板選項鍵盤選得到",
                   "radio 沒有用 display:none／visibility:hidden" if not hid else
                   hid[0].replace("RADIO_HIDDEN ", "") + "　這幾題的 radio 被 display:none 或 visibility:hidden 藏起來，Tab 落不到——改成 opacity:0＋position:absolute，label 加 :has(input:focus-visible) 外框（見 interaction-patterns.md § Radio pills）")

    # 看標記不看腳本：蓋章注入的風格設定腳本字串裡有 <svg，不該讓每一頁都跑 SVG 檢查
    if "<svg" in h_markup.lower():
        head("SVG 文字檢查")
        if not shutil.which("node"):
            report(UNVERIFIED, "SVG 文字檢查", "找不到 node → 未驗證，不等於通過")
        else:
            script = os.path.join(os.path.dirname(os.path.abspath(__file__)), "svg-text-check.mjs")
            try:
                r = subprocess.run(["node", script, os.path.abspath(path)],
                                   capture_output=True, text=True, timeout=180)
            except subprocess.TimeoutExpired:
                report(BAD, "SVG 文字檢查", "渲染逾時")
            else:
                report(OK if r.returncode == 0 else
                       UNVERIFIED if r.returncode == 2 or "browserType.launch:" in r.stderr else BAD,
                       "SVG 文字檢查")
                if r.returncode != 0:
                    for ln in (r.stdout + r.stderr).splitlines()[:6]:
                        print("     " + ln)

    # ── 設定檔與調整面板 ─────────────────────────
    head("設定檔與調整面板")
    if (profile.get("checks") or {}).get("noEmoji"):
        # 程式碼區塊不算：引用終端機輸出（✓ passed）是原文照貼
        found = EMOJI.findall(visible_text(re.sub(r"<(pre|code)\b.*?</\1>", " ", h, flags=re.S | re.I)))
        report(OK if not found else BAD, "不用 emoji（設定檔要求）",
               "" if not found else f"可見文字有 {len(found)} 個：{''.join(dict.fromkeys(found))[:20]}——換成 inline SVG 圖示或拿掉")
    else:
        report(SKIP, "emoji 檢查", "設定檔沒開 checks.noEmoji")
    m = re.search(r'<script[^>]*\bid="vt-tweaks"[^>]*>(.*?)</script>', h, re.S)
    if m:
        try:
            items = json.loads(m.group(1))
            problems = [f"{it.get('id', '?')} 缺 hint" for it in items if not it.get("hint")]
            problems += [f"{it.get('id', '?')} 選項少於 2" for it in items if len(it.get("options") or []) < 2]
            if len(items) > 3:
                problems.append(f"共 {len(items)} 項（上限 3）")
            report(OK if not problems else BAD, f"內容層調整 {len(items)} 項", "；".join(problems))
        except ValueError as e:
            report(BAD, "內容層調整宣告不是合法 JSON", str(e)[:80])
    if not stamped or "--no-layout" in sys.argv:
        # 沒蓋到章的頁字級本來就沒轉，量了只會得到 0% 和錯誤改法
        report(SKIP, "字級覆蓋率", "範本／未蓋章／--no-layout 不量")
    else:
        status, lines = check_scale(path)
        if status == "skip":
            report(UNVERIFIED, "字級覆蓋率", "；".join(lines) + "——沒跑到不等於通過")
        else:
            mark = {"ok": OK, "warn": WARN}.get(status, BAD)
            report(mark, "字級覆蓋率", (lines[0] if lines else "") + ("（200% 時有橫向溢出，只提醒）" if status == "warn" else ""))
            for ln in lines[1:]:
                print("     " + ln)
            if status == "bad":
                print("     改法：腳本動態產生的行內字級要自己寫成 calc(Npx * var(--fs, 1))；整塊不該縮放的加 data-tw-lock")
    rules = profile.get("rules") or []
    if rules:
        report(WARN, f"設定檔文字規則 {len(rules)} 條要親看", "機器判斷不了，逐條對一次")
        for r in rules:
            print(f"       · {r}")

    # ── 呈現品質 ─────────────────────────────────
    head("呈現品質")
    VIS = ["<table", 'class="card', 'class="mock', 'class="steps', 'class="layers',
           'class="seq', 'class="ba-grid', "stat-card", "<details", 'class="analogy',
           'class="def-card', "highlight-box", 'class="myth', "choice", "metric",
           "tree-node", "flow-stage", "timeline", "termbox", "filerow", "pg-strip", "axis-item",
           'class="bound', 'class="tokrow', "commit-box", "qa-step", "mock-table", "adr-table",
           'class="figure', "<svg", "<pre"]
    # 寫死的名單追不上自訂樣式名 —— 2026-09-20 一天內把 6 個有卡片結構的段落誤判成
    # 純文字（verdict-card / open-list / persona-grid / rec-list / plan…）。補一條形態
    # 判斷：樣式名以常見結構後綴結尾的，一律算視覺元件。
    STRUCT = re.compile(
        r'class="[^"]*\b[a-z][a-z0-9-]*-'
        r'(card|cards|grid|list|row|rows|box|panel|pane|step|steps|table|chart|bar|bars'
        r'|tile|tiles|strip|cell|col|cols|fig|figure|mock|badge|tag|matrix|track|lane)\b'
    )
    plain = []
    for m in re.finditer(r'<section id="([^"]+)"(.*?)</section>', h, re.S):
        body_ = m.group(2)
        if not any(v in body_ for v in VIS) and not STRUCT.search(body_):
            plain.append(m.group(1))
    # assets/ 下的起手骨架只有佔位段落，不適用此檢查
    if "/assets/" in os.path.abspath(path):
        report(SKIP, "每段都有視覺元件", "起手骨架，佔位段落不算")
    else:
        report(OK if not plain else BAD, "每段都有視覺元件",
               "" if not plain else f"純文字段落：{plain}")

    # 回傳列（2026-10-27 加）：每頁都要讓讀者知道能反白留言、一鍵複製給 AI。
    # 評審實測：教學頁拿掉了評論系統、規格頁只有頁尾一顆按鈕，讀者讀完有意見只能另開對話打字
    has_bar = 'class="sticky-bar' in h_markup and 'id="preview-btn"' in h_markup and 'id="copy-btn"' in h_markup
    has_comments = "vtCollectComments" in h
    if has_bar and has_comments:
        report(OK, "回傳列＋反白留言", "底部列有預覽與複製，全頁評論已內建")
    else:
        miss = [x for x, ok in (("底部回傳列（sticky-bar＋preview-btn＋copy-btn）", has_bar), ("全頁評論系統", has_comments)) if not ok]
        report(BAD, "回傳列＋反白留言", "缺：" + "、".join(miss) + "（照 base-template 的回傳列三段整段複製）")

    # 視覺手法重複（軟規則、只報數不擋）—— 取自 taste-skill §4.7：每段都放一條
    # 大寫寬字距小標，會產生同樣的模板化節奏。判準用它給的 CSS 特徵（同一條規則裡
    # 同時有 uppercase 與 letter-spacing），不是靠樣式名猜。
    style_txt = h[h.find("<style"):h.rfind("</style>")] if "<style" in h else ""
    eb_classes = {
        m.group(1)
        for m in re.finditer(r"\.([a-z][a-z0-9-]*)\s*\{([^}]*)\}", style_txt)
        if "uppercase" in m.group(2) and "letter-spacing" in m.group(2)
    }
    body_txt = h[h.find("<body"):]
    eb_uses = sum(
        len(re.findall(r'class="[^"]*\b' + re.escape(c) + r'\b', body_txt))
        for c in eb_classes
    )
    sec_n = len(re.findall(r"<section[ >]", h))
    cap = max(1, sec_n // 3)
    if not eb_classes:
        report(SKIP, "大寫寬字距小標", "沒有這種樣式")
    else:
        report(OK if eb_uses <= cap else WARN,
               f"大寫寬字距小標 {eb_uses} 個",
               "" if eb_uses <= cap else f"建議上限 {cap}（每 3 段 1 個）· 軟規則不擋")

    words = load_mixed_words()
    text = visible_text(h)
    hits = []
    for w in words:
        if re.search(r"(?<![A-Za-z])" + re.escape(w) + r"(?![A-Za-z])", text, re.I):
            hits.append(w)
    if not words:
        report(UNVERIFIED, "中英混雜詞", "找不到對照表，無法驗證")
    else:
        report(OK if not hits else WARN, f"中英混雜詞 {len(hits)} 處",
               "、".join(hits[:8]) + ("…" if len(hits) > 8 else ""))

    # ── 總結 ─────────────────────────────────────
    good = sum(1 for m, _, _ in results if m == OK)
    bad = sum(1 for m, _, _ in results if m == BAD)
    warn = sum(1 for m, _, _ in results if m == WARN)
    skipped = sum(1 for m, _, _ in results if m == SKIP)
    unverified = sum(1 for m, _, _ in results if m == UNVERIFIED)
    print(f"\n  {good} 項通過 · {bad} 項未過 · {unverified} 項未驗證 · {skipped} 項刻意跳過 · {warn} 項待人工確認")
    if bad:
        print("  → 修完再 open，不要先開給人看\n")
    elif unverified:
        print(f"  → {unverified} 項未驗證，未驗證不等於通過\n")
    else:
        print("  → 可以 open\n")
    return 1 if bad else 0


if __name__ == "__main__":
    # 旗標（--no-layout）由 main 自己讀 sys.argv，這裡只挑出檔案參數
    # （0907 實踩：原本寫死 len(sys.argv) != 2，帶了 --no-layout 就直接印用法退出）
    files = [a for a in sys.argv[1:] if not a.startswith("-")]
    if len(files) != 1:
        print(__doc__)
        sys.exit(2)
    if not os.path.exists(files[0]):
        print(f"找不到檔案：{files[0]}")
        sys.exit(2)
    sys.exit(main(files[0]))
