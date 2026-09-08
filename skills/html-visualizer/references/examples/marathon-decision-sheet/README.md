# Marathon Decision Sheet — Anthropic 風 + 互動拍板簡報

> 「大型工程收尾、需要使用者拍板大量決策」場景的 **預設模板**。

## 這份範例做什麼

`index.html` 是一份完整的「marathon 收尾追認簡報」範例，給使用者：

1. **看懂發生了什麼**（前情提要 + 架構變化 + 設計決策 + 失敗處理 + 數據佐證）— 即使對技術細節不熟、也能在 5-10 分鐘內掌握脈絡
2. **拍板待決事項**（自主決策追認 / 流程優化 / 延後項目 / 經驗寫入 / 實機驗證 / Commit / 補充）— 透過單選按鈕加補充框互動選擇（**不用下拉選單**，兩步操作 UX 差、自檢會擋）
3. **一鍵把決策摘要複製貼回 chat**（底部 sticky bar）— 不需要在 HTML 跟 chat 之間來回打字

## 何時用這個範本

先數實際要拍板的題數：**≥ 5 題才用本範本**，未滿 5 題改輕量決策頁（`SKILL.md` Step 0）。題數過門檻後，以下訊號任一成立即主動觸發：

| 訊號 | 例子 |
|---|---|
| 工程任務剛收尾、需使用者 review | 「marathon 完成、要追認」「sprint retrospective」「PR 一次審完一批 commit」 |
| 累積大量待拍板選項（5+ 條）| 採納 / 推翻 / 延後 / 寫入 / 跳過 等需要明確選擇 |
| 使用者離線一段時間、回來要快速進入狀況 | 「我醒了 / 我回來了 / 我剛開機」+ 之前有 marathon / 長 task |
| 涉及複雜架構變化或設計決策、需要白話對比說明 | 「改了什麼」「為什麼選這個方案」「失敗時怎麼辦」 |

→ 符合就主動用、不要 fallback 到純 markdown 列點；題數不足時「主動」的對象是輕量決策頁、不是本範本。

## 結構大綱（就地拍板 + 程序快答）

> ⚠️ **2026-07-26 改版**：舊版「上半全說明 / 下半全拍板」的兩段式**已廢除**，理由見下段。改動內容：拍板題搬到它的背景段落末尾、題目地圖、側欄改議題分組。

```
開場
  01 概況 + Pain Card（為什麼做、改前的問題用大數字）
  ◎ 題目地圖（拍板題 ≥ 5 自動顯示）
      每題一行 · 已選 / 未選狀態 · 點擊跳到它的段落

說明與拍板配對（每題貼著自己的背景）
  02 前情提要（系統整體流程、本次只動哪格、舊路徑為什麼壞）
  03 架構變化（before/after side-by-side）
  04 設計決策 × N —— 每張卡自己收完一個完整決策：
        問題 → 方案 table → 為什麼選 + 重新評估時機
        ↳ 這個決策要你追認：radio + 補充框（.inline-decide 區塊）
  05 失敗處理（樹狀圖：start → success / degraded / hard-fail）
  06 數據佐證（改前/改後 metric cards + Review timeline）

──── 程序快答（不需要前面的背景就能拍）────
  A 其他已 default 追認（沒有對應說明段的追認題）
  B 流程微調
  C 延後項目（tech-debt：延後 / 立刻 / 不做）
  D 經驗寫入（SOP 候選 → 寫入專案筆記 / 不寫）
  E 實機驗證（自己跑 / Claude 帶我跑 / 跳過）
  F Commit（拆法 + push 與否）
  G 補充（自由 textarea）
```

### 為什麼不再用兩段式

舊版上半按**系統面向**切、下半按**決策類型**切，**兩套分類軸沒有一對一對應**。後果實測：

| 症狀 | 實測 |
|---|---|
| 拍板時找不到回去的路 | 第一道題平均出現在全篇 **62%**，背景早已捲出畫面 |
| 於是每張決策卡重述背景 | 同一件事講兩次、措辭還不同——違反本 skill 自己的「禁重複」規則 |
| 節奏先平後陡 | 前六成零互動、後四成連續 5–8 個判斷，最耗腦的事落在注意力最低的段落 |
| 兩種讀者都不討好 | 想讀懂的人讀完脈絡已冷卻；只想拍完的人被迫捲過三分之二 |

改版後第一道題落在 **33%**，且每題與它的說明同卡。**設計決策段的三個 ADR，各自本來就有一題完全對應的決策題被丟在下半部**——這就是配對斷裂最典型的樣子。

底部 sticky bar：
- 左側 eyebrow + 提示「完成 → 複製 → 貼回 chat」
- 右側「預覽摘要」+「📋 複製決策摘要」兩按鈕
- 預覽攤開後是 `<pre>` 顯示 markdown 摘要（給使用者確認再複製）
- 複製成功 ✅ 視覺回饋

## 必含設計元素

寫這類範本時、缺一個都不行：

