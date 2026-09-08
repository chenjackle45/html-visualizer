# Do & Don't

進階風格規範、常見陷阱、何時可以打破規則。

## ⭐ Anthropic 風 signature dos（首選）

預設用這套風格（`color-and-typography.md` 完整定義）。違反任一條會破壞 editorial 質感：

- **底色用 `--ivory` (`#FAF9F5`)**、不用純白
- **主標題用 `--serif`**（Georgia）+ italic 強調（`<h1>...<em>highlighted</em>...</h1>` + clay 色）
- **Hero 含 eyebrow**：mono uppercase + clay 短線（24px × 1.5px）
- **Section index 用 mono 兩位數**：`01` / `02` / `03`、不是 `1` / `2` 也不是 `①` / `②`
- **邊線 1.5px**：不是 1px（看起來太細）、不是 2px（看起來太厚）
- **圓角 14px** for 卡片、**10px** for 次層、**999px** for pill
- **Hover 動效**：`transform: translateY(-3px)` + 浮起陰影 + 邊框變 `--slate`
- **Section intro 縮排 50px**：對齊 section index 視覺軸（手機要 reset）
- **Link card 含 thumbnail + arrow**：thumbnail 132px 高、SVG 幾何圖示、hover 變 oat 底
- **Footer 用 serif italic K-mark**：editorial 收尾儀式

何時不用 Anthropic 風 → 看下方 § 例外。

## ⭐⭐ 決策追認 / Marathon 收尾簡報必含 10 元素

當情境是「**大量待拍板選項 + 需要使用者拍板**」（marathon 收尾、sprint retrospective、PR 一次審完一批 commit、ADR 集合追認、PRD review 等）— **預設用 `examples/marathon-decision-sheet/` 範本起手**、而不是從 `base-template.html` 從零寫。

這些元素必含、缺一個都會降低 user 拍板效率（拍板題 ≥ 5 題時另含**題目地圖**，`verify.py` 會擋）：

1. **Pain Card**（Hero 內）— ⚠️ icon + 大數字（serif italic）+ 為什麼做這個。立刻讓 user grok「問題嚴重性」、不用看下面才理解動機
2. **前情提要段**（02）— 從整體系統流程講起、用 div 流程圖標出本次只動哪格 / 為什麼舊路徑壞（限單向直線鏈；有交接／回頭路改 SVG 結構圖，見 `structure-diagrams.md` §1）。**禁止**直接跳到「我改了什麼」、user 沒前情就無法拍板
3. **Before/After Side-by-side**（03）— `.ba-row` 紅 → 綠對比、含「脆弱點」「改進點」兩個 sub-card。架構變化必這樣呈現
4. **ADR 三件組**（04）— 每個設計決策含「方案 table」`.adr-table` + `.chosen` row 標 ✓、「為什麼選」+「什麼時候要重新評估」兩個 `.card-soft` 並列
5. **失敗處理樹狀圖**（05）— `.tree-node` + `.tree-branch` + 4 種 outcome（`start` clay / `success` olive / `degraded` yellow / `hard-fail` red）+ 每個 leaf 含 `偵測 / 處理 / 觀察` 三段
6. **改前/改後 Metric Cards**（06）— `.metric-side.before` 紅底大數字 → `.metric-side.after` 綠底大數字 + `.metric-delta` 改善百分比。serif italic 大數字
7. **互動拍板段** — 每題一組 radio（**禁用 `<select>` / dropdown**，自檢會擋）、預設值合理（user 直接複製就 OK）、每題旁邊固定可見的 `<textarea data-comment-for>` 補充框（不條件顯示、不 hidden）
8. **Sticky Bottom Bar** — 預覽 + 複製兩按鈕、`buildSummary()` 產 markdown 摘要、剪貼簿 fallback（`execCommand('copy')` 防 Clipboard API 失敗）+ ✅ 視覺回饋
9. **Sidebar Nav with IntersectionObserver** — 滾到哪段自動高亮、依議題分組（「議題」/「程序快答」兩組，`mono` uppercase 小標；不再是「技術說明 / 待你拍板」上下分組）
10. **Progress Counter**（Top header 右側）— 「X / Y 已選」即時更新、每選一個就遞增、給 user 完成感

完整設計細節 + 結構大綱 + 互動 JS 範例見 `examples/marathon-decision-sheet/README.md`。**起手式：複製整個 `index.html`、改內容、不從 base-template 重寫**。

