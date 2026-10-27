# spec-alignment 範本 — 跟 stakeholder 對齊規格 / 設計 / 方向

> **要跟老闆、業務等非技術 stakeholder 對齊規格、設計、方向、讓他們確認時，一律用這個呈現法。**`index.html` 是範本實例（一個訂閱制產品的方案變更生命週期規格）。

## 何時用這個範本（vs 其他）

| 情境 | 用哪個 |
|---|---|
| 要 **stakeholder（老闆 / 業務 / 非 dev）確認規格·設計·方向** | ⭐ **本範本** |
| 規格 / ADR 給 **dev audience** 看（技術細節、實作藍圖）| `assets/base-template.html` |
| 大量待拍板事項一次追認 / marathon 收尾 | `marathon-decision-sheet` |
| 純展示報告 / 教學（無需確認）| `explainer`（骨架 A / B）|

**判斷關鍵**：讀者是老闆 / 業務、目的是「掌握方向 + 確認顆粒度」而**不是**讀完整技術分析 → 本範本。

## 核心標準（複製 index.html 後照這五條改內容）

1. **由上而下**：一句話大原則 → 一張圖（核心模型 / 狀態機）→ 使用者操作情境 → 細節。讀者先抓到「大方向」，才往下看。
2. **以使用者操作 UX 為主軸**：按「使用者實際遇到的情境」組織章節（情境 A / B / C…），**不是**按內部規格編號或系統模組。
3. **每情境配角色視角畫面 mock**：用 div + CSS 畫「這個畫面長怎樣」（例：業務視角 vs 客人視角並排）。讓 stakeholder 一眼看出「操作起來 / 改完長怎樣」。禁 ASCII、禁純文字描述。
4. **只呈現三樣東西**：
   - ① **最終規格**（結論，不是推導過程）
   - ② **使用者實際怎麼操作**（UX flow / 畫面）
   - ③ **真正需要拍板的技術決策**（有技術岔路、會影響某情境的；每項附「卡在哪個情境 + 我的建議」，放在該情境末尾）
5. **藏掉這些雜訊**（除非是上面第③類技術決策）：
   - 現況 → 落差 → 修正 的分析推導過程
   - 內部規格編號（R1-R11 / OD1-9 / story id 之類）
   - 「既有 / 要改 / 新造」只當**小標註**（讓 stakeholder 知道建置範圍），不當主軸

## 為什麼這樣設計

stakeholder 的認知成本要花在「方向對不對 + 要不要拍板」，不是「跟著 AI 重走一遍分析」。把 R/OD/落差全列出來反而**稀釋**他掌握規格的能力（使用者原話：「雜訊對我掌握規格反而會困擾」）。

> ⚠️ **兩份產物別搞混**：
> - **analysis-grounded 版**（現況/落差/修正/R/OD 全列、每條接回真實 spec）= 給 **AI 自己 / dev** 對齊用的中間產物、確保規格接得回現實。
> - **本 spec-alignment 版**（top-down + UX 情境 + 只留真決策）= 給 **老闆 / 業務** 對齊用的最終呈現。
> 通常先做前者（完整盤點現況），**再蒸餾成後者**給 stakeholder 看。

## 結構骨架（index.html 章節順序）

1. **Hero**：左邊一句話講清「這在解決什麼 + 核心判斷是什麼」；右邊**題目地圖**（`#qmap-list`），首屏就列出全部要拍的題、可點跳、即時顯示已選狀態。**題號為主、情境為輔**：每題前面是圓框數字（`.q-no`），情境字母只當題名後的淡色小註（`.qm-scn`「情境 A」）。同一個數字要貫穿題目地圖、題卡（「第 N 題（共 M 題）· 情境 X」）、題卡的 `data-title`、回傳列「還差：第 N 題 · …」、落地節奏的「第 N 題」與複製摘要；不要拿情境字母當題號（一個情境可能有兩題，也可能沒有題）
2. **01 一張圖看懂**：核心模型 / 狀態機（div 畫，不用 ASCII）。本例是「鎖單前 ｜工廠鎖單｜ 鎖單後」兩段時間＋中間一道分界線
3. **02 使用者實際怎麼操作**：情境 A/B/C…，每個情境含「業務怎麼做 / 使用者看到什麼」畫面 mock；**要拍板的題目就地放在它影響的情境末尾**（2026-10-27 r1：原本集中在第 ④ 段，讀者要捲過六成頁面才看到第一題，而且題目離它的情境太遠）
4. **03 什麼已有 vs 要做**：一張表（建置範圍速覽）；手機改一列一張卡
5. **04 落地節奏**：本週 / 下週 / 之後，每段標「不必等拍板 / 等第幾題」
6. **05 回傳**：整體備註＋複製按鈕；底部回傳列從頁首就常駐（「已選 n / 6 · 還差：第 N 題 · 題名」可點跳題、已留幾則評論、預覽、複製）。手機上狀態行縮成「已選 n / 6 · 下一題 →」，列高約 63px

