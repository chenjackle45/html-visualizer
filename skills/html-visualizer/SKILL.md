---
name: html-visualizer
description: 把長文件 / 報告 / 規格 / 設計決策（ADR）/ 架構說明 / 研究結論 / PR review / 教學 / 儀表板 / 互動式探索界面 / 決策追認 / marathon 收尾簡報 / prototype 預設用 HTML 而非 Markdown 呈現給人類看。觸發場景包含但不限於：使用者說「整理成文件 / 做一份報告 / 給我份視覺化 / 圖像化呈現 / 給人看的版本 / 報告我老闆 / 做個 dashboard / review 用 / 教我這個概念 / 做個解釋 / 寫個 spec 給我看 / 給我幾個選項拍板 / 列待確認的決策 / marathon 結束追認 / sprint 收尾 / 我醒了回報狀況」、或內容超過 50 行 markdown、或累積 2+ 條待使用者拍板的選項、或內容適合用對比圖 / 流程圖 / 表格 / 卡片視覺化呈現時。即使使用者沒明說 HTML、只要情境是給人類閱讀的長文件 / 視覺化內容 / 含拍板選項的決策追認、應主動使用此 skill。精神是「人類看 HTML、AI 看 Markdown」— AI 思考 / 規劃 / Inter-agent 溝通用 Markdown、最終給人類看的長文件用 HTML。
---

# HTML Visualizer

把資訊圖像化呈現給人類閱讀的萬用 skill。

## 核心精神

> **人類看 HTML、AI 看 Markdown**

- **AI 思考 / 規劃 / Inter-agent 溝通**用 Markdown（密度高、AI 處理快）
- **最終給人類看的長文件**用 HTML（視覺化、易閱讀、可互動、可分享）
- 不是兩份 output、是同一個 source 用對的 representation 給對的 audience

## 預設視覺風格：Anthropic / Claude 官方品牌風

預設用 **Anthropic 風格**（ivory 米白底 + clay 赤陶 accent + serif 標題 + italic 強調 + warm gray）— editorial / book / magazine 質感、跟 Claude 官方品牌一致。

完整 design tokens 見 `references/color-and-typography.md`、Anthropic-signature 元件見 `references/component-library.md` § 首段。Reference 範本見 `references/examples/anthropic-gallery/index.html`。

**例外**：工程儀表板 / 重度互動表單 / 內部工具 / 使用者明確要 dashboard 風時、改用 functional 風（藍 accent + 純 sans）。判斷規則見 `references/do-and-dont.md` § 何時打破規則。

---

## 何時用

預設用 HTML（不要問使用者）：

| 情境 | 範例 |
|---|---|
| 報告 / 研究 / 分析 | 「整理一下分析結果給我看」 |
| 規格 / spec / 設計決策（ADR）| 「寫個 spec 給我看」 |
| 架構說明 / 系統文件 | 「解釋這個系統怎麼運作」 |
| PR review / 程式碼說明 | 「幫我整理這個 PR 的變更」 |
| 教學 / 概念解釋 | 「教我這個概念」 |
| 儀表板 / 進度追蹤 | 「做個 progress dashboard」 |
| 互動式探索 / playground | 「讓我可以調參數試試看」 |
| 決策追認表 / 詢問選項 | 「列出選項讓我選」 |
| ⭐ **UX audit / 設計提案 / 視覺改版** | 「審視這個頁面 UX」/「給我改版建議」/「體檢一下這個畫面」 |
| ⭐ **對比型 review（現況 vs 建議）** | 「列出有問題的地方 + 怎麼改」/「audit 報告」/「設計 review」 |
| 長 markdown（超過 50 行） | 任何長文件。50 行約等於終端機兩個畫面——超過就得反覆捲動才能前後對照，HTML 的結構化排版才開始划算。覺得太鬆或太緊，直接改這個數字 |

預設用 Markdown / 純文字（**不**用此 skill）：

- 短 Q&A、單句回應
- 程式碼 fix、技術討論
- 終端機 output 格式
- AI 內部 scratch / 思考過程
- 使用者明確要求「給我 markdown」/「純文字」/「在 chat 直接給我」

---

## 工作流（給 AI 自己看）

### Step 0 ⭐ 場景判斷與範本選擇（必做、決定起手式）

寫第一行 HTML 前、**先用以下對照表選範本**。這一步沒做對、後面 visual / 互動都會走錯方向：

