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

const WIDTHS = [390, 768, 1440]; // 手機 / 平板 / 桌機
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

    // 文字被容器切掉：只看葉節點，且該元素沒有自己開捲軸
    const scrollable =
      ["auto", "scroll"].includes(cs.overflowX) ||
      ["auto", "scroll"].includes(cs.overflow);
    if (
      !(el instanceof SVGElement) &&
      !scrollable &&
      el.children.length === 0 &&
      el.scrollWidth > el.clientWidth + TOLERANCE
    ) {
      clipped.push({ el, cut: el.scrollWidth - el.clientWidth });
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
    covered: covered.slice(0, 5).map((x) => ({ what: label(x.el), by: label(x.by) })),
    lopsided: lopsided.slice(0, 5).map((x) => ({ what: label(x.el), col: x.col, w: x.w, lines: x.lines, widest: x.widest, nowrap: !!x.nowrap })),
  };
}

let browser;
try {
  browser = await pw.chromium.launch();
} catch (error) {
  console.error("NO_PLAYWRIGHT", error);
  process.exit(2);
}
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
    report.push({ width, shot, ...(await page.evaluate(probe)) });
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
  for (const t of r.lopsided || [])
    issues.push(t.nowrap
      ? `表格第 ${t.col} 欄長文字被設成不換行（會吃掉整列寬度）：${t.what}`
      : `表格第 ${t.col} 欄被壓窄 ${t.w}px 疊 ${t.lines} 行、最寬欄 ${t.widest}px：${t.what}`);
  if (!issues.length) {
    console.log(`  ${r.width}px  ✓ 無跑版  截圖 ${r.shot}`);
  } else {
    bad++;
    console.log(`  ${r.width}px  ✗ ${issues.length} 項  截圖 ${r.shot}`);
    for (const i of issues) console.log(`         ${i}`);
  }
}
process.exit(bad ? 1 : 0);
