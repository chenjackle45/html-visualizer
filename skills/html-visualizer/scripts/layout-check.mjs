#!/usr/bin/env node
/**
 * 版面健檢 — 真的把頁面畫出來，量它有沒有跑版。
 *
 * 為什麼要真的渲染：跑版不在標記裡。同一份 HTML 在 390px 與 1440px 可以一個好好的、
 * 一個整片凸出去；靜態掃 class 名稱永遠猜不到，只有量出來的座標算數。
 *
 * 用法：node layout-check.mjs <file.html> [--json]
 * 找不到 playwright 或瀏覽器時 exit 2（代表「無法驗證」，不是「通過」）。
 */
import { pathToFileURL } from "node:url";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import { createRequire } from "node:module";

// 寬度由 verify.py 依使用者設定檔的 checkWidths 帶進來；沒帶就用手機／平板／桌機三段
const WIDTHS = (process.env.HTML_VISUALIZER_WIDTHS || "390,768,1440")
  .split(",")
  .map((x) => parseInt(x, 10))
  .filter((x) => x > 0);
const TOL = 1.5; // 次像素容差：瀏覽器捨入誤差不算跑版

const file = process.argv[2];
const asJson = process.argv.includes("--json");
if (!file) {
  console.error("用法：node layout-check.mjs <file.html> [--json]");
  process.exit(64);
}

// playwright 可能裝在別的專案底下（本 skill 是全域的）——依序試幾個根目錄
function loadPlaywright() {
  const roots = [
    process.env.HTML_VISUALIZER_PLAYWRIGHT_ROOT,
    process.cwd(),
  ].filter(Boolean);
  for (const r of roots) {
    try {
      const req = createRequire(path.join(r, "noop.js"));
      return req(req.resolve("playwright", { paths: [r] }));
    } catch {
      /* 換下一個 */
    }
  }
  try {
    return createRequire(import.meta.url)("playwright");
  } catch {
    return null;
  }
}

const pw = loadPlaywright();
if (!pw) {
  console.error("NO_PLAYWRIGHT");
  process.exit(2);
}