| 內容性質 | 用什麼範本起手 | 強制特徵 |
|---|---|---|
| **Marathon 收尾 / Sprint 結束 / 待拍板事項 ≥ 5 題 / 標題含 "marathon" / "收尾" / "追認" / "review 一批" / 含 "pending" / "QA pass" / "未 commit" / "未 push"** | ⭐ **`references/examples/marathon-decision-sheet/`** — 必先讀 該 README + 複製 `index.html` 改內容 | 題目地圖 / 就地拍板 / radio / sticky bottom bar with copy / sidebar nav / progress counter / pain card / before-after / failure tree / metric cards 全要 |
| ⭐ **拍板題 < 5 題（不論關鍵字命中幾個）** | `assets/base-template.html` + 就地拍板卡（複製 marathon 範本的 `.inline-decide` 區塊與 sticky bar / 複製 builder）| **不套六段敘事**：開場兩三句講清背景 → 題目立刻出現，每題自帶背景與對照 |
| 工程儀表板 / 監控介面 / dashboard 風偏好（user 明說）| `assets/base-template.html` 換 functional token（藍 accent + 純 sans；規則見 `references/do-and-dont.md` § 何時打破規則）| 就地拍板卡與 sticky bar 照 marathon 範本複製 |
| ⭐ **教學 / 概念解釋 / 機制說明**（無待拍板）| ⭐ **`references/examples/explainer/`** — 必先讀 README 選骨架 A | 骨架 A 七段（一句話 → 類比 → 核心模型 → 走一遍 → 誤解 → **邊界** → 收合深入）+ 解釋類元件 + 漸進揭露 |
| ⭐ **報告 / 盤點 / 健檢結論 / 研究結果**（無待拍板）| ⭐ **`references/examples/explainer/`** — 骨架 B | 骨架 B 六段（結論先講 → 全貌地圖 → 逐塊展開 → 交叉切面 → 待觀察 → 附錄收合）|
| ⭐ **程式開發解說**（解釋剛改了什麼 / PR 導讀 / 架構變更說明；開發者受眾）| `assets/base-template.html` + code-shape 元件（**不套七段教學骨架、太重**）| 輕量三段：先講結論 → 結構 diff 或 call tree 秀「改了什麼 / 長什麼樣」→ 逐塊展開；code-shape 必配摘要文字說明；函式名可當內容、路徑當灰字註腳（見 `references/component-library.md` § Code-shape）|
| 只要視覺風格參考、內容結構自理 | `references/examples/anthropic-gallery/` 或 `assets/base-template.html` | 編輯風純展示；⚠️ 這兩份**只給視覺不給骨架**，內容順序請照 explainer 的骨架走 |
| ⭐ **規格 / 設計 / 方向要跟非技術 stakeholder（老闆 / 業務）對齊確認** | ⭐ **`references/examples/spec-alignment/`** — 必先讀 README + 複製 `index.html` | 由上而下（一句話 → 一張圖核心模型 → 使用者操作情境）+ 每情境配角色視角畫面 mock + 只留「最終規格 / 使用者 UX / 真正要拍板的技術決策」；**藏掉 現況→落差→修正推導、內部編號（R/OD/story id）、非決策細節**（雜訊會稀釋 stakeholder 掌握規格的能力） |
| 規格 / spec / ADR（**dev audience**、技術細節藍圖）| `assets/base-template.html` | 自己組元件 |

**判斷流程（1 分鐘）**：

1. 讀 user 原始 prompt + 內容素材、找這些訊號：
   - 直接訊號：「marathon 收尾」「sprint retro」「給我選項拍板」「列待確認」「我醒了 / 回來了 + 有 marathon 收尾」「decision sheet」
   - 間接訊號：素材內含 5+ 條「待 user 確認 / 拍板 / review / 寫入 / commit」事項、或含「pending QA」「未 push」「未 commit」「等 user」字眼
2. **任一訊號中 → 先數「實際要 user 拍板的題數」**（不是數關鍵字次數）：
   - **≥ 5 題 → marathon-decision-sheet 範本**（強制、不要 fallback）
   - **< 5 題 → 輕量決策頁**：base-template + 就地拍板卡，開場兩三句就進題目。⚠️ 不要因為關鍵字命中就硬套六段敘事——實測 5 題的內容被套成 2265 行、每題墊了四百多行前置閱讀，讀者要捲過 58% 才看得到第一題
3. 都不中 → 對照表選其他範本

### Step 1 思考階段（用 markdown）

1. **理解需求**：呈現什麼資訊、給誰看、為了什麼決策
2. **Read 對應範本 README**（marathon-decision-sheet 的話、必先讀）
3. **規劃結構**：依範本框架寫 markdown outline（區段順序、每段重點、需要的視覺化類型）
   - ⭐⭐ **每題先配對它的背景段落**（hard rule、決定閱讀動線）：列出每道拍板題，標出「讀者要拍這題，得先知道什麼」。
     - **有對應背景 → 該題就地放在那段的末尾**（同一張卡：問題 → 方案對照 → 選項 → 補充框）。**禁**把它丟到文件尾段的決策區
     - **不需要背景就能拍**（延後項目 / 要不要寫進記憶 / 怎麼驗 / 提交拆法 / 要不要推送）→ 收進尾段「程序快答」
     - 配對表寫進 outline，寫 HTML 時照著擺。⚠️ 舊版把說明全放上半、拍板全放下半，兩邊用不同分類軸切，讀者拍板時找不到回去的路——這是本 skill 修過最嚴重的動線問題，不要退回去
   - ⭐ **圖像化優先**：outline 的每一段都要問「這段能不能用畫的」。**預設用視覺元件承載資訊，文字只做補述**——流程用流程圖 / 對比用並排 mock / 結構用樹狀或版面縮圖 / 分類用卡片矩陣 / 數據看形狀就交棒 `chart`。連續三行以上的純文字說明就是訊號：停下來想有沒有對應的視覺形態（元件清單見 `references/component-library.md`、資料圖表交棒 `chart`）
   - ⭐ **挑最小的視圖**（2026-08-29 拍板，參考 show-me）：每段選視圖時用下表挑「能把重點講清楚的**最小**視圖」，且**一頁通常只用其中一兩種、別淹沒讀者**：

     | 要講的點 | 最小視圖 |
     |---|---|
     | 演算法 / 判斷邏輯 | pseudocode（code-shape）|
     | 執行期呼叫關係 | call tree（code-shape）|
     | UI 結構與狀態歸屬 | component tree（code-shape）|
     | 檔案分工 / 大型重構 | 淺層檔案責任樹（code-shape）|
     | 跨部件互動時序 | SVG 時序圖（`references/structure-diagrams.md` §7.3；有分支用組合片段）|
     | ⭐ 分支 / 角色交接 / 回頭路 / 分區跨線 / 多父或有環的依賴 | **SVG 結構圖**（`references/structure-diagrams.md`：流程圖 / 泳道 / 狀態機 / 架構 / 依賴圖…）；單向直線鏈才用 div 流程圖。**該圖 ≥6 格 → 掛探索層**（§6.7：點格聚焦 / 追上下游 / 兩點路徑 / 章節視角；`assets/diagram-explore.{css,js}` 內嵌）|
     | 改了什麼（結構 / 流程 / 檔案佈局）| 結構 diff |
     | 改了什麼（畫面外觀）| Before-After UI mock |
     | 資料的形狀 | 交棒 `chart` |