### 何時用此範本 vs 其他範本

| 情境 | 用什麼 |
|---|---|
| 大量待拍板選項（5+ 條）+ user 要拍 | ⭐ `marathon-decision-sheet/`（編輯風 + 互動）|
| 工程儀表板 / 監控介面 / dashboard 風偏好 | `assets/base-template.html` 換 functional token（藍 accent + 純 sans，見 § 何時打破規則）|
| 純展示教學 / 概念解釋 | `examples/explainer/` 骨架 A |
| 純展示報告 / 盤點 / 健檢 | `examples/explainer/` 骨架 B（`anthropic-gallery/` 只給視覺、不給骨架）|
| 規格 / spec / ADR 沒拍板選項 | `base-template.html` 自己組 |

→ 觸發詞：「marathon 收尾」「sprint 結束」「decision sheet」「給我選項拍板」「我醒了 / 我回來了 + 之前有大型工程」「commit 前 review」「ADR 一批追認」皆預設此範本——**但先數實際拍板題數：未滿 5 題改用輕量決策頁**（`SKILL.md` Step 0）。

## ⭐⭐ UI/UX 決策題必附現況 vs 修改後畫面

只要一個**待使用者拍板的決策**本身會改變使用者看到 / 操作的畫面、就**不能只給文字選項** — 必須在該決策卡內並排「現況畫面」和「修改後畫面」的真 HTML mock、讓 user 直接比較體驗再拍板。

這是「必含元素」Before-After UI mock 在**決策題層級**的延伸：不是只有「整份文件是 UX audit / 設計提案」才畫 mock，marathon 拍板簿 / spec / 決策追認裡的**單一 UI/UX 拍板題也要畫**。理由 — 文字選項（「採納 / 不採納」）要 user 自己腦補「改完長怎樣」，腦補不出就拍不下去、或拍錯；並排畫出來、5 秒看完就能比較體驗、拍得準。

### ⭐ Mock 必須貼合產品實際外觀（2026-08-29 拍板、參考 show-me）

mock 要**長得像產品本人**：用該產品的配色、字體、間距、元件形狀（例：後台系統就畫它的藍灰系 + sans、消費端產品就畫它自己的介面語言），並填**真實標籤與真實資料**（真單號、真狀態、真按鈕文案），**不畫抽象灰塊 + 「按鈕」佔位**。理由：抽象示意要拍板的人自己腦補「放進我的產品長怎樣」，等於把翻譯成本丟回給拍板者；貼合實際外觀、看的就是「改完的樣子」。分不清產品長怎樣時，先翻該產品既有頁面截圖 / 元件庫再動筆。

### 怎麼判斷一個決策題算不算 UI/UX

問一句：這個決策的「採納 / 不採納」會不會改變下列任一？會 → 就是 UI/UX 題、必畫 mock：

| 訊號 | 例子 |
|---|---|
| 頁面 / 版面 | 某區塊位置、欄位順序、分欄改單欄 |
| 控制項 | 按鈕增刪 / 文案 / 位置、兩個功能重疊的按鈕要不要合併 |
| 顯示邏輯 | 欄位顯示條件、空狀態、什麼時候冒出提示 / badge |
| 彈窗 / 流程 | modal 保留與否、入口藏哪、幾步操作 |
| 資料呈現 | 表格欄位、原始值 vs 人話（`order.payment_due_at` → 「逾期 7 天」）|
| 文案 | 給 user 看的字句、技術術語要不要改白話 |

→ 純後端 / 架構 / 資料遷移 / commit 拆法 / 排程這類**不改畫面**的決策、維持文字 radio 即可、不用硬畫 mock（硬畫反而過度設計）。

### 兩種形態

**形態 1 — 單一改法（現況 → 建議）**：2 欄 `.ba-grid`（`.ba-col.before` + `.ba-col.after`）、左現況右建議、拍板選項「採納 / 改一下 / 不做」+ 補充 textarea。

**形態 2 — 多方案擇一（現況 + 方案 A / B …）**：N 欄 `.ba-grid.cols-3`、第一欄畫現況、其餘每欄一個候選方案各自 mock、**每欄底部各自一個 radio**（同一 `name`、user 選哪欄＝選哪案）。「給我幾個 design alternative 我選」就是這形態。

兩種形態的 CSS + HTML 骨架見 `component-library.md` § Before-After UI mock side-by-side。

### 反例（不要這樣）