/** 在頁面裡跑：量三件最常見的跑版。 */
function probe() {
  const vw = window.innerWidth;
  const TOLERANCE = 1.5;
  const label = (el) => {
    const cls = (el.getAttribute("class") || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .join(".");
    const txt = (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 28);
    return (
      el.tagName.toLowerCase() +
      (cls ? "." + cls : "") +
      (txt ? ` 「${txt}」` : "")
    );
  };

  const overflowing = [];
  const clipped = [];
  // 樣式撞車的四種可讀性崩潰（0908 事故：自訂 class 撞到共用樣式已定義的 .timeline，
  // 中文被壓成一個字一行，而只量「溢出／切字」的檢查全數放行）
  const squeezed = [];
  const collapsed = [];
  // 表格欄位失衡（0909 事故：為了過手機寬度檢查給末欄加 nowrap，桌機上那欄吃掉一半寬度、
  // 鄰欄被壓到一行三四個字；直排檢查的門檻是「不到三個字」，這種「一行四個字疊十行」量不到）
  const lopsided = [];
  const invisible = [];
  const covered = [];
  // 小字對比不到 WCAG AA（2026-10-27 加）：「看不見」只抓 1.6 以下；赤陶、橄欖綠、黃當小字
  // 只有 2.3–3.5:1，看得見但讀得吃力，六份範本與範例一次掃出上百處，原本的檢查全數放行
  const lowContrast = {};
  const mix = (top, under) => ({
    r: top.r * top.a + under.r * (1 - top.a),
    g: top.g * top.a + under.g * (1 - top.a),
    b: top.b * top.a + under.b * (1 - top.a),
    a: 1,
  });
  // 疊色背景：半透明的底要跟下層合成才是眼睛看到的顏色；遇到背景圖（漸層、圖片）就不判
  const layeredBg = (el) => {
    const stack = [];
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const c2 = getComputedStyle(n);
      if (c2.backgroundImage && c2.backgroundImage !== "none" && !c2.backgroundImage.startsWith("linear-gradient(transparent")) return null;
      const c = parseRGB(c2.backgroundColor);
      if (c && c.a > 0) {
        stack.push(c);
        if (c.a >= 0.99) break;
      }
    }
    let base = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = stack.length - 1; i >= 0; i--) base = stack[i].a >= 0.99 ? stack[i] : mix(stack[i], base);
    return base;
  };
  const hex = (c) => "#" + [c.r, c.g, c.b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("");
  const parseRGB = (v) => {
    const m = (v || "").match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(",").map((x) => parseFloat(x.trim()));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const lum = (c) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const effBg = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const cs2 = getComputedStyle(n);
      if (cs2.backgroundImage && cs2.backgroundImage !== "none") return null;
      const bg = parseRGB(cs2.backgroundColor);
      if (bg && bg.a >= 0.95) return bg;
      n = n.parentElement;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  };
  const all = [...document.querySelectorAll("body *")];

  for (const el of all) {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    // 固定定位的橫幅本來就貼齊視窗；刻意移到畫面外的（複製用暫存區）也不算
    if (cs.position === "fixed") continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    if (r.left < -50) continue;

    // 祖先開了橫向捲軸（例：包寬圖的 .figure{overflow-x:auto}、手機版的流程鏈）時，
    // 子元素本來就會伸出視窗——那是受控捲動、不是跑版。只有捲動容器自己伸出去才算。
    let inScroller = false;
    for (
      let p = el.parentElement;
      p && p !== document.body;
      p = p.parentElement
    ) {
      const pcs = getComputedStyle(p);
      if (
        ["auto", "scroll"].includes(pcs.overflowX) ||
        ["auto", "scroll"].includes(pcs.overflow)
      ) {
        inScroller = true;
        break;
      }
    }
    if (!inScroller && r.right > vw + TOLERANCE)
      overflowing.push({ el, over: r.right - vw });

    // 文字被容器切掉：只看葉節點，且該元素沒有自己開捲軸。
    //   session 徽章的標籤放不下時截斷加省略號是設計（見 references/session-identity.md），不算
    const scrollable =
      ["auto", "scroll"].includes(cs.overflowX) ||
      ["auto", "scroll"].includes(cs.overflow);
    if (
      !(el instanceof SVGElement) &&
      !scrollable &&
      !el.matches(".vt-session-badge .lb") &&
      el.children.length === 0 &&
      el.scrollWidth > el.clientWidth + TOLERANCE
    ) {
      clipped.push({ el, cut: el.scrollWidth - el.clientWidth });
    }

    // ── 小字對比：有直接文字的元素都量。SVG <text> 不量：它的底色是旁邊的 <rect>／<circle>，
    //    不是 DOM 祖先，從祖先推底色會把「白字在赤陶圓點上」誤判成白字白底 ──
    {
      const isSvgText = false;
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
      if (hasText && !(el instanceof SVGElement) && r.width >= 2 && r.height >= 2) {
        let op = 1;
        for (let n = el; n && n.nodeType === 1; n = n.parentElement) op *= parseFloat(getComputedStyle(n).opacity);
        let fg0 = parseRGB(isSvgText ? cs.fill : cs.color);
        const bg0 = op >= 0.3 && fg0 ? layeredBg(el) : null;
        if (bg0) {
          if (fg0.a < 1) fg0 = mix(fg0, bg0);
          const ratio = (Math.max(lum(fg0), lum(bg0)) + 0.05) / (Math.min(lum(fg0), lum(bg0)) + 0.05);
          const fz = parseFloat(cs.fontSize) || 16;
          const large = fz >= 24 || (parseInt(cs.fontWeight, 10) >= 700 && fz >= 18.66);
          const need = large ? 3 : 4.5;
          if (ratio + 0.005 < need) {
            const k = hex(fg0) + " 在 " + hex(bg0);
            const slot = lowContrast[k] || (lowContrast[k] = { ratio: Math.round(ratio * 100) / 100, need, n: 0, eg: el });
            slot.n++;
          }
        }
      }
    }

    // ── 樣式撞車的四種症狀（只看葉節點；SVG text 的高度語意不同，一律排除）──
    const txt = (el.textContent || "").trim();
    if (el.children.length || el instanceof SVGElement || txt.length < 4) continue;
    if (parseFloat(cs.opacity) < 0.05) continue;
    if (cs.clipPath && cs.clipPath !== "none") continue; // 無障礙的視覺隱藏不算壞
    const fs = parseFloat(cs.fontSize) || 16;
    const lh = parseFloat(cs.lineHeight) || fs * 1.5;

    // 直排壓縮：可用寬度不到三個字，卻疊了五行以上
    if (r.width > 0 && r.width < fs * 3 && Math.round(r.height / lh) >= 5) {
      squeezed.push({ el, w: Math.round(r.width), lines: Math.round(r.height / lh) });
    }
    // 被壓扁：有文字卻幾乎沒有高度
    if (!scrollable && r.width > 4 && r.height > 0 && r.height < fs * 0.6 && txt.length >= 6) {
      collapsed.push({ el, h: Math.round(r.height), fs: Math.round(fs) });
    }
    // 看不見：前景與有效背景對比低於 1.6（白底白字那種）
    const fg = parseRGB(cs.color);
    const bg = effBg(el);
    if (fg && bg && fg.a >= 0.5 && r.width > 4 && r.height > 4) {
      const l1 = lum(fg);
      const l2 = lum(bg);
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      if (ratio < 1.6) invisible.push({ el, ratio: Math.round(ratio * 100) / 100 });
    }
    // 被蓋住：中心點的最上層是別的不透明元素。中心點必須真的在視窗內
    // （夾進來會把畫面外的元素誤判成被邊緣的東西蓋住），且蓋住者不是刻意浮層
    if (r.width > 20 && r.height > 8 && txt.length >= 6) {
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      if (cx >= 0 && cy >= 0 && cx <= innerWidth && cy <= innerHeight) {
        const topEl = document.elementFromPoint(cx, cy);
        if (topEl && topEl !== el && !el.contains(topEl) && !topEl.contains(el)) {
          let floating = false;
          for (let n = topEl; n && n !== document.body; n = n.parentElement) {
            const pp = getComputedStyle(n).position;
            if (pp === "fixed" || pp === "sticky") { floating = true; break; }
          }
          const tbg = parseRGB(getComputedStyle(topEl).backgroundColor);
          if (!floating && tbg && tbg.a >= 0.9) covered.push({ el, by: topEl });
        }
      }
    }
  }

  // ── 中文標題孤字（2026-10-27 加）：「客人下單後要改東／西」這種一行只剩一個字，
  //    text-wrap: balance 不認得中文詞界救不了；改法是把語意片段包成 <span class="ph">
  const orphanHeads = [];
  for (const h of document.querySelectorAll("h1, h2, h3")) {
    const hr = h.getBoundingClientRect();
    if (!hr.width || getComputedStyle(h).display === "none") continue;
    const tops = [];
    const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
    for (let t = walker.nextNode(); t; t = walker.nextNode()) {
      for (let i = 0; i < t.length; i++) {
        const ch = t.data[i];
        if (/\s/.test(ch)) continue;
        const rg = document.createRange();
        rg.setStart(t, i);
        rg.setEnd(t, i + 1);
        const rc = rg.getBoundingClientRect();
        if (rc.width) tops.push({ top: Math.round(rc.top), ch });
      }
    }
    if (tops.length < 4) continue;
    // 依行分組（同一行的字 top 差不到 4px）；任一行只有一個漢字就算孤字（<br> 前的那行也算）
    const rows = [];
    for (const x of tops) {
      const row = rows.find((g) => Math.abs(g.top - x.top) < 4);
      if (row) row.chars.push(x.ch);
      else rows.push({ top: x.top, chars: [x.ch] });
    }
    const lone = rows.length >= 2 && rows.find((g) => g.chars.length === 1 && /[\u3400-\u9fff]/.test(g.chars[0]));
    if (lone) orphanHeads.push({ el: h, ch: lone.chars[0] });
  }

  // ── 補充框被藏起來（2026-10-27 加）：補充框一律常駐可見、可直接輸入；
  //    範本曾被改成「＋ 補充說明」按鈕展開，靜態檢查只看得到 textarea 在不在、看不到它有沒有顯示
  const hiddenBoxes = [...document.querySelectorAll("textarea[data-comment-for]")].filter((t) => {
    const rr = t.getBoundingClientRect();
    const st = getComputedStyle(t);
    return st.display === "none" || st.visibility === "hidden" || rr.height < 8 || rr.width < 40 || t.offsetParent === null;
  }).map((t) => t.getAttribute("data-comment-for"));

  // ── 拍板選項鍵盤選不到（2026-10-27 加）：radio 用 display:none／visibility:hidden 藏起來，Tab 永遠落不到它，
  //    鍵盤使用者拍不了板（評審實測 editorial 範本 Tab 150 次焦點不落 radio）。視覺隱藏要用 opacity:0＋absolute，放行
  const hiddenRadios = [...new Set([...document.querySelectorAll("[data-decision] input[type=radio]")].filter((x) => {
    const st = getComputedStyle(x);
    const lab = x.closest("label");
    // visibility 會繼承：整張卡被藏時 label 也是 hidden，那不算這條
    return st.display === "none" || (st.visibility === "hidden" && (!lab || getComputedStyle(lab).visibility !== "hidden"));
  }).map((x) => x.name))];

  // ── 表格欄位失衡：只在 ≥ 700px 量（手機寬度本來就允許整表橫向捲動）──
  if (vw >= 700) {
    for (const table of document.querySelectorAll("table")) {
      const rows = [...table.querySelectorAll("tr")].filter((tr) => tr.querySelectorAll("td").length >= 2);
      if (!rows.length) continue;
      const ncol = Math.max(...rows.map((tr) => tr.querySelectorAll("td").length));
      if (ncol < 2) continue;
      const cols = Array.from({ length: ncol }, () => ({ w: 0, chars: 0, lines: 0, n: 0, nowrapLong: null }));
      for (const tr of rows) {
        [...tr.querySelectorAll("td")].forEach((td, i) => {
          const c = cols[i]; if (!c) return;
          const r = td.getBoundingClientRect();
          const cs = getComputedStyle(td);
          const fs = parseFloat(cs.fontSize) || 14;
          const lh = parseFloat(cs.lineHeight) || fs * 1.5;
          const t = (td.textContent || "").trim();
          c.w = Math.max(c.w, r.width); c.chars += t.length; c.n++;
          c.lines = Math.max(c.lines, Math.round(r.height / lh));
          if (cs.whiteSpace === "nowrap" && t.length >= 40 && !c.nowrapLong) c.nowrapLong = td;
        });
      }
      const widest = Math.max(...cols.map((c) => c.w));
      cols.forEach((c, i) => {
        const avg = c.n ? c.chars / c.n : 0;
        const fs = parseFloat(getComputedStyle(table).fontSize) || 14;
        // 這欄平均超過 12 字、卻窄到不足 8 個字寬且疊了 6 行以上，而同表另有一欄寬它 2.5 倍以上
        if (avg >= 12 && c.w < fs * 8 && c.lines >= 6 && widest >= c.w * 2.5) {
          lopsided.push({ el: table, col: i + 1, w: Math.round(c.w), lines: c.lines, widest: Math.round(widest) });
        }
        if (c.nowrapLong) lopsided.push({ el: c.nowrapLong, col: i + 1, nowrap: true });
      });
    }
  }

  // 只留最外層的凸出元素——父層凸出時子層必然跟著凸，全列會淹沒訊號
  const outermost = overflowing.filter(
    (a) => !overflowing.some((b) => b.el !== a.el && b.el.contains(a.el)),
  );

  return {
    hasSvg: !!document.querySelector("svg"),
    docOverflow: document.documentElement.scrollWidth - vw,
    overflowing: outermost
      .sort((a, b) => b.over - a.over)
      .slice(0, 6)
      .map((x) => ({ what: label(x.el), over: Math.round(x.over) })),
    clipped: clipped
      .sort((a, b) => b.cut - a.cut)
      .slice(0, 6)
      .map((x) => ({ what: label(x.el), cut: Math.round(x.cut) })),
    squeezed: squeezed.slice(0, 5).map((x) => ({ what: label(x.el), w: x.w, lines: x.lines })),
    collapsed: collapsed.slice(0, 5).map((x) => ({ what: label(x.el), h: x.h, fs: x.fs })),
    invisible: invisible.slice(0, 5).map((x) => ({ what: label(x.el), ratio: x.ratio })),
    lowContrast: Object.entries(lowContrast)
      .sort((x, y) => x[1].ratio - y[1].ratio)
      .slice(0, 6)
      .map(([k, v]) => ({ pair: k, ratio: v.ratio, need: v.need, n: v.n, what: label(v.eg) })),
    lowContrastGroups: Object.keys(lowContrast).length,
    hiddenBoxes,
    hiddenRadios,
    orphanHeads: orphanHeads.slice(0, 5).map((x) => ({ what: label(x.el), ch: x.ch })),
    covered: covered.slice(0, 5).map((x) => ({ what: label(x.el), by: label(x.by) })),
    lopsided: lopsided.slice(0, 5).map((x) => ({ what: label(x.el), col: x.col, w: x.w, lines: x.lines, widest: x.widest, nowrap: !!x.nowrap })),
  };
}

