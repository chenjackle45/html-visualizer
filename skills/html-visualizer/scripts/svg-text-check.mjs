#!/usr/bin/env node
/**
 * SVG 文字檢查 — 對每段 <text> 用 getBBox() 量：(a) 有沒有超出 viewBox；
 * (b) 若它前一個兄弟是 <rect>（標籤遮罩或節點框），文字有沒有超出那個 rect。
 *
 * 為什麼另寫一支：layout-check.mjs 用 scrollWidth/clientWidth 判「文字被切掉」，
 * 對 SVG 元素那兩個數字沒意義（2026-09-05 實測誤報）。只有 getBBox 算數。
 *
 * 用法：node svg-text-check.mjs <file.html>   （exit 1 = 有超出；exit 2 = 找不到 playwright）
 */
import { pathToFileURL } from "node:url";
import path from "node:path";
import { createRequire } from "node:module";

const file = process.argv[2];
if (!file) {
  console.error("用法：node svg-text-check.mjs <file.html>");
  process.exit(64);
}

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
      /* next */
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
  console.error("找不到 playwright（無法驗證，不是通過）");
  process.exit(2);
}

const browser = await pw.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(pathToFileURL(path.resolve(file)).href);
await page.waitForTimeout(600);
const issues = await page.evaluate(() => {
  const out = [];
  const T = 1;
  document.querySelectorAll("svg[viewBox]").forEach((svg, i) => {
    const vb = svg.viewBox.baseVal;
    const title =
      svg.querySelector("title")?.textContent?.trim() || `svg#${i + 1}`;
    // 身分標記（structure-diagrams.md §6.3／6.4）：線的兩端要指到存在的節點 id；id 不能重複
    const ids = new Set();
    svg.querySelectorAll(".node[data-id]").forEach((n) => {
      const id = n.dataset.id;
      if (ids.has(id)) out.push(`[${title}] data-id 重複：「${id}」`);
      ids.add(id);
    });
    svg.querySelectorAll(".edge").forEach((e) => {
      for (const k of ["from", "to"]) {
        const v = e.dataset[k];
        if (!v)
          out.push(
            `[${title}] 線缺 data-${k}（${e.dataset.from || "?"}→${e.dataset.to || "?"}）`,
          );
        else if (!ids.has(v))
          out.push(`[${title}] 線的 data-${k}="${v}" 沒有對應的節點 data-id`);
      }
    });
    if (svg.classList.contains("xplore") && !svg.closest("[data-explore]"))
      out.push(
        `[${title}] svg.xplore 外面沒包 <div class="xp" data-explore>，探索層不會啟動`,
      );
    svg.querySelectorAll("text").forEach((t) => {
      const b = t.getBBox();
      const txt = (t.textContent || "")
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, 30);
      if (
        b.x < vb.x - T ||
        b.x + b.width > vb.x + vb.width + T ||
        b.y < vb.y - T ||
        b.y + b.height > vb.y + vb.height + T
      )
        out.push(
          `[${title}] 超出 viewBox：「${txt}」 bbox x=${Math.round(b.x)} w=${Math.round(b.width)}`,
        );
      const prev = t.previousElementSibling;
      if (prev && prev.tagName.toLowerCase() === "rect") {
        const r = prev.getBBox();
        // 文字整個在 rect 外側（圖例色塊＋旁邊說明）不是遮罩關係，跳過
        const beside =
          b.x >= r.x + r.width - T ||
          b.x + b.width <= r.x + T ||
          b.y >= r.y + r.height - T ||
          b.y + b.height <= r.y + T;
        const over = Math.max(r.x - b.x, b.x + b.width - (r.x + r.width));
        if (!beside && over > T)
          out.push(
            `[${title}] 超出前一個 rect ${Math.round(over)}px：「${txt}」 文字 ${Math.round(b.width)} / rect ${Math.round(r.width)}`,
          );
      }
    });
  });
  return out;
});
await browser.close();
if (issues.length) {
  console.log(`✗ ${issues.length} 項`);
  issues.forEach((x) => console.log("  " + x));
  process.exit(1);
}
console.log("✓ SVG 文字全部在 viewBox 與遮罩內；線端點都指到存在的節點");