4. **思考互動**：marathon-decision-sheet 必含 radio + sticky copy + 題目地圖（題數 ≥ 5）；其他範本依需求加
   - ⭐ **逐題標記 UI/UX 決策**：掃每個待拍板決策題、標出本身涉及 UI/UX 的（頁面 / 按鈕 / 欄位顯示 / modal / 流程入口 / 排版 / 順序 / 顯示條件 / 文案呈現）。被標到的題 → 規劃時就排進「現況畫面 vs 修改後畫面」對比 mock、**不要只列文字選項**。判斷準則見 `references/do-and-dont.md` § UI/UX 決策題

### Step 2 產出階段（寫 HTML）

5. **起手式**：
   - **marathon-decision-sheet 場景** → 複製 `references/examples/marathon-decision-sheet/index.html` 改內容、保留 CSS / JS / 結構
   - 其他場景 → 複製 `assets/base-template.html` 起手
   - **絕不從零寫**
6. **填內容**：把 markdown outline 翻成 HTML 元件、保留範本的互動 JS
7. **配色 / 字體**：照 `references/color-and-typography.md` 的 token、不要自創
8. **存檔**：寫到 `~/Documents/claude-html/{YYYY-MM}/{slug}-{date}.html`（歸檔根目錄可用環境變數 `HTML_VISUALIZER_ARCHIVE_DIR` 改）（**不要再寫 /tmp**——系統暫存區重開機就清空，而這些產出常被回頭參照）。先寫死、Step 3 自檢後再 open

### Step 3 ⭐ 審稿階段（寫完 HTML 後、open 前必跑）

寫完 HTML 不要立刻 open 給人看 — 必須先跑中英混雜詞審稿。HTML 是給人類看的長文件、中英混雜詞讀起來不順、特別影響 user-facing 體驗。skip 這一步、user 看了會回來指出「不中不英看不懂」、徒增來回。

9. **跑中英混雜詞審稿**：
   - Read `references/cn-en-translation-checklist.md` 看替換清單 + 保留原則
   - 用 Python script 批次替換對照表中的詞（順序：長片語先、短詞後）
   - 範例 script 在 reference 檔末段、可直接複製改用
10. **保留技術專有名詞**（替換清單明列）：
    - Skill 名 / git 命令 / framework / library / CT 名 / field name / endpoint path
    - 公知縮寫（API / RBAC / SSE / PBX / TLS / DOM）
    - 敏捷用語（Story / Epic / Sprint）