1. **Pain Card** — Hero 內、含 ⚠️ icon + 大數字 + 為什麼做這個（紅色 / clay 強調）。讓使用者立刻 grok「問題嚴重性」
2. **前情提要段** — 用整體系統流程圖標出本次只動哪格（單向直線鏈用 div 流程圖；有分支 / 交接 / 回頭路改 SVG 結構圖，見 `structure-diagrams.md` §1） / 為什麼舊路徑壞。**禁止**直接跳到「我改了什麼」
3. **Before/After Side-by-side** — 紅 → 綠的對比視覺、含「脆弱點」「改進點」兩個 sub-card
4. **ADR 三件組** — 每個設計決策含「方案 table」「為什麼選」「什麼時候要重新評估」三段
5. **失敗處理樹狀圖** — `tree-node` + `tree-branch` + 4 種 outcome（start / success / degraded / hard-fail）+ 每個 leaf 含 `偵測 / 處理 / 觀察`
6. **改前/改後 Metric Cards** — `metric-side.before` 紅底大數字 + `metric-side.after` 綠底大數字 + `metric-delta` 改善百分比
7. **互動拍板** — 每題必須用 **Radio Group**（**禁用 `<select>` / dropdown**，2-step 操作 UX 差）、預設值合理（直接複製即可）、**每個 `data-decision` 卡片末尾必含一個 always-visible `<textarea>` 補充框**（不條件顯示、不 hidden、固定可見）
   - ⭐ **位置規則**：有背景說明的題 → 用 `.inline-decide` 嵌在該說明卡末尾（同卡收完）；不需要背景的程序題 → 收進尾段「程序快答」。**禁**把所有題一律堆到尾段
7b. **題目地圖** — 開場區之後、拍板題 ≥ 5 時顯示。由 `renderQuestionMap()` 掃 `[data-decision]` 自動生成（題名取卡內 `<h3>`、段名取所在 section 的 `<h2>`），改內容不必手工維護；題數 < 5 會自動移除整段
8. **Sticky Bottom Bar** — 預覽 + 複製兩按鈕、`buildSummary()` 產 markdown 摘要、剪貼簿 fallback（execCommand）防 clipboard API 失敗
9. **Sidebar Nav + IntersectionObserver** — 滾到哪段自動高亮；**依議題分組**（「議題」/「程序快答」兩組，不再是「技術說明 / 待你拍板」），每段右側自動掛 `data-count-for` 題數徽章（例 `0/2`，全選完轉綠）
10. **Progress Counter** — 右上角顯示「X / Y 已選」即時更新；每次變動同步重繪題目地圖與側欄題數

**⭐ UI/UX 拍板題必嵌現況 vs 修改後畫面**：上半「架構變化」段（#3）已有 before/after；但**下半互動拍板段（A-G）裡、只要某個拍板題本身會改 user 看到 / 操作的畫面（按鈕 / 欄位顯示 / modal / 排版 / 流程入口 / 文案），該卡也必須嵌 `.ba-grid` + `.mock` 現況 vs 修改後畫面**、不能只給 radio 文字選項。多方案擇一用 N 欄 `.ba-grid.cols-3`（現況 + 方案 A / B、每欄底各一 radio）。判斷準則 + 兩形態見 `../../do-and-dont.md` § UI/UX 決策題、骨架見 `../../component-library.md` § Before-After UI mock。理由：文字選項要 user 自己腦補「改完長怎樣」、拍不準；畫出來才能比較體驗再拍。

## 視覺風格（Anthropic 風）

完整 token 見 `../../color-and-typography.md`。重點：

- **底色 ivory `#FAF9F5`**、不用純白
- **主 accent clay `#D97757`** — 連結 / radio 選中 / section index border / hover
- **Section index 用 mono 兩位數**（`01` / `02`；字母 `A`-`G` 只給尾段程序快答的題號），帶 1.5px clay 邊
- **Hero h1 含 italic em 強調**（`<em>` + clay 色）
- **Eyebrow 用 mono uppercase + 24px clay 短線**
- **Status semantic 對齊 warm palette**：
  - 成功 / 已做 → olive `#788C5D`（不用 emerald）
  - 失敗 / 改前 → clay-d `#B85C3E`（不用 ruby）
  - 警告 / 推翻 → yellow `#C49845`（warm yellow）
- **大數字用 serif italic** — Pain Stat / Metric num / Stat value 都用 serif 加 italic

## 互動細節（重要、不能省）

`<script>` 必含：