// 套件裝了不代表瀏覽器下載了（沒跑過 playwright install 就是這樣）。
// 自帶 chromium 起不來時退回系統 Chrome；兩個都沒有才算「無法驗證」。
async function launchBrowser() {
  try {
    return await pw.chromium.launch();
  } catch {
    try {
      return await pw.chromium.launch({ channel: "chrome" });
    } catch {
      console.error("NO_BROWSER");
      process.exit(2);
    }
  }
}

const browser = await launchBrowser();
const url = pathToFileURL(path.resolve(file)).href;
const report = [];

for (const width of WIDTHS) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  try {
    await page.goto(url, { waitUntil: "load", timeout: 20000 });
    // 外連樣式（Tailwind CDN 等）要時間套上，沒等會量到未套版的假結果
    await page.waitForTimeout(1200);
    const shotDir = process.env.HTML_VISUALIZER_SHOT_DIR || path.join(os.tmpdir(), "html-visualizer-shots");
    fs.mkdirSync(shotDir, { recursive: true });
    const shot = path.join(shotDir, `${path.basename(file, ".html")}-${width}.png`);
    await page.screenshot({ path: shot, fullPage: true });
    const res = { width, shot, ...(await page.evaluate(probe)) };
    if (width === Math.max(...WIDTHS)) {
      // 列印／存 PDF 時看不見的文字（2026-10-27 加）：捲入淡入的頁面，沒進過視窗的段落
      // 停在 opacity:0，列印出來是空白——畫面上量不到，因為讀者捲過去時它就現形了
      // 先模擬一次讀者捲動：有的淡入腳本要等第一次捲動才把視窗外的段落設成透明
      await page.mouse.wheel(0, 40);
      await page.waitForTimeout(350);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(150);
      await page.emulateMedia({ media: "print" });
      res.printHidden = await page.evaluate(() => {
        const out = [];
        for (const el of document.querySelectorAll("main *, section *, article *")) {
          if (el.children.length || (el.textContent || "").trim().length < 6) continue;
          const st = getComputedStyle(el);
          if (st.display === "none" || st.visibility === "hidden") continue;
          let op = 1;
          for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
            const ns = getComputedStyle(n);
            if (ns.display === "none") { op = 1; break; }
            op *= parseFloat(ns.opacity);
          }
          if (op < 0.1) out.push((el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 24));
        }
        return { n: out.length, eg: out.slice(0, 3) };
      });
      await page.emulateMedia({ media: "screen" });
    }
    report.push(res);
  } catch (e) {
    report.push({ width, error: String(e).split("\n")[0] });
  } finally {
    await page.close();
  }
}
await browser.close();