11. **元件名首次出現加註中文**（例：`BindCustomerDialog（客戶綁定對話框）`）；之後同元件可省略註解
12. **句構檢查**：批次替換完整 read 一遍 — 替換可能造成句構斷裂（嵌套引號 / 多餘空格 / 詞性不通）、必修
13. ⭐⭐ **跑自檢指令**（取代過去十來條手打 grep）：

    ```bash
    python3 <本 skill 目錄>/scripts/verify.py <file>
    ```

    一次跑完並依產出類型自動分流：結構完整性（標籤平衡 / 標題）、⭐**腳本健檢**（每個 inline script 跑 `node --check` / JS 抓的元素 id 真的存在）、Session 識別已填值、拍板機制（決策卡 ↔ 選項 ↔ 摘要三方一致 / 每題有補充框且被抓取 / 複製摘要三件套 / 無下拉選單）、閱讀動線（第一題位置 ≤ 40% / 題數 ≥ 5 有題目地圖）、呈現品質（每段都有視覺元件 / 中英混雜詞）。

    🔴 **腳本健檢為什麼存在**（2026-08-13 實際事故）：一份決策頁 13 項自檢全過、open 給使用者後，複製鈕**按了完全沒反應**。根因是 JS 字串裡混進真正的換行字元 → 整個 script 區塊 SyntaxError → 事件監聽器從未掛上。**結構、拍板機制、文案檢查全都看不到這種錯——它不在標記裡，在「腳本能不能跑」。** 高風險寫法：用腳本產生 HTML（腳本寫腳本）時，`\n` 之類的轉義會被多吃一層；要放換行改用 `String.fromCharCode(10)` 常數，完全不用轉義字元即免疫此類問題。
    ⚠️ 機器上沒有 `node` 時這項會標成「無法驗證」而**不是通過**——看到它就別當作驗過了。

    🔴 **執行期健檢**（2026-09-09 加，同一支指令內建，用 playwright 真的把頁面跑起來）：抓載入時的 pageerror，再按一次複製鈕與預覽鈕，看頁面有沒有任何可見變化。

    **為什麼存在**（2026-09-09 同型事故再一次）：決策頁砍掉了「題目地圖」那段 HTML，腳本裡 `qmap.remove()` 對 null 炸掉，同一個 script 區塊後面的複製鈕監聽器全沒掛上。語法檢查、版面健檢、拍板機制三方一致全綠，「JS 參照的元素都存在」只給黃燈並註「動態產生的可忽略」，於是被忽略了。**靜態檢查永遠有下一種漏法**（08-13 是換行字元炸 SyntaxError、09-09 是 null 存取）；「載入 → 有沒有炸 → 按下去有沒有變」這三步不會漏。回掃當月 112 份產出，另抓到 3 份載入就炸的頁面。
    ⚠️ 同一個 script 區塊裡任何一行炸掉，**它後面的所有監聽器都不會掛上**；砍範本區塊時，對應的 JS 要一起砍或加 null 防護（範本 `renderQuestionMap` 已補）。
    ⚠️ 這項標「未驗證」時同樣**不算通過**。

    ⭐ **樣式健檢**（2026-09-08 加，同一支指令內建）：掃每個 inline `<style>`，抓三種會讓瀏覽器**從該行起丟棄後面所有 CSS** 的結構錯——多一個 `}`、規則沒收尾、孤兒屬性（規則開頭被切掉）。

    🔴 **為什麼存在**（2026-09-08 實際事故）：一份決策頁 9 項自檢全過、版面健檢在三個寬度都說沒跑版，open 給使用者後**整頁沒有樣式**。根因是前一天用 `sed -n 'A,Bp'` 從範本切 CSS 片段，切點落在規則中間。當時做過括號檢查、得到「左 158 右 158 平衡」——因為多切掉一個 `{` 又多留一個 `}`，數量剛好抵銷。**括號平衡量的是數量，CSS 合法性要的是結構。** 而且失效是沉默且連鎖的：症狀出現在離錯誤很遠的地方（錯在第 508 行、新加的樣式在第 667 行），看新加那段永遠找不到原因。
    🔴 **四種可讀性崩潰為什麼要另外量**（實際事故）：一份報告 18 項自檢全過、版面健檢三個寬度都說沒跑版，交付後被回報**日期清單的中文被壓成一個字一行**。根因是為了讓「每段都有視覺元件」變綠，把共用樣式已定義的 `.timeline`（七欄網格）套到一個兩欄清單上，兩套佈局互相覆蓋。**原本的檢查看不到**——直排既不溢出視窗、也沒有文字被切掉，只是變得超高。同一個 class 撞車還可能表現成元素被壓扁、文字看不見、被蓋住，所以四種一起量。
    🔴 **連帶新增 class 撞車靜態檢查**（在「樣式健檢」段）：同一個元素掛了兩個都在管佈局的 class 就報，跨 `<style>` 區塊（自訂 CSS 撞共用樣式）判 `✗`、同區塊（作者刻意覆寫，例如 `.ba-grid.venn` 改欄數）只給提示。**它抓的是原因、四種崩潰抓的是症狀**，兩邊互補。
    🔴 **不要為了讓某項自檢變綠而套用已定義的 class 名**——這正是上面那次事故的動作。要新元件就用自己的命名空間；套用前先 `rg '\.<名字>\s*\{' <head 檔>` 確認共用樣式沒定義過。凡是「為了過檢查」而改的東西，一律要親自看渲染結果，不能只信同一支自檢再跑一次通過。
    🔴 **表格欄位失衡＋逐寬度截圖**（2026-09-09 加，版面健檢內建）：量每張表格，某欄平均超過 12 字卻被壓到不足 8 字寬、疊 6 行以上，且同表另一欄寬它 2.5 倍以上就報；`<td>` 上掛 `white-space: nowrap` 而內容 ≥ 40 字也報。每個寬度另存一張整頁截圖並印出路徑（預設在系統暫存目錄的 `html-visualizer-shots/`，可用 `HTML_VISUALIZER_SHOT_DIR` 改）。

    **為什麼存在**（2026-09-09 實際事故，同一天第二次）：一份評估頁 18 項自檢全過、三個寬度都說沒跑版，開給使用者後**方案表的「做法」「改動」兩欄一行只剩三四個字，「取捨」欄佔了一半寬**。根因是為了讓 390px 的「文字被壓成直排」變綠，給表格末欄加了 `white-space: nowrap`——手機寬度確實過了，桌機上那欄把整列寬度吃光。直排檢查的門檻是「不到三個字寬」，一行四個字疊十行量不到；而作者改完只重跑同一支自檢、沒看畫面。**這正是上一條「為了過檢查而改的東西一律要親自看渲染結果」講的事，規則已經寫在那裡、還是踩了**——所以現在把截圖直接印在結果裡：跑完自檢**必看 1440px 那張截圖**，不看不算跑完。

    表格的正確寫法：`table-layout: fixed` ＋ `<colgroup>` 明定各欄百分比；只有「A／B」這種標籤欄可以 `nowrap`；手機寬度包一層 `overflow-x: auto` 讓整表橫向捲動，不要動欄位的換行。範例見 `references/component-library.md` § 方案對照表。

    ⚠️ **版面健檢證不了樣式有生效**——它量的是溢出座標，樣式全失效時每個元素都還在自己位置上、量不出異常。兩項要一起看。
    ⚠️ **不要用行號切 CSS 片段**：要複用範本樣式就整段複製到規則邊界，或整份 head 一起帶。

    ⭐ **版面健檢**（同一支指令內建，用 playwright 無頭 chromium 在 390 / 768 / 1440px 真的把頁面畫出來）：量整頁橫向溢出、凸出視窗的元素、被容器切掉的文字，**以及樣式撞車的四種可讀性崩潰**（文字被壓成直排／元素被壓扁到沒有高度／文字與背景對比不足看不見／被不透明元素蓋住），並指名是哪個元素。**跑版不在標記裡**——同一份 HTML 可以在桌機好好的、在手機整片凸出去，靜態掃 class 名稱永遠猜不到，只有量出來的座標算數（首次上線就在自家決策頁抓到 6 處手機跑版）。趕時間可加 `--no-layout` 跳過；找不到瀏覽器時同樣標「未驗證」而非通過。 pnpm 專案的 playwright 不會被提升到 `node_modules/playwright`，指令從專案根跑仍會說找不到；設 `HTML_VISUALIZER_PLAYWRIGHT_ROOT=<repo>/node_modules/.pnpm/playwright@<版本>/node_modules` 即可。

    - **有 `✗` 就修完再 open**，不要先開給人看。唯一例外：含 SVG 結構圖的頁面，版面健檢對 `<svg>` 報「凸出視窗」時，先確認它外層是不是 `.figure`（受控橫向捲動）——是就屬預期。**「文字被切掉」對 SVG 已不再誤報**（腳本已排除 SVG 子元素），所以那條紅字要當真。SVG 文字真正的檢查是 `scripts/svg-text-check.mjs`（`references/structure-diagrams.md` §9），`verify.py` 偵測到 `<svg>` 會自動幫你跑
    - ⚠️ 別再自己現寫 grep：手打正則出錯會產生假警報（實測踩過——寫錯的檢查回報「每段都是純文字牆」，其實產出沒問題）

