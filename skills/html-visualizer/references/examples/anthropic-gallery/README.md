# Example · 風格展示頁（四份範例入口＋共用設計系統樣張）

> **這份不是起手範本。** 它是一頁「風格展示」：最上面連到 skill 內真的存在的四份範例，其後把共用設計系統（色彩墨色、字體層級、章節編號、卡片與提示框）畫成樣張，讓人一頁看懂這套風格。要做頁面時，從四份範例挑一份起手；四份都不合才用 `assets/base-template.html`。

## 這頁從哪來

版面最早取自 Thariq〈The unreasonable effectiveness of HTML〉的範例目錄（英文原文：https://thariqs.github.io/html-effectiveness/ ）。原頁是一張 20 個範例的目錄，但那 20 個檔案從未建立（2026-09-20 逐一查過）。2026-10-27 改寫成現在的展示頁：

- 20 張點不進去的卡拿掉，題材降為最底下收合的純文字清單，不再做成可點的卡片樣子。
- 最上面換成四份真的範例，用相對路徑連過去。
- 中段加上設計系統樣張，全部照共用設計規格（墨色、字級下限、72ch 行長、章節編號兩種、一層框）。
- 整頁改成繁體中文；英文只留在原題名與來源，並標明是原文。

## 頁面結構

```
MASTHEAD
  ├─ eyebrow（mono 小字＋24px 赤陶短線）
  ├─ h1（serif，強調詞換字重＋--clay-d，不用斜體；.ph 包語意片段）
  ├─ intro（說明這頁怎麼用）＋ TOC pills（01–06，數字 mono 11px --text-soft）
  └─ 右欄「這頁怎麼用」三步（含留意見的入口說明）

01 起手範例     四張 a.ex-card → ../<資料夾>/index.html；每張：縮圖、何時用、特徵、路徑
                 下方一行退路：四份都不合 → assets/base-template.html
02 色彩與墨色   2.1 八色色票（8／4／2 欄）· 2.2 四種墨色＋米白底對比值 · 2.3 用法表（手機改一列一張卡）
03 字體層級     六列字級樣張 · 3.1 強調詞兩種寫法 · 3.2 .ph 斷行示範
04 章節編號     章節 eyebrow vs 小節 badge 並排樣張（本頁自己就照這兩種排）
05 卡片與提示框 卡片、三種提示框、四種狀態標籤
06 題材清單     <details class="reveal"> 收合 20 個題材，純文字、無連結
來源標註        一行，指回 Thariq 原頁
```

章節之間不加外框，用留白分段；小節用小方框 badge（`.sub-no`）。

## 範例怎麼挑（與 SKILL.md 的範本對照表一致）

| 你要做的事 | 用哪份 |
|---|---|
| 報告、盤點、健檢結論、研究結果（夾 0–4 題拍板） | `../editorial-report/` |
| 教學、概念解釋、機制說明（沒有拍板） | `../explainer/`（骨架 A）；報告的內容順序（骨架 B）也在它的 README |
| 收尾追認、拍板題 ≥ 5 題 | `../marathon-decision-sheet/` |
| 跟非技術 stakeholder 對齊規格、設計、方向 | `../spec-alignment/` |
| 都不合（開發者看的技術規格、儀表板） | `assets/base-template.html` |

改四份範例的「何時用」時，這頁 01 段的卡片文字要一起改，否則兩邊會對不上。

## 哪些可以直接抄

| 元件 | class | 注意 |
|---|---|---|
| 色彩 token | `:root` | 含四種墨色與各 soft／border 色；24px 以下的字只用墨色 |
| 章節頭 | `.eyebrow` ＋ `.sec-head h2` | eyebrow 寫「01 · 章名」；有浮水印大數字時 eyebrow 不寫數字 |
| 小節頭 | `.sub-head` ＋ `.sub-no` | `--clay-ink` 字、`--clay-soft` 底、`--clay-border` 邊 |
| 連到別頁的卡 | `a.ex-card` | 只有真的能開的頁才用 `<a>`；hover 浮起，reduced-motion 下關掉 |
| 提示框 | `.note-box.tip／.warn／.ok` | 外框滿版，內層 `<span>` 限 72ch |
| 狀態標籤 | `.tag.green／.yellow／.clay／.oat` | 一律 `white-space: nowrap` |
| 收合區塊 | `details.reveal` | 跟 base 同款：8px 赤陶折角＋粗體摘要；列印時展開 |
| 用法表 | `.tbl-wrap` ＋ `table.rules` | 桌機 min-width 560px；≤640px 改一列一張卡，`td` 帶 `data-label` |

## 縮圖 SVG 系統（可選）

卡片縮圖用幾何形狀暗示該範例的版面，不放文字。class 沿用原頁：

```css
.thumb svg .fl { fill: var(--g300); }                                       /* 灰填色 */
.thumb svg .cl { fill: var(--clay); }                                       /* 赤陶 */
.thumb svg .ol { fill: var(--olive); }                                      /* 橄欖 */
.thumb svg .oa { fill: var(--oat); stroke: var(--g500); stroke-width: 2.5; } /* oat 帶邊 */
.thumb svg .sl { fill: var(--slate); }                                      /* 深近黑 */
.thumb svg .wh { fill: var(--paper); stroke: var(--g500); stroke-width: 2.5; } /* 白帶邊 */
.thumb svg .ln { stroke: var(--g500); stroke-width: 2.5; fill: none; stroke-linecap: round; } /* 線 */
.thumb svg .lc { stroke: var(--clay); stroke-width: 2.5; fill: none; stroke-linecap: round; } /* 赤陶線 */
```

品牌色在這裡是填色與線，不是字，所以不受「24px 以下用墨色」限制。

## 留意見與回傳列

頁面底部固定一條回傳列（`footer.sticky-bar`），照 `assets/base-template.html` 搜「回傳列」那三段（CSS、HTML、腳本）原樣搬來，用的是沒有拍板題的版本：左邊寫「反白任何一段文字就能留言 · 已留 N 則」，右邊「預覽」（`#preview-btn`）與「複製給 AI」（`#copy-btn`）。複製內容是頁面標題＋全部留言。`body.vt-has-bar` 會藏起右下的浮動評論計數，改由列上的「已留 N 則」承接，點它打開評論清單。

- 首屏右欄第 3 步寫了這個入口；05 段 5.4 放了一張靜態的回傳列樣張（`.bar-demo`，`aria-hidden`、不可點），說明它的用途。樣張寫「已留 0 則」，跟頁面一打開時真的回傳列一致，讀者才不會以為已經有留言。
- 複製標頭取 `<title>`，腳本只刪掉開頭的「session 標籤 · 」前綴，標題本身用不用「 · 」都不受影響。
- 「預覽」打開的是從底部升起的抽屜（`#preview-area`，放在列外面、附「關閉」鈕），停在回傳列上方，不蓋住複製鈕。列有 `backdrop-filter`，抽屜放進列裡會被困在列的框內，所以不要搬回去。
- 評論系統（CSS、HTML、腳本）整段跟 `assets/base-template.html` 一致：引文正體 12px、重新整理後依引文找回標記、找不回標「原文已變動」、點清單的引文捲到那段。不在這頁另改，要改就改 base 再同步過來。
- `<head>` 有 `<link rel="icon" href="data:,">`，瀏覽器才不會去要 favicon.ico、在主控台報 404。
- 這頁沒掛 Tailwind CDN，排版全靠頁內 CSS。
