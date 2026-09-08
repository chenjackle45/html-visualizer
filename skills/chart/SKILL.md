---
name: chart
description: 做「統一又漂亮」的資料圖表 / 視覺化。觸發場景：需要畫柱狀圖 / 折線圖 / 趨勢圖 / 占比圖（甜甜圈、圓餅）/ 分組或堆疊柱 / 目標vs實際 / dashboard / 週報圖表 / 行銷數據圖 / KPI 圖；或使用者說「做個圖表 / 畫個 chart / 視覺化這組數據 / 弄成圖 / 加個趨勢圖 / 占比圖」。用 @unovis（單一圖庫）+ 一份 design token 出統一風格、各圖型共用視覺語言的漂亮圖表。涵蓋獨立 HTML demo 與專案內 Vue 兩種交付。注意：這是「資料視覺化原語」skill；若是整份報告/文件要圖文版面，搭配 html-visualizer。
---

# Chart —— 統一又漂亮的圖表

> 一次把資料畫成「像一家人」的漂亮圖表。圖庫只用 **@unovis**，視覺語言由**一份 design token** 統一。

## 核心精神（兩句話，刻進去）

1. **統一「外殼 + 視覺語言」，不統一圖型。** 配色 / 字體 / 軸 / 圓角 / 網格由一份 token 控制；柱、折線、甜甜圈各司其職，但長得像一家人。**不要**為了「統一」把所有資料硬塞進同一種圖。
2. **對真實渲染驗證，不憑想像保證好看。** 在瀏覽器實際開起來、逐張看過才算數。「結構有渲染」≠「好看」。

## 工作流程

```
0. 先找專案自己的配色 → 驗證：專案有品牌 / 語意 token 嗎？有就用它，別用本 skill 的預設色
1. 先看資料形狀      → 驗證：量級差多大？幾個資料點？稀疏嗎？單位幾種？
2. 選圖型（決策表）  → 驗證：這個圖型配得上這份資料嗎（不是反過來硬湊）
3. 套模板 + token    → 驗證：用 templates/standalone.html 或專案 chart-* 元件 + tokens.css
4. 餵真實資料        → 驗證：缺值用 undefined（不是 0）
5. 對真實渲染驗證    → 驗證：瀏覽器開起來逐張看（見下方「驗證」段），好看才交
```

**第 0 步是 2026-07-25 新增**（本 skill 的預設調色盤曾是專案實際配色的走樣複製品 —— 首色同值、其餘全歪，報告裡的圖跟產品畫面對不上）。**即使是專案外的獨立 HTML demo，只要主題屬於某個專案，就該吃那個專案的色。**

**第 1 步最常被跳過、卻最致命**：資料適配性決定七成成敗。極端量級差（目標 800 vs 實際 92）、太稀疏（只有 3 個點）、單位混雜的資料，**任何圖庫畫出來都會醜**。先處理資料（換維度 / 拆圖 / 改比較基準 / 補資料），再選圖 —— 不要怪工具。

## 選圖決策表（資料形狀 → 圖型）

| 想表達 | 資料形狀 | 圖型 | 模板編號 |
|---|---|---|---|
| 比較各期間單一數值 | 一維序列 | 單系列柱 | ① |
| 趨勢 / 同期對比 | 多條時間序列 | 多系列折線（實線+虛線） | ② |
| 同期內多項並排比 | 每期 2~4 項 | 分組柱 | ③ |
| 看總量也看組成 | 每期可拆 2~5 類 | 堆疊柱 | ④ |
| 目標 vs 實際（**同單位**） | 兩條同單位序列 | 柱+折線 combo | ⑤ |
| 占比結構 | 幾個類別加總成 100% | 甜甜圈（+中央總數） | ⑥ |
| 兩指標關聯但**不同單位** | 如 營收(萬) + ROAS(倍) | 雙面板共用 X 軸 | ⑦ |

模板編號對應 `templates/standalone.html` 裡的七張圖，直接複製改資料。

## 五條鐵則（違反必醜或必誤導）

1. **統一外殼、不統一圖型** —— 共用 token，但讓每種圖做它該做的事。
2. **不同單位永遠不共用一條 Y 軸**（雙軸陷阱：刻度可被任意拉伸＝誤導）。要對照 → 雙面板共用 X 軸（⑦）。
3. **同單位的「目標 vs 實際」柱+折線疊圖是正當的**，不算雙軸（⑤）。
4. **資料適配性優先** —— 極端量級差 / 太稀疏的資料先處理再畫；別用假資料、自算 normalize、硬餵係數去搶救一張本來就不該這樣畫的圖。
5. **缺值用 `undefined` 讓折線斷開，不要用 `0`**（0 會讓線砸到地板）。

## 兩種交付情境

### A. 獨立 HTML demo（prototype / 給人看 / 分享）
- 直接複製 `templates/standalone.html`（已實機驗證可渲染的七圖 gallery），把 `months` / `revenue` / `donutData` 等資料換成真的。
- @unovis 走 jsdelivr `/+esm` CDN，免安裝。

### B. 專案內 Vue（Nuxt / shadcn-vue）
- **優先複用專案既有封裝層**（若專案有，例：`app/components/ui/{chart,chart-*}` 這類 BarChart / LineChart / legend 包裝），不要每次重抄 `VisXYContainer`。
- 缺的圖型才照 `reference/unovis-api.md` 的 Vue 寫法新增；token 貼進全域 css（如 `main.css`）。
- 動工前先讀專案自己的前端／圖表規範（若有：專案根目錄的 agent 指示檔、元件清單文件）。

## 設計 Token

### 優先序（第 0 步就要決定）