14. ⭐ **看截圖**：版面健檢每個寬度都印了整頁截圖路徑，用你的看圖工具看 1440px 那張（手機版另看 390px）。這一步不是可選——2026-09-09 兩次同型事故都是自檢全綠、畫面不能看。
15. ⭐ **人工確認指令標 `!` 的兩項**（機器判斷不了）：
    - **UI 決策題的畫面對照**：指令只報「幾個畫面樣張 / 幾題」，要你自己判斷哪些題涉及畫面（頁面 / 按鈕 / 欄位顯示 / modal / 排版 / 順序 / 文案）。涉及畫面的題**每題至少 2 個樣張**（現況 + 改後），判準見 `references/do-and-dont.md` § UI/UX 決策題
    - **純展示的骨架順序**：指令只列出段落 id，要你自己對照骨架 A / B（見 `references/examples/explainer/README.md`）。骨架 A 缺「一句話定義 / 核心模型 / 邊界」任一、骨架 B 缺「結論先講 / 待觀察」任一，即違規
16. **跑完才 open**（存放路徑與索引見 § 開檔方式）

**例外情境**（規則不適用、不需審稿）：
- AI 內部思考 / 規劃 / inter-agent 溝通的 markdown — 中英混雜 OK（AI 看 markdown）
- code / commit message / spec markdown 內部技術討論 — dev audience、保留

---

## 必含元素

每個 HTML 產出**必須**有：