```js
// 1. Textarea 固定可見、不條件 toggle hidden（user UX 偏好：補充欄位永遠在）
//    → 移除 isDefault toggle 邏輯
//    → 每個 data-decision 末尾預設帶 textarea、不加 .hidden class
//    → buildSummary() 一律 read textarea.value（trim 後若非空就附 — comment）

// 2. Progress counter
function updateProgress() { /* 數 [data-decision] 內有選的數 */ }

// 3. Sidebar nav IntersectionObserver
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) navLinks.forEach(l => l.classList.toggle('active', ...));
  });
}, { rootMargin: '-30% 0px -60% 0px' });

// 4. Build summary 產 markdown
function buildSummary() {
  // 走訪每個 [data-decision]、組成 ## A · ... ## B · ... 段落
  // 含 textarea 內容（如有）
  // return lines.join('\n')
}

// 5. Copy to clipboard 含 execCommand fallback
copyBtn.addEventListener('click', async () => {
  const text = buildSummary();
  try { await navigator.clipboard.writeText(text); }
  catch { /* fallback: textarea + execCommand('copy') */ }
  copyBtn.innerHTML = '✅ 已複製！';
  setTimeout(() => { copyBtn.innerHTML = orig; }, 2000);
});
```

## 結構完整性自驗（⭐ open 前必跑、不是 optional）

```bash
python3 <本 skill 目錄>/scripts/verify.py <file>
```

以前這裡列了六條要手打的 grep，現在全部收進上面那支指令——它會檢查決策卡 ↔ 選項 ↔ 摘要三方一致、每題都有補充框且被摘要抓取、複製摘要三件套齊全、無下拉選單、範本 placeholder 有沒有砍乾淨、第一題位置、題目地圖。

**為什麼要有這關**：踩過的 case 是 subagent 改了段落標題、加了新內容，卻**沒砍掉範本內部的舊決策卡**，摘要也沒同步——使用者一按預覽，看到的全是不相干的舊題目。

指令標 `!` 的兩項要人工判斷（機器判斷不了）：**哪些題涉及畫面**（涉及的每題至少 2 個樣張）、**中英混雜詞哪些該保留**（技術名詞保留、其餘照對照表換）。

## 嚴格禁止

寫這類範本時、絕不能：

- **檔案路徑 / 函式名 / 變數名 當主視覺** — 改用「邏輯描述」（例：不寫「`packages/.../foo.ts:34` 的 `bar()` 函式」、改寫「修了 RPC 呼叫的 timeout 處理邏輯」）
- **AI 內部術語給使用者看** —「Codex round 1 / round 2」改成「對抗審查兩輪」、`parseFailedReason` 改成「reason 字串」
- **超過 4 行的長段落** — 改用 card / table / before-after
- **沒實質內容的 placeholder** — 寫不出來不要放
- **依賴 `<pre>` ASCII 樹狀** — 用 `.tree-node` + `.tree-branch` div 畫
- **互動沒 fallback** — Clipboard API 失敗時必須用 `execCommand` fallback
- **`<select>` / dropdown 元件** — user 操作 2 步驟（點開選單 + 點選項）、UX 差；一律 Radio Group、所有選項一眼看完
- **範本 placeholder data-decision 殘留** — 複製 `index.html` 後、必須**整段砍乾淨範本內部 data-decision 卡片再重填新 content**；不能跟新 content 並存（否則 user 預覽摘要會看到舊段落）
- **buildSummary 沒同步對齊新 data-decision** — 改 body 的 `data-decision` name 後、buildSummary 內每個 `getValue("...")` 必同步改、`## A` / `## B` 標題與 section 對齊；改完跑上面那支自檢指令驗
- **UI/UX 拍板題只給文字 radio、不嵌現況 vs 修改後畫面** — 只要拍板題會改 user 看到 / 操作的畫面、必嵌 `.ba-grid` + `.mock`（見 `../../do-and-dont.md` § UI/UX 決策題）；純後端 / 架構 / commit 拆法等不改畫面的題、才維持文字 radio
- ⭐ **把有背景的拍板題堆到尾段** — 回到已廢除的兩段式。有說明段的題就地嵌在該卡末尾，尾段只留程序快答
- ⭐ **決策卡重述前面已講過的背景** — 那是配對沒做好的症狀，不是解法。搬到正確位置後背景只需要出現一次
- ⭐ **題數 < 5 還套這份重型範本** — 改用輕量決策頁（base-template + 就地拍板卡），別讓五道題撐起兩千行

## 跟其他範例的差異

| | `decision-sheet/`（舊版）| **`marathon-decision-sheet/`（這版）** | `anthropic-gallery/` |
|---|---|---|---|
| 視覺風格 | functional（藍 + 純 sans）| Anthropic（ivory + clay + serif italic）| Anthropic（純展示）|
| 互動拍板 | ✓ | ✓ | ✗ |
| 高層次說明（前情提要 / 架構變化）| ✗ | ✓ | ✗ |
| Before/After 對比視覺 | 部分 | ✓ | ✗ |
| 適合場景 | 工程儀表板偏 dashboard 風偏好 | 大型 marathon 收尾、含設計決策說明 | 純內容呈現、無互動 |

→ **預設用此範本**；除非使用者明確要 dashboard 風、或內容不需互動拍板。

## 不需要做評估比較

User 已實際 review 過此範本並滿意（2026-05-09 marathon-decision-sheet 升級自 functional `decision-sheet`）。`evals/` 不適用此 reference example。

未來若要改進此範本、用 evals/ 機制跑 A/B（用 skill-creator 流程）。
