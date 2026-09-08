#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""html-visualizer 產出自檢 — 一行跑完 SKILL.md Step 3 的所有檢查。

用法：
    python3 <skill 目錄>/scripts/verify.py <file.html>

規則來源：SKILL.md § Step 3。
會依產出類型自動分流：有拍板題跑拍板類檢查，純展示跑骨架與呈現檢查。

exit code：0 = 全過（或僅剩待人工確認），1 = 有項目未過。
"""
import re
import sys
import os
import shutil
import subprocess
import tempfile
from html.parser import HTMLParser

SKILL_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
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
        r = subprocess.run(["node", script, os.path.abspath(path)],
                           capture_output=True, text=True, timeout=180)
    except subprocess.TimeoutExpired:
        return "skip", ["渲染逾時"]
    if r.returncode == 2 or "NO_PLAYWRIGHT" in r.stderr:
        return "skip", ["找不到 playwright／chromium"]
    lines = [ln for ln in r.stdout.splitlines() if ln.strip()]
    return ("bad" if r.returncode == 1 else "ok"), lines


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
    h = open(path, encoding="utf-8").read()
    decisions = re.findall(r'data-decision[^>]*data-id="([^"]+)"', h)
    kind = f"拍板類 · {len(decisions)} 題" if decisions else "純展示類"
    print(f"\n▸ {os.path.basename(path)}  （{kind}）")

    # ── 結構完整性 ───────────────────────────────
    head("結構完整性")
    depth = h.count("<div") - h.count("</div>")
    report(OK if depth == 0 else BAD, "div 標籤平衡", "" if depth == 0 else f"收支差 {depth}")
    so, sc = h.count("<section"), h.count("</section>")
    report(OK if so == sc else BAD, f"section {so} 段", "" if so == sc else f"未閉合 {so - sc}")
    if "<title>" in h:
        title = re.search(r"<title>(.*?)</title>", h, re.S)
        t = title.group(1).strip() if title else ""
        bad_title = (not t) or t in ("Untitled", "Document")
        report(BAD if bad_title else OK, "標題已命名", t[:46])
    else:
        report(BAD, "缺 <title>")

    # ── 腳本健檢 ─────────────────────────────────
    # 靜態檢查全過、但腳本跑不起來 → 所有互動靜默失效（2026-08-13 實際踩過）
    scripts = inline_scripts(h)
    if scripts:
        head("腳本健檢")
        can_check, js_fails = check_js_syntax(h)
        if not can_check:
            report(UNVERIFIED, "JS 語法檢查", "找不到 node，無法驗證腳本能否解析")
        elif js_fails:
            for idx, msg in js_fails:
                report(BAD, f"第 {idx + 1} 個 script 區塊語法錯", msg[:80])
            report(BAD, "腳本無法解析 → 互動全部失效", "修好再 open")
        else:
            report(OK, f"{len(scripts)} 個 script 區塊語法通過", "node --check")

        missing = check_js_dom_refs(h)
        report(OK if not missing else WARN, "JS 參照的元素都存在",
               "" if not missing else f"HTML 裡找不到 {missing[:4]}（動態產生的可忽略）")

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

    # ── Session 識別 ─────────────────────────────
    head("Session 識別")
    # 範本原檔本來就該留空（複製去用時才填），不算未過
    is_template = any(p in os.path.abspath(path) for p in ("/references/examples/", "/assets/", "/templates/"))
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
        pos = h.find("data-decision") / len(h) * 100
        report(OK if pos <= 40 else BAD, f"第一題位置 {pos:.0f}%", "門檻 40%" if pos > 40 else "")
        if len(decisions) >= 5:
            report(OK if "qmap-list" in h else BAD, "題數 ≥ 5，有題目地圖")
        else:
            report(SKIP, "題數 < 5，免題目地圖")
        mocks = h.count('class="mock"')
        report(WARN, "UI 決策題需人工確認",
               f"{mocks} 個畫面樣張 / {len(decisions)} 題（涉及畫面的題每題應有 2 個）")

    # ── 純展示 ───────────────────────────────────
    else:
        head("純展示骨架")
        long_doc = len(h) > 40000
        has_reveal = 'class="reveal"' in h
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
            report(OK, "三個寬度無跑版", "390 / 768 / 1440px")
        else:
            report(BAD, "偵測到跑版", "詳如下")
            for ln in lines:
                print("     " + ln)

    if "<svg" in h.lower():
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

    # ── 呈現品質 ─────────────────────────────────
    head("呈現品質")
    VIS = ["<table", 'class="card', 'class="mock', 'class="steps', 'class="layers',
           'class="seq', 'class="ba-grid', "stat-card", "<details", 'class="analogy',
           'class="def-card', "highlight-box", 'class="myth', "choice", "metric",
           "tree-node", "flow-stage", "timeline", "termbox", "filerow", "pg-strip", "axis-item",
           'class="bound', 'class="tokrow', "commit-box", "qa-step", "mock-table", "adr-table",
           'class="figure', "<svg"]
    plain = []
    for m in re.finditer(r'<section id="([^"]+)"(.*?)</section>', h, re.S):
        if not any(v in m.group(2) for v in VIS):
            plain.append(m.group(1))
    # assets/ 下的起手骨架只有佔位段落，不適用此檢查
    if "/assets/" in os.path.abspath(path):
        report(SKIP, "每段都有視覺元件", "起手骨架，佔位段落不算")
    else:
        report(OK if not plain else BAD, "每段都有視覺元件",
               "" if not plain else f"純文字段落：{plain}")

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