| 元素 | 細節 |
|---|---|
| `<title>` | 對應內容主題、不要用「Untitled」/「Document」 |
| Tailwind CDN | `<script src="https://cdn.tailwindcss.com"></script>`、不用 build tool |
| 配色 token | 從 `references/color-and-typography.md` 複製 CSS variables、不自創 |
| 字體 stack | Apple system + Noto Sans TC、見 typography reference |
| 容器寬度 | 主容器 `width: min(94vw, 1760px)` 寬版置中（吃滿寬螢幕、不浪費兩側留白）；**長段落文字另加 `max-width: 72ch` 行長護欄**、grid / 卡片 / 對比 / 表格 / mock 吃滿寬。範本 `.wrap` 已內建此策略、直接複製即可 |
| Header | 標題 + 副標、含日期 / 進度 / context |
| 主要區段 | `<section id="...">` 帶 anchor 給 nav 用 |
| Footer / Sticky bar | 如有互動或 export 需求、加 sticky bottom bar |
| ⭐⭐ **就地拍板**（有待拍板題時）| 每題放在它的背景段落末尾、同一張卡收完「問題 → 對照 → 選項 → 補充框」；只有不需要背景的程序題才收進尾段「程序快答」。範本 `.inline-decide` 區塊即此形態 |
| ⭐ **題目地圖**（拍板題 ≥ 5 題時）| 開場區之後放一張「本次要你拍 N 題」清單卡：每題一行 + 已選 / 未選狀態 + 點擊跳到它的段落。讓「已有脈絡、只想拍完」的讀法不必捲過整篇。範本用 `renderQuestionMap()` 自動生成、不用手工維護 |
| ⭐ **圖像化承載**（每個主要區段）| 資訊優先用視覺元件呈現、文字只做補述。連續三行以上純文字說明 = 該回頭找對應的視覺形態（`references/component-library.md`；真資料圖表交棒 `chart`）|
| ⭐⭐ **Session 識別**（每份產出都要）| 多視窗並行時，一眼認出這份是哪個 session 產的。**寫 HTML 前先跑** `eval "$(<本 skill 目錄>/scripts/session-label.sh)"` 取得 `$VT_LABEL` / `$VT_ID`，填進 snippet 的 `window.VT_SESSION`。三層識別（分頁標題前綴 / 彩色 favicon / 頂部色帶徽章）整段見 `references/session-identity.md`；`base-template` 與 explainer / spec-alignment / marathon-decision-sheet 三份範例已內建、只需填值 |
| ⭐ **解釋型骨架**（純展示內容）| 內容順序照 `references/examples/explainer/README.md` 的骨架 A（概念解釋）或骨架 B（報告盤點）走，不要每次重新發明。**邊界段不可省**（沒有它讀者會把剛學到的東西過度外推）|
| ⭐ **漸進揭露**（長的純展示內容）| 主線只留所有人都該知道的，原理 / 推導 / 邊界案例收進 `<details class="reveal">`。摘要行必須能獨立判斷值不值得展開，寫「更多」等於沒寫。見 `references/interaction-patterns.md` § 漸進揭露 |
| ⭐ **全頁評論 snippet** | 預設內建（複製 `references/interaction-patterns.md` § 全頁評論系統 整段進 `</body>` 前）|
| ⭐ **預覽 + 複製 modal**（有 export 按鈕時）| 既有「複製給 AI」按鈕點下去 → 彈 modal 顯示完整內容 → 確認後才複製。Pattern 見 `references/interaction-patterns.md` § Multi-format export |
| ⭐⭐ **複製 builder 必整合所有 user 輸入**（hard rule） | 「複製拍板摘要 / 複製給 AI」類按鈕背後的 `buildSummary()` / `buildPrompt()` builder **必須**滿足三件事、否則違規：<br>① 末尾接 `+ (window.vtCollectComments?.() || '')` 拼全頁評論<br>② 註冊 `window.vtBuildDecisionExport = builderFn` 隱藏 fallback 重複按鈕<br>③ **每個 radio / select 拍板題旁邊必須配 `<textarea data-comment-for="<id>">` 補充框**，builder 內透過 `getComment(id)` 抓取拼進對應行<br>👉 整套寫法見 `references/examples/marathon-decision-sheet/index.html`：搜 `function buildSummary`（含 `getComment` 與末尾拼接 `vtCollectComments`）與緊接其後的 `window.vtBuildDecisionExport = buildSummary`；`vtCollectComments` 本體在評論 snippet 段（搜 `window.vtCollectComments =`）。行號會漂、以函式名為準 |
| ⭐ **Before-After UI mock**（UX audit / 設計提案 / 對比型 review 場景必含；**＋任何待拍板決策題本身涉及 UI/UX 時、該題也必含**）| 每條 finding／每個 UI/UX 決策題用 `.ba-grid` + `.ba-col.before/.after`（多方案則 `現況 ｜ 方案A ｜ 方案B` N 欄）+ `.mock` 並排 → **左側真 HTML mock 出現況畫面 + 紅字標問題點、右側 mock 出修改後畫面**。**禁** ASCII 模擬 / `[表格略]` 抽象描述 / 純文字 bullet 列點 / 只給「採納·不採納」radio 卻不畫畫面。User 一眼看出「現在長怎樣、改完長怎樣」再拍板。**mock 必須貼合該產品實際外觀**（配色 / 字體 / 元件形狀）並用**真實標籤與真實資料**、不畫抽象灰塊（2026-08-29 拍板）。⚠️ 這條管**畫面外觀**變更；**結構 / 流程 / 檔案佈局**變更改用結構 diff（三分法見 `references/component-library.md` § 結構 diff）。判斷哪些決策算 UI/UX + 單方案/多方案兩形態見 `references/do-and-dont.md` § UI/UX 決策題；Pattern + CSS 見 `references/component-library.md` § Before-After UI mock side-by-side |

---

## 🤖 何時切 subagent 跑此 skill（軟提醒）

預設**主 session 跑**。以下少數場景才考慮 subagent：

| 場景 | 推薦 |
|---|---|
| Marathon 收尾 / Sprint retro / 決策追認（強脈絡 + 必 follow-up）| 主 session 跑（subagent 失去脈絡的成本 > 省 token） |
| 規格 / 教學 / 概念解釋（會 follow-up「改一下這段」）| 主 session 跑 |
| 內容素材自包含、寫完即丟、無 follow-up 預期 | 可考慮 subagent（但收益有限）|
| 主 session context 已 > 70%、馬上要繼續其他工作 | 切 subagent（反正主 session 也快滿了）|

**判斷準則**：HTML 寫完後 user 會不會 follow-up？會 → 主 session（subagent 退出後重接成本更高）；不會 → 可 subagent。

---

## 嚴格禁止

