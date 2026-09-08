#!/usr/bin/env node
/**
 * 執行期健檢 — 真的把頁面跑起來，抓腳本在載入時有沒有炸掉、複製鈕按了有沒有反應。
 *
 * 為什麼要真的跑：node --check 只證明「解析得過」，抓不到執行期的 null 存取。
 * 2026-09-09 實際事故：決策頁砍掉了題目地圖那段 HTML，腳本裡 qmap.remove() 對 null 炸掉，
 * 同一個 script 區塊後面的複製鈕監聽器全沒掛上——語法檢查全綠、版面健檢全綠、
 * 「JS 參照的元素都存在」只給了一個「動態產生的可忽略」的黃燈，然後使用者按複製鈕沒反應。
 * 這是同型事故第 N 次（2026-08-13 是換行字元炸 SyntaxError）。靜態檢查永遠有下一種漏法，
 * 只有「載入 → 有沒有 pageerror → 按下去有沒有變」是不會漏的。
 *
 * 用法：node runtime-check.mjs <file.html> [--json]
 * exit 0 乾淨 / 1 有錯 / 2 找不到 playwright（代表「無法驗證」，不是「通過」）。
 */
import { pathToFileURL } from "node:url";
import path from "node:path";
import { createRequire } from "node:module";

const file = process.argv[2];
const asJson = process.argv.includes("--json");
if (!file) {
  console.error("用法：node runtime-check.mjs <file.html> [--json]");
  process.exit(64);
}

function loadPlaywright() {
  const roots = [process.env.HTML_VISUALIZER_PLAYWRIGHT_ROOT, process.cwd()].filter(Boolean);
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

let browser;
try {
  browser = await pw.chromium.launch();
} catch (error) {
  console.error("NO_PLAYWRIGHT", error);
  process.exit(2);
}

const result = { pageErrors: [], consoleErrors: [], buttons: [] };
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("pageerror", (e) => result.pageErrors.push(String(e && e.message ? e.message : e).split("\n")[0]));
page.on("console", (m) => {
  if (m.type() === "error") result.consoleErrors.push(m.text().split("\n")[0]);
});
// 剪貼簿權限：無頭瀏覽器沒有，複製會走備援路徑；我們只驗「按了有沒有反應」
try {
  await page.goto(pathToFileURL(path.resolve(file)).href, { waitUntil: "load", timeout: 20000 });
  await page.waitForTimeout(1000);

  // 決策頁的兩顆按鈕：按下去文字或預覽區必須有變化，否則就是監聽器沒掛上
  for (const sel of ["#copy-btn", "#preview-btn"]) {
    const btn = await page.$(sel);
    if (!btn) continue;
    // 「有反應」的判準要寬：按鈕文字變、預覽區顯示狀態變（class 或 style 都算）、預覽內容變，任一即可
    const snap = (s) => {
      const b = document.querySelector(s);
      const pv = document.getElementById("preview-area");
      const pc = document.getElementById("preview-content");
      return {
        text: b.textContent.trim(),
        preview: pv ? pv.className + "|" + getComputedStyle(pv).display : "",
        content: pc ? pc.textContent.length : 0,
        // 有的頁面只改一行提示字（#copy-hint 之類）——整頁可見文字有變也算有反應
        body: document.body.innerText.length,
      };
    };
    const before = await page.evaluate(snap, sel);
    await btn.click();
    await page.waitForTimeout(400);
    const after = await page.evaluate(snap, sel);
    const reacted = before.text !== after.text || before.preview !== after.preview || before.content !== after.content || before.body !== after.body;
    result.buttons.push({ sel, reacted, before: before.text, after: after.text });
  }
} catch (e) {
  result.pageErrors.push("載入失敗：" + String(e).split("\n")[0]);
}
await browser.close();

// 外連資源（Tailwind CDN 等）離線時會噴 console error，那不是頁面的錯
result.consoleErrors = result.consoleErrors.filter((t) => !/net::ERR_|Failed to load resource/i.test(t));

if (asJson) {
  console.log(JSON.stringify(result));
  process.exit(0);
}
let bad = 0;
if (result.pageErrors.length) {
  bad++;
  for (const e of result.pageErrors) console.log(`  pageerror：${e}`);
}
for (const e of result.consoleErrors) console.log(`  console.error：${e}`);
for (const b of result.buttons) {
  if (!b.reacted) bad++;
  console.log(`  ${b.sel} ${b.reacted ? "✓ 有反應" : "✗ 按了沒反應"}${b.reacted ? `（${b.before} → ${b.after}）` : ""}`);
}
if (!bad && !result.buttons.length) console.log("  ✓ 載入無錯誤（頁面沒有拍板按鈕）");
process.exit(bad ? 1 : 0);
