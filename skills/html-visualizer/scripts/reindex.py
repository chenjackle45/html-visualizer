#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""掃描 HTML 產出歸檔目錄，重建索引頁。

用法：
    python3 <skill 目錄>/scripts/reindex.py [歸檔目錄]

預設目錄 ~/Documents/claude-html/，結構：
    claude-html/
      index.html      ← 本 script 產生，別手改
      2026-07/*.html  ← 依月份分的產出

索引頁依日期倒序、標出每份是哪個 session 產的（顏色與產出頁首色帶同一套雜湊，
所以顏色可以對得起來），並帶即時篩選。
"""
import os
import re
import sys
import html as _html
from datetime import datetime

ROOT = os.path.expanduser(sys.argv[1] if len(sys.argv) > 1 else os.environ.get("HTML_VISUALIZER_ARCHIVE_DIR", "~/Documents/claude-html"))


def hue_of(seed):
    """跟 session-identity snippet 同一套雜湊，顏色才對得起來。"""
    h = 7
    for c in seed:
        h = (h * 31 + ord(c)) % 360
    return h


def parse(path):
    try:
        raw = open(path, encoding="utf-8").read()
    except Exception:
        return None
    m = re.search(r"<title>(.*?)</title>", raw, re.S)
    title = re.sub(r"\s+", " ", m.group(1)).strip() if m else os.path.basename(path)
    s = re.search(r'VT_SESSION\s*=\s*\{[^}]*label:\s*"([^"]*)"[^}]*id:\s*"([^"]*)"', raw, re.S)
    label, sid = (s.group(1), s.group(2)) if s else ("", "")
    pj = re.search(r'VT_SESSION\s*=\s*\{[^}]*project:\s*"([^"]*)"', raw, re.S)
    project = pj.group(1) if pj else ""
    fn = os.path.basename(path)
    d = re.search(r"(\d{4}-\d{2}-\d{2})", fn)
    date = d.group(1) if d else datetime.fromtimestamp(os.path.getmtime(path)).strftime("%Y-%m-%d")
    return {
        "path": os.path.relpath(path, ROOT),
        "title": title,
        "label": label,
        "id": sid,
        "date": date,
        "mtime": os.path.getmtime(path),
        "size": os.path.getsize(path),
        "project": project,
    }


def collect():
    items = []
    for dirpath, _, files in os.walk(ROOT):
        for f in files:
            if not f.endswith(".html") or f == "index.html":
                continue
            it = parse(os.path.join(dirpath, f))
            if it:
                items.append(it)
    items.sort(key=lambda x: (x["date"], x["mtime"]), reverse=True)
    return items


def render(items):
    sessions = {}
    for it in items:
        key = it["label"] or "（未標記來源）"
        sessions.setdefault(key, {"n": 0, "id": it["id"] or key})
        sessions[key]["n"] += 1

    rows = []
    cur_month = None
    for it in items:
        month = it["date"][:7]
        if month != cur_month:
            cur_month = month
            rows.append(f'<div class="month">{month}</div>')
        seed = it["id"] or it["label"] or it["title"]
        col = f"hsl({hue_of(seed)} 58% 42%)" if it["label"] else "var(--g300)"
        label = _html.escape(it["label"] or "—")
        rows.append(
            f'<a class="row" href="{_html.escape(it["path"])}" '
            f'data-s="{_html.escape((it["title"] + " " + it["label"] + " " + it["project"]).lower())}">'
            f'<span class="dot" style="background:{col}"></span>'
            f'<span class="ti">{_html.escape(it["title"])}</span>'
            + (f'<span class="pj">{_html.escape(it["project"])}</span>' if it["project"] else "")
            +
            f'<span class="ss">{label}</span>'
            f'<span class="dt">{it["date"]}</span></a>'
        )

    chips = "".join(
        f'<span class="chip"><span class="dot" style="background:hsl({hue_of(v["id"])} 58% 42%)"></span>'
        f'{_html.escape(k)}<b>{v["n"]}</b></span>'
        for k, v in sorted(sessions.items(), key=lambda kv: -kv[1]["n"])
    )

    return f"""<!doctype html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>產出索引 · {len(items)} 份</title>
<style>
:root {{
  --ivory:#faf9f5; --paper:#fff; --slate:#141413; --clay:#d97757; --clay-d:#b85c3e;
  --clay-soft:#fbe9df; --oat:#e3dacc; --g100:#f0eee6; --g200:#e6e3da; --g300:#d1cfc5;
  --g500:#87867f; --g700:#3d3d3a;
  --serif:ui-serif,Georgia,"Times New Roman",serif;
  --sans:system-ui,-apple-system,"PingFang TC","Noto Sans TC",sans-serif;
  --mono:ui-monospace,"SF Mono",Menlo,monospace;
}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--ivory);color:var(--slate);font-family:var(--sans);font-size:15px;line-height:1.6;-webkit-font-smoothing:antialiased}}
.wrap{{width:min(94vw,1080px);margin:0 auto;padding:0 28px}}
h1{{font-family:var(--serif);font-weight:500;margin:0;font-size:clamp(28px,3.4vw,40px);letter-spacing:-.012em}}
h1 em{{font-style:italic;color:var(--clay)}}
.eyebrow{{font-family:var(--mono);font-size:11.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--g500);display:flex;align-items:center;gap:12px}}
.eyebrow::before{{content:"";width:24px;height:1.5px;background:var(--clay)}}
header{{border-bottom:1.5px solid var(--g300);padding:40px 0 26px}}
.chips{{display:flex;flex-wrap:wrap;gap:7px;margin-top:18px}}
.chip{{display:inline-flex;align-items:center;gap:7px;font-size:12.5px;padding:4px 12px;border:1.5px solid var(--g300);border-radius:999px;background:var(--paper);color:var(--g700)}}
.chip b{{font-family:var(--mono);font-size:11px;color:var(--g500);font-weight:600}}
.dot{{width:9px;height:9px;border-radius:3px;flex-shrink:0}}
#q{{width:100%;margin:22px 0 4px;padding:11px 15px;border:1.5px solid var(--g300);border-radius:10px;font-family:var(--sans);font-size:14px;background:var(--paper);color:var(--slate)}}
#q:focus{{outline:2px solid var(--clay-soft);border-color:var(--clay)}}
.month{{font-family:var(--mono);font-size:11px;letter-spacing:.1em;color:var(--g500);margin:22px 0 8px;text-transform:uppercase}}
.row{{display:flex;align-items:center;gap:12px;padding:11px 15px;border:1.5px solid var(--g300);border-radius:10px;margin-bottom:6px;background:var(--paper);text-decoration:none;color:var(--slate);transition:all .15s}}
.row:hover{{border-color:var(--slate);transform:translateY(-1px)}}
.row .ti{{flex:1;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}}
.row .pj{{font-family:var(--mono);font-size:10px;color:var(--g700);background:var(--g100);border:1px solid var(--g200);border-radius:4px;padding:1px 7px;flex-shrink:0}}
.row .ss{{font-family:var(--mono);font-size:10.5px;color:var(--g500);max-width:230px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}}
.row .dt{{font-family:var(--mono);font-size:11px;color:var(--g500);flex-shrink:0}}
.row.hide{{display:none}}
.empty{{text-align:center;color:var(--g500);font-size:13.5px;padding:40px 0}}
footer{{padding:34px 0;text-align:center;border-top:1.5px solid var(--g300);margin-top:34px}}
footer .glyph{{font-family:var(--serif);font-style:italic;font-size:26px;color:var(--clay)}}
footer .meta{{font-family:var(--mono);font-size:11px;color:var(--g500);margin-top:10px;letter-spacing:.1em;text-transform:uppercase}}
@media (max-width:720px){{.row .ss,.row .pj{{display:none}}}}
</style>
</head>
<body>
<header><div class="wrap">
  <div class="eyebrow">產出索引 · 自動維護</div>
  <h1>共 <em>{len(items)}</em> 份</h1>
  <div class="chips">{chips}</div>
</div></header>
<div class="wrap">
  <input id="q" placeholder="輸入關鍵字篩選標題或 session…" autocomplete="off" />
  {"".join(rows) if rows else '<div class="empty">還沒有任何產出</div>'}
</div>
<footer>
  <div class="glyph">∾</div>
  <div class="meta">最後更新 {datetime.now().strftime("%Y-%m-%d %H:%M")}</div>
</footer>
<script>
  const q = document.getElementById("q");
  const rows = [...document.querySelectorAll(".row")];
  q.addEventListener("input", () => {{
    const v = q.value.trim().toLowerCase();
    rows.forEach(r => r.classList.toggle("hide", v && !r.dataset.s.includes(v)));
    document.querySelectorAll(".month").forEach(m => {{
      let n = m.nextElementSibling, any = false;
      while (n && n.classList.contains("row")) {{
        if (!n.classList.contains("hide")) any = true;
        n = n.nextElementSibling;
      }}
      m.style.display = any ? "" : "none";
    }});
  }});
  q.focus();
</script>
</body>
</html>
"""


if __name__ == "__main__":
    os.makedirs(ROOT, exist_ok=True)
    items = collect()
    out = os.path.join(ROOT, "index.html")
    open(out, "w", encoding="utf-8").write(render(items))
    print(f"索引已更新：{out}（{len(items)} 份）")