## 技術細節

- 色彩、字體、章節樣式用共用 token（同 `assets/base-template.html`）：章節用 eyebrow＋serif h2，情境用小方框 badge。藍色只留一個用途：建置範圍三態裡的「新造」
- 畫面 mock 用 `.screen` / `.screen-bar` / `.screen-body` / `.row` / `.mbtn` class（見 index.html）
- 拍板卡：`data-decision data-id data-title` ＋兩個 radio（採用建議 / 改成別的做法，不預設勾選）＋常駐補充框 `data-comment-for`；選「改成別的做法」時游標自動進補充框。摘要只放已選的題，可以分批貼回。`data-title` 寫「第 N 題 · 題名」，回傳列的「還差：」直接顯示它
- radio 可及性（同 marathon／base）：原生 input 視覺隱藏（`opacity:0`＋`position:absolute`，不用 `display:none`／`visibility:hidden`，否則 Tab 落不到），圓點用 `.dq-opt::before` 畫，整張 label 在 `:has(input:focus-visible)` 時有 3px 外框
- 預覽是從底部升起的抽屜（`#preview-area`），放在回傳列**外面**（列有 backdrop-filter，fixed 的子元素會被困在列裡），停在列上方、附「關閉」鈕；寫法照 `assets/base-template.html`
- 拍板腳本的 `// § scroll-padding`、`// § buildFeedback 複製格式`、`// § 補充提示`、`// § 拍板保存（localStorage）` 四段照 base 同名段落寫，本頁只多兩樣：「改成別的做法」沒寫補充時標「（還沒寫要改成什麼）」；整體備註接在題目後面，也一起存進 localStorage（鍵 `_note`），「清除我的選擇」會一起清
- 跳題（回傳列「還差／下一題 →」、補充提示）捲到題卡後，焦點移到該題第一個 radio（`focus({preventScroll:true})`，同 marathon 的 jumpToCard），鍵盤讀者按空白鍵就能選
- 選「改成別的做法」但補充框空著：這題不算「都選了」，列上與抽屜顯示「第 N 題選了改成別的做法，還沒寫要改成什麼 →」（手機短版「第 N 題還沒寫改法 →」），點了把游標放進該題補充框；複製摘要尾行寫「全部 6 題都選了，但第 N 題還沒寫要改成什麼」
- 全頁評論（`.vt-comment-*` CSS、HTML、腳本）與 session 識別腳本**逐字從 `assets/base-template.html` 同步**，不在頁內另改。複製工具（`vtCopyText`／`vtSelectForManualCopy`）頁內只放一份，放在拍板腳本前面
- 內容寬度：`--wrap-max: 1760px`＋`.wrap` 內距 32px（1440 寬下內容區約 1,290px，跟其他範例一致）；640px 以下 `.wrap` 改 100% 寬＋16px 內距。卡片、表格、附錄展開區、整體備註框都吃滿容器，72ch 行長只套在段落文字
- 不載入外部 CSS 框架（2026-10-27 拿掉 Tailwind CDN）：連結用 `body a`（明寫 `text-decoration-line`），body 行高用 `html body`，h1 用 `body h1`，表單元件用 `body :is(button, input, textarea, select)` 跟著內文的字。高權重寫法當初是為了蓋過 CDN 的重置，沒有 CDN 也無害，留著。拿掉前後 390／1440 首屏與整頁截圖逐像素相同（2026-10-27）
- 複製摘要照 SKILL.md 的 copy-builder 契約：`buildSummary` 內逐題 `getValue("id")` / `getComment("id")`、末尾接 `vtCollectComments?.()`、註冊 `window.vtBuildDecisionExport`；底部回傳列與全頁評論 snippet 都照 base-template 原樣
- 推導、邊界案例、標籤讀法收進 `<details class="reveal">`，摘要行要能獨立判斷值不值得展開
- 決策項若本身是 **UI/UX 版面選擇** → 該項要配 before/after mock；本範本的決策多是**技術/業務岔路**（非版面選擇），故決策卡用「說明 + 建議 + 選項 + 補充」即可，UX 畫面集中在它上方的情境 mock