❌ 只給文字選項、要 user 腦補：

> **D-3 報價單兩顆按鈕功能重疊** ☐ 合併 ☐ 維持現狀 ☐ 其他___

✅ 並排畫出來、user 一眼比較體驗：

> 左 mock：現況兩顆按鈕（紅字標「兩顆都送出報價、功能重疊」）｜ 右 mock：合併後一顆主按鈕＋次要連結 ＋ 下方 radio 拍板「採納 / 改一下 / 不做」

## ✅ 做這些

### 內容處理

- **先寫 markdown outline、再翻 HTML**：思考用 markdown、產出用 HTML。寫完 markdown outline 確認結構後再開始畫 HTML
- **每 section 一個明確主題**：「這段要解決什麼？」一句講不清楚就拆
- **資訊密度視覺化 > 文字密度**：3 行卡片 + 圖示 > 10 行段落
- **數字 + 視覺**：每個 KPI 同時有「數字」和「對比視覺」（bar / dashboard）

### 視覺處理

- **淺色 only**（除非 user 明確要 dark mode）
- **容器寬版 `width: min(94vw, 1760px)`**：吃滿寬螢幕、不要兩側大片留白（取代舊「最寬 1400px」規則 — 寬螢幕兩側浪費是 user 實際痛點）。但**長段落文字加 `max-width: 72ch` 行長護欄**保持好讀；grid / 卡片 / 對比 / 表格 / mock 吃滿寬
- **Tailwind utility 為主、CSS variable 為配色**：utility 處理 layout / spacing、CSS variable 處理 token
- **元件複用**：寫第二個類似的 card 之前、看能不能共用 class

### 互動處理

- **互動 = 探索**：使用者可以「玩」trade-off 才加 slider / drag。靜態展示不要加
- **預設值合理**：radio default 選最推薦的選項、user 直接複製就 OK
- **每個 export 都 work**：「複製」按鈕一定要有 fallback、避免 clipboard API 失敗時 silent 失敗

### 開檔處理

- **寫到 `~/Documents/claude-html/{YYYY-MM}/{slug}-{date}.html`、更新索引、自動 `open`**：不要等使用者問「在哪裡看」
- **`{slug}` 對應內容主題**：不要叫 `output.html` / `report.html`、要叫 `meeting-1b-decisions.html` / `auth-redesign-spec.html`

---

## ❌ 不要做這些

### 內容雜訊

- **檔案路徑 / 行號 / 函式名 / 變數名 出現在主要視覺**：
  - 不寫：「handler 在 `packages/gateway/src/server-methods/tools-invoke.ts:34`、scope `operator.write`、無歧義」
  - 改寫：「驗證過：對應的 RPC 入口在閘道端確實存在、權限授權對、無歧義」
  - 例外：可以用 `<code>` 短標 single token（如指 `MAX_TOKENS = 30000` 一個常數）

- **程式碼路徑當主要內容**：路徑放 footer / metadata 區、不要塞 hero / 卡片標題

- **AI 內部術語給使用者看**：「Codex round 1 / round 2」對工程師 OK、對非技術 user 改寫成「對抗審查兩輪」

- **文字疲勞**：> 4 行段落改成卡片 / 表格。不能拆的長段落改用 `<details>` 收合

### 視覺陷阱

- **HTML 內塞 ASCII 樹狀圖 / 流程圖**：
  - ❌ `<pre>├─ Stage 1\n│  └─ Sub-stage</pre>`
  - ✅ 用 `.tree-node` + `.tree-branch` div + CSS 連線（見 component-library）

- **顏色錯位**：紅 = 錯誤 / 痛點、不要用紅當「次要強調」。語意對齊很重要

- **同 chart 重複出現**：B 區 latency 對比 + 又在 ⑤ Evidence 同 chart → 視覺疲勞。用不同 layer / 切角呈現（B 是個別 trade-off / ⑤ 是整體 dashboard）

- **過多深色背景**：淺色 only 原則下、深色背景只用於 stat number 或 hero icon、不要整 section 反白

- **emoji 濫用**：每個段落都 emoji 開頭 → 像 LinkedIn 文。一個 section 用 1-2 個 icon 就好

### 互動陷阱

- **沒功能的按鈕**：「複製決策摘要」按下去沒反應 / 沒視覺回饋 → 使用者不知道有沒有複製成功

- **強迫互動**：純展示文件加 radio 選項要使用者 review 每張卡 → 過度設計、文章 Thariq 警告「don't make it a product」