| 順位 | 用什麼 | 怎麼找 |
|---|---|---|
| 1 | **專案自己的圖表 / 品牌 token** | 最可靠的找法＝**看既有圖表元件正在用什麼**（`rg 'color=' 圖表元件目錄`），再回頭追那個變數的定義；直接翻樣式檔容易漏 |
| 2 | 專案的 shadcn 圖表色 | `--chart-1` ~ `--chart-5` |
| 3 | 嵌在 html-visualizer 頁面時：該頁的 token（clay / olive / yellow / g500 序列）| 見 html-visualizer `component-library.md` § 資料圖表 |
| 4 | 本 skill 的 `templates/tokens.css` | **只在獨立圖表頁、且專案沒有任何配色系統時**才用 |

專案通常是**兩層**：品牌層（原始色值）→ 語意層（角色命名，如「B 端強調」「達標綠」）。**用語意層、不要直接抓品牌層**，語意層才帶著「這個顏色代表什麼」的意思。

⚠️ **先確認變數的作用域，別假設是 `:root` 全域**。設計 token 常被刻意 scoped 在某個頁面 class 底下（避免污染全站），出了那個 scope 就解析不到、顏色會靜默掉回瀏覽器預設黑。查法：找到定義處後往上看它掛在哪個選擇器 —— 是 `:root` 才是全域，是 `.xxx-page` 就只有那頁有。**獨立 HTML 產出一律 inline 實際色值**，不要照抄 `var(--...)`。


### 本 skill 的預設調色盤

單一來源在 `templates/tokens.css`（6 類別色 + 語意色 + `--vis-axis-*` 軸變數 + tooltip）。
換品牌色只改 6 個 `--c-*`；軸外觀統一走 `--vis-axis-*`，**不要逐圖硬寫顏色**。

⚠️ **這組色是通用備援、不代表任何專案的品牌**。專案有自己的色就走上面的優先序，不要因為「模板長這樣」就把預設色帶進產品相關的產出。

## 不歸本 skill 管的（回程規則）

- **結構圖**（流程 / 泳道 / 時序 / 狀態機 / 架構 / 依賴）不是資料圖表 → 讀 html-visualizer `references/structure-diagrams.md`，不要用圖表庫硬畫。
- **整份報告 / 文件的版面**（章節、拍板卡、mock、漸進揭露）→ 回 html-visualizer skill；本 skill 只負責圖表本體與它的 token。
- 資料點少到看不出形狀（< 5 點、單一數字）→ 用表格或數字卡，不畫圖。

## 驗證（這步不能省 —— 上次就是跳過它才翻車）

獨立 HTML 用本機 server 開（避免 file:// 被導航工具改成 https）：
```bash
cd <html 所在目錄> && python3 -m http.server 8848
# 瀏覽器開 http://localhost:8848/xxx.html
```

逐張確認標記真的畫出來 —— **注意：@unovis 的柱/線是 `<path>` 不是 `<rect>`**：
```js
// 等動畫跑完再量（首次載 CDN 多等）
await new Promise(r => setTimeout(r, 1500))
el.querySelectorAll('path[class*="bar"]').length    // 柱數
el.querySelectorAll('path[class*="line"]').length   // 線數
el.querySelectorAll('path[class*="segment"]').length // 甜甜圈段數
```
量到 0 先別下「沒渲染」的結論 —— 可能是選錯選擇器（數成 rect）或量太早。**重量一次再判斷**，然後**真的截圖用眼睛看好不好看**。

### 兩個 2026-07-25 實測踩到的坑

**① 量太早會給出假 FAIL，而且假到讓人誤判整個圖庫壞掉。**
甜甜圈剛掛載時 DOM 裡只有一個 `css-…-background` 底環 path，扇形還沒生成 → 數到 0。當時據此宣告「樣板壞了、CDN 版本不相容」，**全錯**：等它跑完後 `path[class*="segment"]` 精準回 4，七張圖視覺全正常。**固定 `setTimeout` 不可靠**（首次載 CDN 更慢），改成輪詢到穩定：

```js
// 輪詢到「連續 3 次同值且 > 0」才採信；別用單次 sleep
async function countStable(el, sel, timeoutMs = 15000) {
  let last = -1, stable = 0, waited = 0
  while (waited < timeoutMs) {
    const n = el.querySelectorAll(sel).length
    if (n === last && n > 0) { if (++stable >= 3) return n } else stable = 0
    last = n; await new Promise(r => setTimeout(r, 300)); waited += 300
  }
  return el.querySelectorAll(sel).length
}
```
> ⚠️ 這個迴圈**別整段丟進瀏覽器自動化的單次 evaluate**（會撞 45s CDP timeout）。分兩次呼叫：先讓頁面自己跑、下一次呼叫才量。
>
> **宣告「圖庫壞了」之前，先跑一次 `templates/standalone.html` 對照**。它是已知good baseline；baseline 正常＝問題在你的頁，不在圖庫。

**② 手刻頁面會靜默畫不出東西 —— 這就是「絕不從零寫」的理由。**
實測：自己刻一頁、甜甜圈建構程式碼與樣板**逐字相同**（同 `value`/`color` accessor、同 `arcWidth`/`cornerRadius`/`padAngle`、同匯入清單、同 CDN），結果只畫出底環、**零主控台錯誤**、圖例與中央數字全部正常 —— 只有扇形不見。沒有任何報錯會提醒你。

→ **一律複製 `templates/standalone.html` 再換資料**，不要為了「只需要一張圖」就手刻精簡版。省下的那幾十行，會用整場除錯還回去。

> 詳細 API（vanilla + Vue 各圖型完整配置 + 所有踩過的坑）見 `reference/unovis-api.md`。