| 禁止 | 為什麼 |
|---|---|
| HTML 內塞 ASCII 樹狀圖 / 流程圖（`├─ └─` 之類）| 既然用 HTML、就用視覺元件畫。⭐ 程式開發解說場景（2026-08-29 拍板）：呼叫階層 / 元件樹 / 檔案分工用 **code-shape 元件**呈現（帶樣式等寬區塊＋語法上色、**必配摘要文字說明**，見 `references/component-library.md` § Code-shape）——那是排版過的元件、不是裸 ASCII 貼上，裸 ASCII 依然禁止 |
| Code path / 行號 / 函式名 / 變數名 當主要內容 | 對非技術受眾維持：用邏輯描述、必要時 monospace 註腳。⭐ **開發者受眾的程式解說頁例外**（2026-08-29 拍板）：函式名 / 元件名就是內容本身、檔案路徑降級為灰字註腳（code-shape 元件的做法）|
| 程式碼路徑形式的清單（如 `packages/x/y/z.ts:34`）出現在 hero 或主視覺 | 影響快速瀏覽；改寫成自然語言 |
| 深淺色切換（除非使用者明確要求）| 預設淺色 only、減少 CSS 複雜度與 dark mode 適配 bug |
| 字數爆炸的長段落 | 改用卡片 / 表格 / 視覺化；段落超過 4 行考慮拆 |
| ⭐ 整段只有純文字、沒有任何視覺元件 | 能畫的東西寫成文字＝要 user 自己在腦裡還原。每段都先問「這段能不能用畫的」（說明與描述盡量圖像化）|
| ⭐⭐ 把拍板題全部堆到文件尾段、跟它的背景說明分開 | 讀者拍板時找不到回去的路，於是每張決策卡只好重述背景 → 同件事講兩次。有背景的題就地放在該段末尾，尾段只留不需背景的程序題 |
| ⭐ 未滿 5 題卻套六段敘事重型範本 | 每題墊四百多行前置閱讀、資訊密度過低；改用輕量決策頁（開場兩三句就進題目）|
| 重複資訊在不同區段重複呈現（同視覺）| 同樣 chart 出現兩次會讓 user 疲勞、用不同 layer / 切角呈現 |
| 沒實際內容的 placeholder（「Lorem ipsum」「TODO」） | 寫不出來就不要放、user 看到空殼比看到沒寫差 |
| UI/UX 決策題只給「採納 / 不採納」文字 radio、不畫現況 vs 修改後畫面 | user 拍板前腦補不出「改完長怎樣」、無從比較體驗；涉及 UI/UX 的拍板題一律配 before/after mock（見 `references/do-and-dont.md` § UI/UX 決策題）|
| 該看形狀的資料塞進表格、或手刻 SVG / 用 CSS 寬度百分比假裝**資料圖表** | 等於要 user 自己在腦裡畫圖；手刻座標算錯不會報錯、只會安靜畫出錯的形狀。時間序列 ≥ 5 點 / 占比結構 / 分組對比 → 走 `chart` skill（判準與交棒規則見 `references/component-library.md` § 資料圖表）。⚠️ 這條管**資料圖表**；**結構圖**（流程 / 泳道 / 狀態機 / 架構）反過來**該用 SVG**、照 `references/structure-diagrams.md` 的幾何規則畫（2026-09-05 拍板，見下一條）|
| ⭐ 有分支 / 交接 / 回頭路 / 跨區連線的流程，攤成表格或直線鏈 | 表格容許含糊（誰交給誰、哪步必須先做都可以不寫），圖不容許。實測掃 50 份規格／流程頁：14 份把流程塞表格、只 5 份畫圖；三組並排實驗讀者全選圖版。判準與畫法見 `references/structure-diagrams.md` §1 |

---

## 模板擴展原則

當有新類型場景需要新模板時：

1. 在 `references/component-library.md` 加一段新元件範例（含 HTML snippet + 何時用）
2. 在 `references/examples/` 加一個完整實例 folder（含 README 說明用途 + 完整 HTML）
3. 不動 SKILL.md 主檔（除非觸發機制變了）

模板隨用隨加、不需要事先規劃完整。

---

## 開檔方式

寫完 HTML 後：

產出**歸檔**（不是丟暫存區），寫完更新索引再開：

```bash
# 1. 存到歸檔目錄（依月份分）
#    ~/Documents/claude-html/{YYYY-MM}/{slug}-{date}.html
# 2. 重建索引頁（依日期倒序 + session 顏色分組 + 即時篩選）
python3 <本 skill 目錄>/scripts/reindex.py
# 3. 開給使用者看
open ~/Documents/claude-html/{YYYY-MM}/{slug}-{date}.html   # Linux 用 xdg-open、Windows 用 start
```

不要等使用者問「在哪裡看」、寫完直接 open。`{slug}` 是內容主題的 kebab-case、`{date}` 是 `YYYY-MM-DD`。

**為什麼不用 /tmp**：這些產出常被回頭參照（規格、盤點結果、健檢報告），暫存區重開機就清空。索引頁 `~/Documents/claude-html/index.html` 讓「上週那份在哪」有地方找——顏色點與產出頁首色帶同一套雜湊，同一個 session 的東西顏色一致。

如果使用者明確要寫到別的位置（如專案的 docs 目錄）、聽他的、覆蓋歸檔預設。

### 跨 agent 使用

本 skill 沒有綁定任何一家 agent：frontmatter 只用通用的 `name` 與 `description`，`scripts/` 只依賴 `python3` 與（選配的）`node`，模板與 `references/` 全部共用。安裝方式見 repo 根目錄的 `install.sh`。

只有三件事會因執行環境而異，腳本都已自動處理：

| 面向 | 行為 |
|---|---|
| Session 標籤 | `scripts/session-label.sh` 依序試環境變數、worktree 分支名、專案名。取不到任何一項時短 id 用 `local`。**不需要為任何 agent 另寫 adapter** |
| 開檔 | 有現成瀏覽器工具就用它；否則用系統開檔指令（macOS `open`、Linux `xdg-open`、Windows `start`）；都不行就回傳檔案路徑。**「產出成功」與「瀏覽器已開啟」分開回報**——開不了不算產出失敗、也不假裝開了 |
| 驗證 | `python3 <本 skill 目錄>/scripts/verify.py <file>`，各家相同。找不到 `node` 或瀏覽器時相關項目標「未驗證」而非通過 |

使用者明確要求「在對話裡直接讀」時，給完整文字內容、不強迫走 HTML；HTML 只在使用者要的時候另附。

---

## 引導去 references