- **過度炫技**：Failure mode 加可點 simulate、Timeline 加 replay 動畫 → 沒人會玩、ROI 低

- **互動但不 export**：使用者調了一堆 slider / 拖了一堆卡片、沒 export 按鈕把 state 倒回 prompt → 白搞

### 開檔陷阱

- **路徑寫死成 `/Users/...`**：不要、用歸檔目錄或專案內相對路徑
- **不開檔等使用者自己找**：寫到磁碟卻不告知 / 不 open → 使用者等待
- **檔名重複覆蓋**：每次都用同一個檔名（如 `output.html`）→ 上次的被蓋。用日期 / slug 區分

---

## 何時可以打破規則

### 何時用 functional 風（藍 + 純 sans）取代 Anthropic 風

預設一律用 Anthropic 風。下列情境例外、可改用 functional 風（藍 accent + Tailwind utility + 純 sans-serif、不用 serif 標題）：

| 情境 | 為什麼 |
|---|---|
| 工程儀表板 / 監控介面 | 工程慣例、藍色累積信任（Linear / Datadog / GitHub）|
| 重度互動表單（決策追認、設定畫面）| Functional 視覺更密集、適合反覆操作 |
| 內部工具 / admin panel | 不對外、不需 editorial 質感 |
| 使用者明確要求「dashboard 風」 | — |

決策表 / 工程文件邊界判斷：**有大量 user 互動 + 強語意 status（採納 / 推翻）→ functional**；**editorial 內容（教學 / 報告 / 探索）→ Anthropic**。

functional 風沒有獨立範例：拿 `assets/base-template.html` 把 accent 換藍、字體換純 sans 即可；`examples/anthropic-gallery/index.html` 是 Anthropic 風範例（clay accent + serif）。

### 可以 ASCII 圖的情境

- HTML 內 `<pre>` block 顯示「程式輸出範本」/「終端機 log」：這是內容、不是視覺化
- 系統 architecture diagram 不要用 `<pre>`——分區與跨區連線走 `references/structure-diagrams.md` 的 SVG 架構圖。**單向直線鏈用 div Flow；純分類階層（每節點一個父、只有「屬於」關係）用 div Tree**；**流程有條件出口（分支）、跨角色交接、回頭路、分區跨線、多父或有環的一律 SVG 結構圖**（2026-09-05 拍板，取代舊的「流程圖一律用 div」）

### 可以 dark mode 的情境

- 使用者明說「給我 dark mode」
- 內容是 code-heavy / monitoring dashboard / debug 介面、慣例上是深色

### 可以塞檔案路徑的情境

- 內容主題就是「檔案結構說明」/「git diff 解釋」
- footer / appendix 附 reference 段、可放路徑作 anchor
- API contract / 規格文件需要精確 reference

---

## 風格 checklist（產出前確認）

寫完 HTML 前過一遍：

- [ ] 配色用 CSS variable、不是寫死 hex
- [ ] 至少有一個 hero 區（含主題 + 副說明）
- [ ] 每 section 有明確主題、不互相混
- [ ] 沒檔案路徑 / 行號塞在 hero / 卡片標題
- [ ] 字數密集處改用卡片 / 表格 / 視覺化
- [ ] 互動元件有預設值（radio default checked；拍板題不用 select）
- [ ] export 按鈕有 fallback + 視覺回饋（複製成功 toast）
- [ ] Local storage 自動保存（如有 form）
- [ ] Sidebar nav 自動高亮（如有 nav）
- [ ] 響應式 OK（手機 single column）
- [ ] 寫到 `~/Documents/claude-html/{YYYY-MM}/` 且跑 `reindex.py` 後 `open`

---

## 取捨原則（用文章作者 Thariq 原話對照）

| 文章原話 | 對應這個 skill |
|---|---|
| Information Density | 用 component library 而非 markdown 段落 |
| Visual Clarity & Ease of Reading | 50 行以上文件預設 HTML、不 markdown |
| Two-way Interaction | radio / slider / drag / export 看情境加 |
| Custom Editing Interfaces | 一次性 throwaway HTML、不做 reusable product |
| End with an Export | 互動結束總要有 export 回 prompt 機制 |
| Joyful | 寫得開心、user 看得舒服、就是對的 |

> 如果寫到一半覺得「這 user 應該不會想看」、停下來重新想結構 / 主題，不要硬產。