if (asJson) {
  console.log(JSON.stringify(report));
  process.exit(0);
}

if (report.some((r) => r.hasSvg)) {
  console.log("  提示：頁面含 <svg>，建議另跑 svg-text-check.mjs。");
}

let bad = 0;
for (const r of report) {
  if (r.error) {
    console.log(`  ${r.width}px  載入失敗：${r.error}`);
    bad++;
    continue;
  }
  const issues = [];
  if (r.docOverflow > TOL)
    issues.push(`整頁橫向溢出 ${Math.round(r.docOverflow)}px`);
  for (const o of r.overflowing) issues.push(`凸出視窗 ${o.over}px：${o.what}`);
  for (const c of r.clipped) issues.push(`文字被切掉 ${c.cut}px：${c.what}`);
  for (const q of r.squeezed || [])
    issues.push(`文字被壓成直排 ${q.w}px 寬疊 ${q.lines} 行：${q.what}`);
  for (const c of r.collapsed || [])
    issues.push(`元素被壓扁 高 ${c.h}px（字級 ${c.fs}px）：${c.what}`);
  for (const v of r.invisible || [])
    issues.push(`文字看不見 對比 ${v.ratio}:1：${v.what}`);
  for (const c of r.covered || [])
    issues.push(`被不透明元素蓋住：${c.what} ← ${c.by}`);
  for (const v of r.lowContrast || [])
    issues.push(`小字對比不足 ${v.ratio}:1（需 ${v.need}）×${v.n} ${v.pair}：${v.what}`);
  if ((r.lowContrastGroups || 0) > 6)
    issues.push(`……另有 ${r.lowContrastGroups - 6} 組對比不足（小字改用墨色 token：--text-soft／--clay-ink／--green-ink／--yellow-ink）`);
  for (const o of r.orphanHeads || [])
    issues.push(`標題有一行只剩一個字「${o.ch}」（把語意片段包成 <span class="ph">）：${o.what}`);
  if (r.hiddenBoxes && r.hiddenBoxes.length)
    issues.push(`補充框被藏起來 ${r.hiddenBoxes.length} 個（一律常駐可見，嫌佔版面就改成單行高、聚焦長高）：${r.hiddenBoxes.slice(0, 6).join("、")}`);
  if (r.printHidden && r.printHidden.n)
    issues.push(`列印時 ${r.printHidden.n} 段文字看不見（淡入動畫沒有列印規則）：「${r.printHidden.eg.join("」「")}」`);
  for (const t of r.lopsided || [])
    issues.push(t.nowrap
      ? `表格第 ${t.col} 欄長文字被設成不換行（會吃掉整列寬度）：${t.what}`
      : `表格第 ${t.col} 欄被壓窄 ${t.w}px 疊 ${t.lines} 行、最寬欄 ${t.widest}px：${t.what}`);
  // 拍板選項另印一行固定前綴、不算進跑版：verify 把它接成自己的一個 ✓／✗ 項
  if (r.hiddenRadios && r.hiddenRadios.length)
    console.log(`  ${r.width}px  RADIO_HIDDEN ${r.hiddenRadios.length} 題：${r.hiddenRadios.slice(0, 6).join("、")}`);
  if (!issues.length) {
    console.log(`  ${r.width}px  ✓ 無跑版  截圖 ${r.shot}`);
  } else {
    bad++;
    console.log(`  ${r.width}px  ✗ ${issues.length} 項  截圖 ${r.shot}`);
    for (const i of issues) console.log(`         ${i}`);
  }
}
process.exit(bad ? 1 : 0);