| 看 reference | 何時 |
|---|---|
| **`scripts/verify.py`** ⭐⭐ | **open 前必跑** — 一行跑完所有自檢（結構 / 識別 / 拍板機制 / 動線 / 呈現品質），依產出類型自動分流。取代過去手打的十來條 grep |
| **`scripts/session-label.sh`** ⭐ | 寫 HTML 前先跑 — 取得本 session 的顯示名與短 id，填進識別 snippet |
| **`scripts/reindex.py`** ⭐ | 產出存檔後跑 — 重建 `~/Documents/claude-html/index.html` 索引頁 |
| `references/cn-en-translation-checklist.md` ⭐ | Step 3 審稿必用 — 中英混雜詞替換對照表 + 保留原則（`verify.py` 會用它掃描，但**替換動作仍要人做**）|
| `references/component-library.md` | 挑元件、看怎麼寫卡片 / 表格 / 直線鏈流程圖 / 樹狀 / timeline |
| **`references/structure-diagrams.md`** ⭐ | **要畫有分支 / 交接 / 回頭路 / 分區的結構圖時**（流程圖 / 泳道 / 時序 / 狀態機 / 架構 / 依賴 / 部署 / ER…）— 選型表、六條連線規則、預算、SVG 起手片段、12 型畫法。需要該型完整範例 / 語意 pattern / 逐步動畫時再深讀 `diagram-design` skill 整包（`structure-diagrams.md` §8 列了何時讀它的哪一段）。**有分支且 ≥6 格的圖掛探索層**：§6.7 寫法＋ `assets/diagram-explore.{css,js}` 內嵌，畫完跑 `scripts/svg-text-check.mjs` 驗線端點 |
| **`chart` skill（另一個 skill、不在本目錄）** ⭐ | **要畫真正的資料圖表時**（趨勢 / 占比 / 分組 / 堆疊 / 目標 vs 實際）—— 本元件庫不含圖表，一律 Read `chart` skill 照它的選圖決策表與五條鐵則做。先看 `references/component-library.md` §資料圖表 判斷「該畫圖還是該用表格」再交棒 |
| `references/color-and-typography.md` | 配色 token、字體、間距、CSS variables |
| `references/interaction-patterns.md` | 加 radio / dropdown / slider / drag / export / local storage / 鍵盤快捷鍵 |
| **`references/session-identity.md`** ⭐ | **每份產出都要** — session 標籤取得方式 + 三層識別 snippet（分頁標題前綴 / 彩色 favicon / 頂部色帶徽章），解決多視窗並行時分不出來源 |
| `references/layout-patterns.md` | 整體 layout — sidebar / sticky / grid / 響應式 |
| `references/do-and-dont.md` | 進階風格規範、何時不要做什麼 |
| **`references/examples/explainer/`** ⭐ | **純展示預設範本** — 教學 / 概念解釋 / 報告盤點。**兩套內容骨架**（A 概念解釋七段 / B 報告六段）+ 為什麼是這個順序 + 解釋類元件 + 漸進揭露示範 |
| **`references/examples/marathon-decision-sheet/`** ⭐ | **拍板預設範本** — marathon 收尾 / 決策追認（Anthropic 風 + 就地拍板 + 題目地圖 + 一鍵複製決策摘要）|
| `references/examples/anthropic-gallery/` | 純展示範例 — 無互動、editorial 質感參考 |
| **`references/examples/spec-alignment/`** ⭐ | **規格對齊範本** — 跟老闆 / 業務對齊規格·設計·方向（由上而下 + 使用者操作情境畫面 mock + 只留最終規格/UX/真決策、藏分析推導與內部編號）|

每次跑此 skill 不需要全讀 references、依當下需求 read 對的部分即可。

---

## 範例觸發 prompt

| 使用者說 | 應該觸發此 skill | Step 0 選哪個範本 |
|---|---|---|
| 「marathon 收尾、回報狀況」/「我醒了、看一下狀況」 | ✓ | ⭐ marathon-decision-sheet |
| 「給我幾個選項拍板」/「列待確認的決策」 | ✓ | ⭐ marathon-decision-sheet |
| 「sprint retrospective 整理」/「PR 一次審完一批」 | ✓ | ⭐ marathon-decision-sheet |
| 任何含「**marathon 收尾**」「**待 QA**」「**未 commit**」「**未 push**」的素材 | ✓ | 拍板題 ≥ 5 → ⭐ marathon-decision-sheet；< 5 → 輕量決策頁 |
| 「整理這個會議的結論給我看」 | ✓ | ⭐ explainer 骨架 B |
| 「寫個 spec 給我 review」 | ✓ | base-template（spec 沒拍板選項時）|
| 「解釋這段 code 怎麼運作」（內容多時）| ✓ | ⭐ explainer 骨架 A |
| 「做一份 progress report」 | ✓ | ⭐ explainer 骨架 B |
| 「給我幾個 design alternative 我選」 | ✓ | ⭐ marathon-decision-sheet（有拍板）|
| 「列一下 tech-debt 給我排序」 | ✓ | ⭐ marathon-decision-sheet（有排序拍板）|
| 「做個儀表板看資料」 | ✓ | base-template 換 functional token（藍 accent + 純 sans）|
| 「教我 prompt cache 怎麼運作」 | ✓ | ⭐ explainer 骨架 A |
| 「修一下這個 bug」 | ✗ | — |
| 「我的 commit message 怎麼寫」 | ✗ | — |
| 「跑一下測試」 | ✗ | — |

**反例：什麼時候錯選了範本**

- ✗ 內容是 marathon 收尾簡報、但用 anthropic-gallery 純展示風 → user 拍板沒地方拍、要打字回 chat
- ✗ 內容是純技術評估、但塞 sticky bottom bar + radio → 過度設計、user 沒事可選
- ✗ 內容含「未 commit」「pending QA」「待 user 拍板」字眼、但用 base-template → 漏掉拍板互動

**判斷小心法**：素材裡 grep 一下「拍板 / 追認 / pending / 未 / 待 / TODO / 等 user / approve / confirm」、≥3 個 → 這份要有拍板互動。**接著數實際題數決定份量**：≥ 5 題走 marathon-decision-sheet，< 5 題走輕量決策頁（base-template + 就地拍板卡）。⚠️ 別再只憑關鍵字次數就套重型範本。
