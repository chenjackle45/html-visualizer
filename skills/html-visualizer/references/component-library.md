# 元件庫

從實戰提煉、可直接複製使用。每個元件含「何時用 + HTML snippet + 配套 CSS」。

> 配色 / 字體 token 見 `color-and-typography.md`；layout（sidebar / sticky）見 `layout-patterns.md`；互動見 `interaction-patterns.md`。
>
> **預設用 Anthropic 風格**（warm palette + serif 標題）。元件分兩層：
> - **Anthropic-signature 元件**（最首選、首段列出）— editorial / book / 報告 / 教學 / explainer
> - **通用元件**（次段）— 通用、適用於 dashboard / 互動表單 / 工具介面

## 元件索引

### Anthropic-signature 元件（首選）
- [Eyebrow（mono + clay 短線 metadata）](#eyebrowmono--clay-短線-metadata)
- [Hero h1 with italic emphasis](#hero-h1-with-italic-emphasis)
- [Section head 三件組（idx + h2 + count）](#section-head-三件組idx--h2--count)
- [TOC pills（圓角 nav）](#toc-pills圓角-nav)
- [Link card with thumbnail](#link-card-with-thumbnail)
- [SVG thumbnail 系統](#svg-thumbnail-系統)
- [Hero figure（雙 pane 對比裝飾）](#hero-figure雙-pane-對比裝飾)
- [Footer K-mark](#footer-k-mark)

### 容器類
- [基礎卡 `.card`](#基礎卡-card)
- [次層卡 `.card-soft`](#次層卡-card-soft)
- [Highlight box（重點引述）](#highlight-box重點引述)

### 數據呈現
- [Stat card（大數字）](#stat-card大數字)
- [Metric dashboard（before / after）](#metric-dashboardbefore--after)
- [Bar comparison（長度比例）](#bar-comparison長度比例)
- [Pain card（紅色 problem statement）](#pain-card紅色-problem-statement)
- [⭐ 資料圖表（趨勢 / 占比 / 分組 → 交棒 chart skill）](#-資料圖表趨勢--占比--分組交棒-chart-skill)

### 解釋類（教學 / 概念解釋 / 純資訊呈現）
- [⭐ 定義卡（術語 → 一句話 → 細節）](#-定義卡術語--一句話--細節)
- [⭐ 類比橋（用已知的東西對照未知）](#-類比橋用已知的東西對照未知)
- [⭐ 分層剖面（系統堆疊、哪層負責什麼）](#-分層剖面系統堆疊哪層負責什麼)
- [⭐ 時序圖（誰呼叫誰、按什麼順序）](#-時序圖誰呼叫誰按什麼順序)
- [誤解破解 / 狀態演進（既有元件的解釋型用法）](#誤解破解--狀態演進既有元件的解釋型用法)

### Code-shape 視覺（程式開發解說；2026-08-29 拍板引入、參考 show-me）
- [⭐ Code-shape 四形態（pseudocode / call tree / component tree / 檔案責任樹）](#-code-shape-四形態pseudocode--call-tree--component-tree--檔案責任樹)
- [⭐ 結構 diff（＋/− 疊在形狀上）](#-結構-diff－疊在形狀上)
- [Mermaid 時序圖（CDN 一行引入）](#mermaid-時序圖cdn-一行引入)

### 比較類
- [Compare card（左紅右綠 before/after）](#compare-card左紅右綠-beforeafter)
- [⭐ Before-After UI mock side-by-side（UI/UX 決策畫面對比、現況 vs 修改後）](#-before-after-ui-mock-side-by-sideux-audit--設計提案--uiux-決策題)
- [ADR alternatives table（多方案比較）](#adr-alternatives-table多方案比較)

### 流程類
- [Flow diagram（box + arrow 橫向）](#flow-diagrambox--arrow-橫向)
- [Vertical flow（垂直 + 箭頭線）](#vertical-flow垂直--箭頭線)
- [Tree（樹狀分類 / failure mode）](#tree樹狀分類--failure-mode)
- [Phase timeline（垂直 dot + line）](#phase-timeline垂直-dot--line)
- [Commit box（連續節點）](#commit-box連續節點)
- [QA step card（編號 + 內容）](#qa-step-card編號--內容)

### 標記類
- [Badge / chip（語意標記）](#badge--chip語意標記)
- [Section number（區段大編號）](#section-number區段大編號)

### 決策互動類
- [Decision card with radio choices](#decision-card-with-radio-choices)
- [Choice pills（radio 美化）](#choice-pillsradio-美化)

---

# 🌾 Anthropic-signature 元件（首選）

這些元件定義 Anthropic / Claude 官方品牌風的視覺辨識度。預設先用這幾個搭出 hero / nav / sections、再用通用元件填內容。

## Eyebrow（mono + clay 短線 metadata）

**何時用**：Hero / Section 頂部的 metadata header — 「companion to」「published」「last updated」「subtitle · date」。Anthropic 風的 signature 元素之一。

```css
.eyebrow {
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--g500);
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.eyebrow::before {
  content: "";
  width: 24px;
  height: 1.5px;
  background: var(--clay);
}
```

```html
<div class="eyebrow">Companion to the blog post</div>
```

→ 短線是 visual signature、不要拿掉。

## Hero h1 with italic emphasis

**何時用**：Hero / 首頁主標題、用 italic em 標重點詞。

```css
h1 {
  font-family: var(--serif);
  font-weight: 500;
  font-size: clamp(38px, 5.4vw, 62px);
  line-height: 1.06;
  letter-spacing: -0.018em;
  margin: 0 0 8px;
  max-width: 17ch;
  color: var(--slate);
}
h1 em {
  font-style: italic;
  color: var(--clay);
}
```

```html
<h1>The unreasonable <em>effectiveness</em> of HTML</h1>
```

→ Italic 不是裝飾、是 strong emphasis。挑 1-2 個關鍵詞、不要全部都 italic。

## Section head 三件組（idx + h2 + count）

**何時用**：每個主要 section 的標題列、含 mono 編號 + serif 標題 + 數量 pill。

```css
.sec-head {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 10px;
}
.sec-head .idx {
  font-family: var(--mono);
  font-size: 13px;
  color: var(--clay);
  font-weight: 600;
  width: 34px;
  flex-shrink: 0;
}
.sec-head h2 {
  font-family: var(--serif);
  font-weight: 500;
  font-size: 27px;
  margin: 0;
  letter-spacing: -0.012em;
  color: var(--slate);
}
.sec-head .count {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--g500);
  background: var(--g100);
  padding: 2px 8px;
  border-radius: 999px;
}
.sec-intro {
  font-size: 14.5px;
  color: var(--g700);
  max-width: 700px;
  margin: 0 0 24px 50px;  /* 50px 對齊 idx 視覺軸 */
}
```

```html
<section id="exploration">
  <div class="sec-head">
    <span class="idx">01</span>
    <h2>Exploration &amp; Planning</h2>
    <span class="count">3 demos</span>
  </div>
  <p class="sec-intro">
    區段副說明。位置縮排 50px、對齊 section index 視覺軸。
  </p>
  <div style="margin-left: 50px;">
    <!-- 內容 -->
  </div>
</section>
```

→ 編號用兩位數 `01` `02`、不是 `1` `2`。這是 mono 細節、editorial 感的關鍵。

## TOC pills（圓角 nav）

**何時用**：Hero 內 nav、跳到各 section。10+ section 時最有用。

```css
nav.toc {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 26px 0 0;
}
nav.toc a {
  font-size: 12.5px;
  padding: 7px 14px;
  border: 1.5px solid var(--g300);
  border-radius: 999px;
  text-decoration: none;
  color: var(--g700);
  background: var(--paper);
  transition: border-color 120ms, color 120ms;
  display: inline-flex;
  align-items: center;
  gap: 7px;
}
nav.toc a .n {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--g500);
}
nav.toc a:hover { border-color: var(--slate); color: var(--slate); }
nav.toc a:hover .n { color: var(--clay); }
```

```html
<nav class="toc">
  <a href="#exploration">Exploration <span class="n">3</span></a>
  <a href="#code-review">Code Review <span class="n">3</span></a>
  <a href="#design">Design <span class="n">2</span></a>
</nav>
```

→ Hover 時邊框變黑、數字變 clay — 是 Anthropic 風的標誌動效。

## Link card with thumbnail

**何時用**：example gallery、resource list、跳到別的頁 / 檔案。每張卡有 thumbnail SVG + 標題 + desc + filename + arrow。

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(316px, 1fr));
  gap: 20px;
  margin-left: 50px;  /* 對齊 section idx */
}
@media (max-width: 640px) { .grid { margin-left: 0; } }

a.card {
  display: flex;
  flex-direction: column;
  background: var(--paper);
  border: 1.5px solid var(--g300);
  border-radius: 14px;
  text-decoration: none;
  color: inherit;
  transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
  overflow: hidden;
}
a.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(20, 20, 19, 0.10);
  border-color: var(--slate);
}

.thumb {
  height: 132px;
  background: var(--g100);
  border-bottom: 1.5px solid var(--g200);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
  transition: background 150ms ease;
}
a.card:hover .thumb { background: var(--oat); }

.body { padding: 18px 20px 16px; display: flex; flex-direction: column; flex: 1; }
.title {
  font-family: var(--serif);
  font-size: 19px;
  font-weight: 500;
  line-height: 1.22;
  color: var(--slate);
  margin-bottom: 7px;
  letter-spacing: -0.008em;
}
.desc {
  font-size: 13.5px;
  color: var(--g700);
  line-height: 1.5;
  margin-bottom: 16px;
  flex: 1;
}
.file {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--g500);
  border-top: 1px solid var(--g100);
  padding-top: 11px;
  display: flex;
  align-items: center; justify-content: space-between;
}
.file .arrow { transition: transform 150ms ease; color: var(--g300); }
a.card:hover .file { color: var(--clay); }
a.card:hover .file .arrow { transform: translateX(3px); color: var(--clay); }
```

```html
<div class="grid">
  <a class="card" href="example.html">
    <div class="thumb">
      <svg viewBox="0 0 120 80"><!-- SVG illustration --></svg>
    </div>
    <div class="body">
      <div class="title">Example title</div>
      <div class="desc">Example description in 1-2 sentences.</div>
      <div class="file">
        <span>example-file.html</span>
        <span class="arrow">→</span>
      </div>
    </div>
  </a>
</div>
```

## SVG thumbnail 系統

**何時用**：Link card 的 thumbnail。用幾何形狀 + 統一 palette、給卡片視覺辨識用、不要寫實。

```css
/* 統一 thumbnail 內 SVG class system */
.thumb svg { width: 100%; height: 100%; overflow: visible; }
.thumb svg .st { stroke: var(--g500); fill: none; stroke-width: 2.5; }      /* 線稿 */
.thumb svg .fl { fill: var(--g300); }                                         /* 灰填 */
.thumb svg .cl { fill: var(--clay); }                                         /* clay */
.thumb svg .ol { fill: var(--olive); }                                        /* olive */
.thumb svg .oa { fill: var(--oat); stroke: var(--g500); stroke-width: 2.5; } /* oat 帶邊 */
.thumb svg .sl { fill: var(--slate); }                                       /* 深近黑 */
.thumb svg .wh { fill: var(--paper); stroke: var(--g500); stroke-width: 2.5; } /* 白帶邊 */
.thumb svg .ln { stroke: var(--g500); stroke-width: 2.5; fill: none; stroke-linecap: round; }
.thumb svg .lc { stroke: var(--clay); stroke-width: 2.5; fill: none; stroke-linecap: round; }
.thumb svg .da { stroke-dasharray: 4 4; }                                    /* 虛線 */

/* Hover 變化 */
a.card:hover .thumb svg .fl { fill: var(--g500); }
a.card:hover .thumb svg .oa { fill: var(--paper); }
```

```html
<!-- 範例：三欄比較圖示 -->
<div class="thumb">
  <svg viewBox="0 0 120 80">
    <rect class="wh" x="4"  y="10" width="32" height="60" rx="5"/>
    <rect class="wh" x="44" y="10" width="32" height="60" rx="5"/>
    <rect class="oa" x="84" y="10" width="32" height="60" rx="5"/>
    <line class="ln" x1="10" y1="26" x2="30" y2="26"/>
    <line class="ln" x1="50" y1="26" x2="70" y2="26"/>
    <line class="lc" x1="90" y1="26" x2="110" y2="26"/>
    <circle class="cl" cx="100" cy="56" r="6"/>
  </svg>
</div>

<!-- 範例：流程箭頭 -->
<div class="thumb">
  <svg viewBox="0 0 120 80">
    <line class="ln" x1="14" y1="12" x2="14" y2="68"/>
    <circle class="cl" cx="14" cy="16" r="5"/>
    <circle class="ol" cx="14" cy="40" r="5"/>
    <circle class="fl" cx="14" cy="64" r="5"/>
    <rect class="fl" x="28" y="12" width="48" height="4" rx="2"/>
    <rect class="oa" x="86" y="12" width="28" height="24" rx="4"/>
  </svg>
</div>
```

→ 不要追求精細、用基本幾何（rect / circle / line）+ 7-8 個 class 組合即可。

## Hero figure（雙 pane 對比裝飾）

**何時用**：Hero 區的視覺裝飾、用兩個輕微旋轉的 pane 表達「A vs B」概念。例如「markdown vs html」「before vs after」「A 方案 vs B 方案」。**裝飾性、可省略**。

```css
.hero-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 48px;
  align-items: end;
}
@media (max-width: 880px) { .hero-grid { grid-template-columns: 1fr; } }

.hero-fig {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  align-items: end;
}
.hero-fig .pane {
  border-radius: 10px;
  border: 1.5px solid var(--g300);
  background: var(--paper);
  padding: 14px;
  aspect-ratio: 4/5;
  display: flex; flex-direction: column;
  gap: 7px;
  position: relative;
}
.hero-fig .pane.left  { background: var(--g100); transform: rotate(-2.5deg) translateY(6px); }
.hero-fig .pane.right { transform: rotate(1.5deg); border-color: var(--slate); box-shadow: 0 12px 32px rgba(20,20,19,.10); }
.hero-fig .tag {
  position: absolute;
  top: -10px; left: 12px;
  font-family: var(--mono);
  font-size: 9.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: var(--ivory);
  padding: 2px 7px;
  border: 1.5px solid var(--g300);
  border-radius: 6px;
  color: var(--g500);
}
.hero-fig .pane.right .tag { border-color: var(--slate); color: var(--slate); }
```

```html
<div class="hero-grid">
  <div>
    <div class="eyebrow">— Subtitle</div>
    <h1>Main <em>title</em></h1>
    <p class="intro">Description...</p>
  </div>
  <div class="hero-fig" aria-hidden="true">
    <div class="pane left">
      <span class="tag">Before</span>
      <!-- 簡化內容示意 -->
    </div>
    <div class="pane right">
      <span class="tag">After</span>
      <!-- 簡化內容示意 -->
    </div>
  </div>
</div>
```

→ 旋轉角度（-2.5deg / 1.5deg）是手繪感的關鍵、不要改成正向。

## Footer K-mark

**何時用**：頁面底部、editorial 感的收尾。serif italic 短句 + clay 連結。

```css
footer.foot {
  margin-top: 100px;
  border-top: 1.5px solid var(--g300);
  padding-top: 36px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 20px;
  flex-wrap: wrap;
  font-size: 13px;
  color: var(--g500);
}
footer.foot .k {
  font-family: var(--serif);
  font-style: italic;
  color: var(--g700);
  font-size: 15px;
}
footer.foot a {
  color: var(--clay);
  text-decoration-color: var(--oat);
  text-underline-offset: 3px;
}
```

```html
<footer class="foot">
  <div>
    <span class="k">— Self-contained HTML</span><br>
    <span style="font-family: var(--mono); color: var(--g500);">Generated 2026-05-09</span>
  </div>
  <div>
    <a href="#top">回頂部</a>
  </div>
</footer>
```

---

# 🛠 通用元件（次選）

以下元件預設色票對齊 Anthropic warm palette。Dashboard / 互動表單 / 工具介面類場景仍可用。

> 以下通用元件（基礎卡起）的 snippet 邊線是 1px，屬 functional 風；套 Anthropic 風時依 `do-and-dont.md` 改 1.5px。

## 基礎卡 `.card`

**何時用**：包覆任何主要內容區塊。預設容器、最常用。

```css
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
}
```

```html
<div class="card p-6">
  <h3 class="text-lg font-semibold">標題</h3>
  <p class="text-sm" style="color: var(--text-muted);">內文</p>
</div>
```

## 次層卡 `.card-soft`

**何時用**：卡內次層區塊、metric 細節、強調引述、次要分組。

```css
.card-soft {
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: 10px;
}
```

```html
<div class="card-soft p-4">
  <div class="text-[11px] uppercase tracking-widest font-semibold"
       style="color: var(--text-muted);">標籤</div>
  <p class="text-sm mt-1">內容</p>
</div>
```

## Highlight box（重點引述）

**何時用**：強調某個重要結論 / 注意事項 / 為什麼這樣設計。

```css
.highlight-box {
  background: var(--accent-soft);
  border-left: 3px solid var(--accent);
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 13px;
}
```

```html
<div class="highlight-box">
  <strong>重點</strong>：這條規則的關鍵理由是 ⋯⋯
</div>
```

---

## Stat card（大數字）

**何時用**：summary 區、KPI 顯示。3-4 個並列。

```css
.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 18px;
}
.stat-label {
  font-size: 11px; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600;
}
.stat-value {
  font-size: 28px; font-weight: 700; margin-top: 4px; letter-spacing: -0.02em;
}
.stat-sub { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
```

```html
<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
  <div class="stat-card">
    <div class="stat-label">標籤</div>
    <div class="stat-value">17<span class="text-lg font-normal" style="color: var(--text-muted);"> 檔</span></div>
    <div class="stat-sub">+1267 / −617 行</div>
  </div>
  <!-- 重複 ... -->
</div>
```

## Metric dashboard（before / after）

**何時用**：數據佐證區段、改前 / 改後對比、KPI 改善視覺化。

```css
.metric-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 16px 18px; }
.metric-row {
  display: grid; grid-template-columns: 1fr auto 1fr;
  align-items: center; gap: 8px; margin-top: 10px;
}
.metric-side {
  text-align: center; padding: 10px; border-radius: 8px;
}
.metric-side.before { background: var(--red-soft); color: var(--red); }
.metric-side.after { background: var(--green-soft); color: var(--green); }
.metric-side .num { font-size: 24px; font-weight: 700; letter-spacing: -0.02em; }
.metric-side .label {
  font-size: 10px; text-transform: uppercase;
  letter-spacing: 0.06em; font-weight: 600; opacity: 0.7;
}
.metric-arrow { color: var(--text-soft); font-size: 16px; }
.metric-delta {
  margin-top: 8px; text-align: center;
  font-size: 12px; font-weight: 600; color: var(--green);
}
```

```html
<div class="metric-card">
  <div class="font-semibold text-sm">失敗率</div>
  <div class="metric-row">
    <div class="metric-side before">
      <div class="num">17%</div>
      <div class="label">改前</div>
    </div>
    <div class="metric-arrow">→</div>
    <div class="metric-side after">
      <div class="num">&lt; 5%</div>
      <div class="label">改後</div>
    </div>
  </div>
  <div class="metric-delta">預期改善 ~70%</div>
</div>
```

## Bar comparison（長度比例）

**何時用**：兩條長條對比 token cost / 時間 / 成本。

```css
.bar-row {
  display: grid; grid-template-columns: 110px 1fr 90px;
  gap: 12px; align-items: center; margin-bottom: 10px; font-size: 13px;
}
.bar {
  height: 28px; border-radius: 6px;
  display: flex; align-items: center; padding: 0 10px;
  color: white; font-weight: 600; font-size: 12px;
}
.bar.warm { background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%); color: #422006; }
.bar.cool { background: linear-gradient(90deg, #34d399 0%, #10b981 100%); color: #064e3b; }
```

```html
<div class="bar-row">
  <div class="text-xs font-medium">不截短</div>
  <div class="bar warm" style="width: 100%;">31.5K tokens</div>
  <div class="text-xs text-right" style="color: var(--text-muted);">100%</div>
</div>
<div class="bar-row">
  <div class="text-xs font-medium">60K 截短</div>
  <div class="bar cool" style="width: 50%;">15.5K tokens</div>
  <div class="text-xs text-right font-semibold" style="color: var(--green);">省 50%</div>
</div>
```

## Pain card（紅色 problem statement）

**何時用**：Hero 區強調痛點、為什麼做這個事、user 觀察到的現象。

```css
.pain-card {
  background: linear-gradient(135deg, #fef2f2 0%, #ffe4e6 100%);
  border: 1px solid var(--red-border);
  border-radius: 14px;
  padding: 24px 28px;
  display: grid; grid-template-columns: auto 1fr;
  gap: 24px; align-items: center;
}
.pain-icon {
  width: 64px; height: 64px;
  border-radius: 16px;
  background: white;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);
  display: flex; align-items: center; justify-content: center;
  font-size: 32px;
}
.pain-stat {
  font-size: 36px; font-weight: 800;
  color: var(--red); letter-spacing: -0.03em; line-height: 1;
}
```

```html
<div class="pain-card">
  <div class="pain-icon">⚠️</div>
  <div>
    <div class="text-xs uppercase tracking-widest font-semibold"
         style="color: var(--red); opacity: 0.8;">為什麼做這個</div>
    <div class="flex items-baseline gap-3 mt-1">
      <span class="pain-stat">17%</span>
      <span class="text-sm" style="color: #7f1d1d;">的會議分析出現「整片空」</span>
    </div>
    <div class="text-sm mt-2" style="color: #7f1d1d;">
      根因：AI 漏寫文字標記、整段解析失敗。
    </div>
  </div>
</div>
```

---

## Compare card（左紅右綠 before/after）

**何時用**：架構對比、舊方案 vs 新方案、改動細節並排。

```css
.ba-row { display: grid; grid-template-columns: 1fr auto 1fr; gap: 0; align-items: stretch; }
.ba-col { padding: 20px; border-radius: 14px; }
.ba-col-before {
  background: linear-gradient(180deg, var(--red-soft) 0%, white 100%);
  border: 1px solid var(--red-border);
}
.ba-col-after {
  background: linear-gradient(180deg, var(--green-soft) 0%, white 100%);
  border: 1px solid var(--green-border);
}
.ba-arrow {
  display: flex; align-items: center; justify-content: center;
  width: 50px; font-size: 22px; color: var(--text-soft);
}
```

```html
<div class="ba-row">
  <div class="ba-col ba-col-before">
    <span class="badge badge-red">改動前</span>
    <h3 class="font-semibold mt-2 mb-3">舊方案</h3>
    <ul class="text-sm space-y-1.5">
      <li>· 第一個 pain point</li>
      <li>· 第二個 pain point</li>
    </ul>
  </div>
  <div class="ba-arrow">→</div>
  <div class="ba-col ba-col-after">
    <span class="badge badge-green">改動後</span>
    <h3 class="font-semibold mt-2 mb-3">新方案</h3>
    <ul class="text-sm space-y-1.5">
      <li>· 第一個改進</li>
      <li>· 第二個改進</li>
    </ul>
  </div>
</div>
```

## ⭐ Before-After UI mock side-by-side（UX audit / 設計提案 / UI/UX 決策題）

**何時用**：UX audit / 設計提案 / 視覺改版 / 對比型 review、**＋任何待拍板決策題本身涉及 UI/UX 時**（marathon 拍板簿 / spec / 決策追認裡的單一 UI/UX 題也算、不限整份 audit 文件）。**比 [Compare card] 更深一層** — 不只列 bullet 點，而是用實 HTML / CSS **mock 出真實 UI 樣子**，user 一眼看出「現在長怎樣、改完長怎樣」再拍板。**兩形態**：形態 1 現況→建議（2 欄、見下方骨架）、形態 2 多方案擇一（N 欄、見本節末 § 形態 2）。

**vs Compare card 差異**：

| 維度 | Compare card | Before-After UI mock（本元件） |
|---|---|---|
| 對比內容 | 文字 bullet 列點 | 實際渲染的 UI mock |
| 適用 | 架構 / 方案 / 概念對比 | UI / 頁面 / 元件樣式對比 |
| User 認知負擔 | 要對照腦補 | 直接看 |
| 改動範例 | 「舊方案 → 用 SOAP / 新方案 → 用 REST」 | 「現況：欄位顯示 `order.payment_due_at`／建議：顯示『付款逾期 7 天』」（兩邊各 mock 出真實頁面）|

**設計原則（不要違反）**：

- ✅ 表格用真表格、不是 `[表格略]` 文字佔位
- ✅ chip / badge / 卡片元件真渲染、不是 `[警示]` 字串
- ✅ 顏色 / 字型 / 間距盡量貼近產品實際長相
- ✅ 用紅字 / `<strong>` / 紅 badge 在 mock 內標出有問題的具體位置（before 側）
- ✅ 對應改善位置在 after 側用綠 / 黃 chip 標示
- ❌ 不要寫「（這裡是表格、約 5 行）」之類抽象描述
- ❌ 不要只用 ASCII / monospace 字串模擬 UI

**完整 CSS（含 mock 元件庫）**：

```css
/* ── Before-After 容器 ────────────────── */
.ba-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}
@media (max-width: 980px) {
  .ba-grid { grid-template-columns: 1fr; }
}
.ba-col { padding: 18px 20px; }
.ba-col + .ba-col { border-left: 1px solid var(--border); }
@media (max-width: 980px) {
  .ba-col + .ba-col { border-left: none; border-top: 1px solid var(--border); }
}
.ba-col .h {
  font-family: var(--mono);
  font-size: 10.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  border-radius: 3px;
}
.ba-col.before .h { background: var(--red-soft); color: var(--red); }
.ba-col.after .h  { background: var(--green-soft); color: var(--green); }
.ba-col .desc {
  font-size: 12.5px;
  color: var(--text-muted);
  margin-bottom: 14px;
  line-height: 1.55;
}

/* ── Mock 容器 + label ────────────────── */
.mock {
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px 16px;
  position: relative;
}
.mock-label {
  position: absolute;
  top: -8px;
  left: 12px;
  background: var(--bg-card);
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-soft);
  padding: 2px 8px;
  border: 1px solid var(--border);
  border-radius: 3px;
}
.mock h4 { font-size: 14px; font-weight: 600; margin: 0 0 6px; }
.mock .meta { font-size: 11.5px; color: var(--text-soft); }

/* ── Mock chip / pill（filter / tag / status）─ */
.mock-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  font-size: 11px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-muted);
  margin-right: 4px;
}
.mock-chip.on     { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
.mock-chip.warn   { border-color: var(--yellow-border); color: var(--yellow); background: var(--yellow-soft); }
.mock-chip.danger { border-color: var(--red-border); color: var(--red); background: var(--red-soft); }
.mock-chip.dim    { opacity: 0.5; }

/* ── Mock badge（狀態 / 標籤）─────────── */
.mock-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  font-size: 10.5px;
  font-weight: 600;
  border-radius: 3px;
  margin-right: 4px;
}
.mock-badge.gray   { background: var(--g200); color: var(--text-muted); }
.mock-badge.green  { background: var(--green-soft); color: var(--green); }
.mock-badge.red    { background: var(--red-soft); color: var(--red); }
.mock-badge.yellow { background: var(--yellow-soft); color: var(--yellow); }

/* ── Mock table（資料表）─────────────── */
.mock-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  margin-top: 8px;
}
.mock-table th, .mock-table td {
  padding: 6px 10px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}
.mock-table th {
  font-family: var(--mono);
  font-size: 10.5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-soft);
  font-weight: 600;
}
.mock-table tr:last-child td { border-bottom: none; }
.mock-table .uuid { font-family: var(--mono); font-size: 10.5px; color: var(--text-soft); }
.mock-table .row-bad { background: var(--red-soft); }

/* ── Mock dashboard task card ───────── */
.mock-task {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 10px 14px;
  margin-right: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  min-width: 100px;
}
.mock-task .lbl  { font-family: var(--mono); font-size: 9.5px; color: var(--text-soft); text-transform: uppercase; letter-spacing: 0.05em; }
.mock-task .nm   { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.mock-task .num  { font-size: 24px; font-weight: 600; margin-top: 4px; }
.mock-task.hot   { border-color: var(--red-border); background: var(--red-soft); }
.mock-task.hot .num { color: var(--red); }
.mock-task.cold  { opacity: 0.5; }
```

**完整 HTML 結構（finding 卡片骨架）**：

```html
<div class="card finding-card">
  <!-- 標題列 -->
  <div class="finding-head">
    <span class="badge badge-red">P0</span>
    <span class="title">自動化規則描述充滿 SQL pseudo / method 名</span>
  </div>

  <!-- 現況 vs 建議並排 -->
  <div class="ba-grid">
    <div class="ba-col before">
      <span class="h">現況樣式</span>
      <div class="desc">manager 進「自動化規則」看到的是 dev 寫給自己看的 spec：</div>

      <div class="mock">
        <span class="mock-label">/admin/automation-rules · 現況</span>
        <h4><span class="mock-badge yellow">警示</span> 付款逾期 7 天警示</h4>
        <div class="meta">payment-overdue-7d · 冷卻 7 天 · <span style="color: var(--red)">已停用</span></div>
        <code style="font-family: var(--mono); font-size: 10.5px; color: var(--red);">
          order.payment_due_at &lt;= 7 天前 + paid_at IS NULL
        </code>
        <div style="color: var(--red); font-size: 11px; margin-top: 6px;">
          ⚠️ 預設 disabled — order schema 尚未含 payment_due_at
        </div>
      </div>
    </div>

    <div class="ba-col after">
      <span class="h">建議樣式</span>
      <div class="desc">改業務語意敘述、Story 編號 / method 名挪到 hover tooltip：</div>

      <div class="mock">
        <span class="mock-label">/admin/automation-rules · 建議</span>
        <h4><span class="mock-badge yellow">警示</span> 付款逾期 7 天警示</h4>
        <div class="meta">冷卻 7 天 · <span class="mock-badge gray">準備中</span></div>
        <strong style="font-size: 12px;">
          當訂單到付款期限後 7 天仍未付款
        </strong>
        <span style="color: var(--text-muted); font-size: 11.5px;">
          → 提醒主管並自動加上「付款追蹤中」標籤。
        </span>
        <div class="meta" style="margin-top: 6px;">
          <span title="markQuoteSignedManually" style="border-bottom: 1px dotted; cursor: help;">
            查看技術細節
          </span>
        </div>
      </div>
    </div>
  </div>

  <!-- 拍板區（接 references/interaction-patterns.md § Radio pills + 隱藏 textarea）-->
  <!-- ⭐ data-comment-for 必填、值與 radio name 對齊 — builder 用 getComment("f-1") 抓 -->
  <div class="finding-action">
    <div>
      <div class="h">拍板</div>
      <div class="choice-row">
        <label class="choice"><input type="radio" name="f-1" value="採納"><span class="choice-dot"></span><span><strong>採納</strong></span></label>
        <label class="choice choice-warn"><input type="radio" name="f-1" value="改一下"><span class="choice-dot"></span><span>改一下</span></label>
        <label class="choice choice-danger"><input type="radio" name="f-1" value="不做"><span class="choice-dot"></span><span>不做</span></label>
      </div>
    </div>
    <div>
      <div class="h">補充</div>
      <textarea class="note" data-comment-for="f-1" placeholder="若選『改一下』請說明..."></textarea>
    </div>
  </div>
</div>
```

⭐ **規約（hard rule、對應 SKILL.md §「必含元素」第 ⭐⭐ 條）**：

- **每個 radio / select 拍板題必須配旁邊一個 `<textarea data-comment-for="<id>">`** — `<id>` 與 radio `name=` 對齊
- **複製 builder（buildSummary / buildPrompt）必須用 `getComment(id)` 抓取每條 textarea、拼進對應行**

builder 內固定 helper：

```javascript
function getValue(name) {
  const r = document.querySelector(`input[type="radio"][name="${name}"]:checked`);
  return r ? r.value : "(未選)";
}
function getComment(id) {
  const ta = document.querySelector(`[data-comment-for="${id}"]`);
  return ta && ta.value.trim() ? ` — ${ta.value.trim()}` : "";
}

// 拼行：選項 + 補充意見一起
lines.push(`- F-1 自動化規則語意：${getValue("f-1")}${getComment("f-1")}`);
```

少做 = user 在 textarea 寫的補充被「複製拍板摘要」漏掉、白填。完整參照：`references/examples/marathon-decision-sheet/index.html` L3422–3498。

**搭配的 mock 元件**：上面 CSS 已含 `.mock-chip`（filter / tag）/ `.mock-badge`（狀態）/ `.mock-table`（資料表）/ `.mock-task`（dashboard 卡），其他需要的 UI 元素直接照產品實際樣式手刻。元件越貼近真實、user 看 mock 越能立刻 buy in。

**用在 marathon 拍板簿 / 決策追認的單一 UI/UX 決策題**：上面這個「finding 卡 + 拍板區」骨架就是 **形態 1（單一改法、現況 → 建議）**。直接把它當決策卡放進拍板簿 — `data-decision` + radio `name` + `data-comment-for` 照常接 buildSummary、user 看完畫面對比後在卡內直接拍板。不是只有「整份文件是 UX audit」才畫 mock；只要某個拍板題本身涉及 UI/UX 就該用它（判斷準則見 `do-and-dont.md` § UI/UX 決策題）。

### 形態 2 — 多方案擇一（現況 + 方案 A / B …）

**何時用**：決策不是「改 / 不改」、而是「在幾個 UI 方案間選一個」（「給我幾個 design alternative 我選」）。第一欄畫現況、其餘每欄一個候選方案各自 mock、**每欄底部各自一個 radio（同一 `name`，user 選哪欄＝選哪案）**。

```css
/* 把 .ba-grid 從 2 欄擴成 N 欄；手機自動疊單欄 */
.ba-grid.cols-3 { grid-template-columns: 1fr 1fr 1fr; }
.ba-grid.cols-4 { grid-template-columns: repeat(4, 1fr); }
@media (max-width: 980px) {
  .ba-grid.cols-3, .ba-grid.cols-4 { grid-template-columns: 1fr; }
}
/* 候選方案欄（中性 accent 色、有別於 before 紅 / after 綠）*/
.ba-col.option .h { background: var(--accent-soft); color: var(--accent); }
/* 每欄底部拍板 radio 區 */
.ba-col .pick { margin-top: 12px; padding-top: 10px; border-top: 1px dashed var(--border); }
```

```html
<div class="card finding-card">
  <div class="finding-head">
    <span class="badge badge-purple">D-5</span>
    <span class="title">客戶綁定入口擺哪 — 三方案擇一</span>
  </div>

  <div class="ba-grid cols-3">
    <!-- 第一欄：現況（不放 radio、現況不是選項）-->
    <div class="ba-col before">
      <span class="h">現況</span>
      <div class="desc">入口藏在「⋯」選單第三層、平均 4 次點擊才到。</div>
      <div class="mock"><span class="mock-label">現況</span>
        <!-- 真 mock：埋在 overflow menu 裡 -->
      </div>
    </div>
    <!-- 方案 A -->
    <div class="ba-col option">
      <span class="h">方案 A · 主操作列按鈕</span>
      <div class="desc">最顯眼、佔一個主按鈕位。</div>
      <div class="mock"><span class="mock-label">方案 A</span>
        <!-- 真 mock：主列多一顆「綁定客戶」 -->
      </div>
      <div class="pick">
        <label class="choice"><input type="radio" name="d-5" value="方案A · 主操作列"><span class="choice-dot"></span><span><strong>選這個</strong></span></label>
      </div>
    </div>
    <!-- 方案 B -->
    <div class="ba-col option">
      <span class="h">方案 B · 行內 inline 連結</span>
      <div class="desc">不佔主按鈕、但稍不顯眼。</div>
      <div class="mock"><span class="mock-label">方案 B</span>
        <!-- 真 mock：客戶欄位旁 inline「綁定」 -->
      </div>
      <div class="pick">
        <label class="choice"><input type="radio" name="d-5" value="方案B · inline 連結"><span class="choice-dot"></span><span><strong>選這個</strong></span></label>
      </div>
    </div>
  </div>

  <!-- 補充框：data-comment-for 對齊 radio name -->
  <div class="finding-action" style="margin-top: 12px;">
    <div><div class="h">補充</div>
      <textarea class="note" data-comment-for="d-5" placeholder="為什麼選這案 / 想混搭..."></textarea>
    </div>
  </div>
</div>
```

→ builder 照常 `getValue("d-5")` + `getComment("d-5")`；現況欄不放 radio、只候選方案欄放（同一 `name` 互斥）。

**反例 — 不要這樣寫**：

❌ 抽象描述：
```html
<div class="ba-col before">
  <p>現況：自動化規則描述用 SQL pseudo code、主管看不懂。</p>
</div>
```

❌ ASCII / monospace 假裝 UI：
```html
<div class="ba-col before">
  <pre>
  [自動化規則]
  名稱: payment-overdue-7d
  條件: order.payment_due_at <= 7d
  狀態: [已停用]
  </pre>
</div>
```

✅ 真 HTML mock（如上面骨架範例）— user 一眼看出問題。

---

## ADR alternatives table（多方案比較）

**何時用**：寫 ADR / 設計決策、3+ 個方案比較。**選中那行高亮**。

```css
.adr-table {
  width: 100%; border-collapse: collapse; font-size: 13px;
  border-radius: 10px; overflow: hidden; border: 1px solid var(--border);
}
.adr-table th, .adr-table td { padding: 10px 14px; text-align: left; border-bottom: 1px solid var(--border); }
.adr-table thead { background: var(--bg-soft); }
.adr-table th {
  font-size: 11px; font-weight: 600;
  letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-muted);
}
.adr-table tr:last-child td { border-bottom: none; }
.adr-table tr.chosen { background: var(--green-soft); }
.adr-table tr.chosen td:first-child { font-weight: 700; color: var(--green); }
.adr-table tr.chosen td:first-child::before { content: '✓ '; font-weight: 900; }
```

```html
<table class="adr-table">
  <thead>
    <tr>
      <th>方案</th>
      <th>機制</th>
      <th>穩定性</th>
      <th>代價</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>A · 自製 marker</td>
      <td>Prompt 教 AI 寫標記</td>
      <td><span style="color: var(--red);">低</span></td>
      <td>低</td>
    </tr>
    <tr class="chosen">
      <td>B · 原生工具</td>
      <td>Provider 強制 schema</td>
      <td><span style="color: var(--green);">高</span></td>
      <td>中</td>
    </tr>
  </tbody>
</table>
```

---

# 📖 解釋類元件（教學 / 概念解釋 / 純資訊呈現）

> 這組元件補的是「**沒有待拍板選項、純粹要讓人看懂一件事**」的場景。決策簿那套（對比、拍板卡）解決的是「要你選」，這組解決的是「要你懂」。
> 搭配 `examples/explainer/` 的內容骨架使用——骨架決定講的順序，元件決定每段長什麼樣。

## ⭐ 定義卡（術語 → 一句話 → 細節）

**何時用**：introduce 一個讀者可能沒聽過的名詞。**第一次出現就給定義**，不要讓人邊讀邊猜。

**設計原則**：一句話定義要能獨立成立（脫離上下文也看得懂）、且**不使用其他未定義的術語**。細節放第三層，想略過的人可以略過。

```css
.def-card {
  background: var(--bg-card);
  border: 1.5px solid var(--border);
  border-left: 3px solid var(--clay);
  border-radius: 10px;
  padding: 16px 20px;
}
.def-term {
  font-family: var(--serif);
  font-size: 17px;
  font-weight: 500;
  color: var(--slate);
}
.def-term .orig {
  font-family: var(--mono);
  font-size: 11.5px;
  color: var(--text-soft);
  margin-left: 8px;
}
.def-oneliner {
  font-size: 15px;
  color: var(--slate);
  margin-top: 6px;
  line-height: 1.6;
}
.def-oneliner em {
  font-style: italic;
  color: var(--clay-d);
}
.def-detail {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--border);
  line-height: 1.6;
}
```

```html
<div class="def-card">
  <div class="def-term">換發憑證<span class="orig">refresh token</span></div>
  <div class="def-oneliner">
    一張<em>只能用來換新門票</em>的憑證——它自己開不了任何門。
  </div>
  <div class="def-detail">
    活得久（數十天）、但只在「換發」這一個時刻送出，其餘時間躺在瀏覽器的
    cookie 裡不動。因為露出的次數少，所以可以給它長壽命。
  </div>
</div>
```

## ⭐ 類比橋（用已知的東西對照未知）

**何時用**：概念抽象、或讀者的背景離這個領域很遠。**放在正式定義之後、機制拆解之前**——先讓人有個粗略的心智模型，再填細節。

**兩條規則**（違反會幫倒忙）：

1. **類比對象必須是讀者確定熟悉的**（日常生活 > 另一個技術概念）
2. **必須標出類比失準的地方**。沒標的類比會被讀者無限外推，最後產生比不解釋更糟的誤解

```css
.analogy {
  background: var(--olive-soft);
  border: 1.5px solid var(--olive-border);
  border-radius: 12px;
  padding: 18px 22px;
}
.analogy-head {
  font-family: var(--serif);
  font-size: 16px;
  color: #46552f;
  margin-bottom: 14px;
}
.analogy-head em {
  font-style: italic;
  font-weight: 500;
}
.analogy-row {
  display: grid;
  grid-template-columns: 1fr 34px 1fr;
  align-items: center;
  gap: 8px;
  padding: 7px 0;
  border-top: 1px solid var(--olive-border);
  font-size: 13.5px;
}
.analogy-row .known {
  color: var(--text-muted);
}
.analogy-row .arrow {
  text-align: center;
  color: var(--olive);
  font-size: 12px;
}
.analogy-row .target {
  font-weight: 600;
  color: var(--slate);
}
.analogy-limit {
  margin-top: 14px;
  padding: 10px 13px;
  background: var(--yellow-soft);
  border: 1px solid var(--yellow-border);
  border-radius: 8px;
  font-size: 12.5px;
  color: #6b4d10;
  line-height: 1.55;
}
```

```html
<div class="analogy">
  <div class="analogy-head">這套機制就像 <em>遊樂園的入園手環與票根</em></div>
  <div class="analogy-row">
    <span class="known">手環（戴在手上，隨時被查）</span
    ><span class="arrow">↔</span><span class="target">存取憑證</span>
  </div>
  <div class="analogy-row">
    <span class="known">票根（收在包包，只在換手環時拿出來）</span
    ><span class="arrow">↔</span><span class="target">換發憑證</span>
  </div>
  <div class="analogy-row">
    <span class="known">手環會褪色失效，拿票根換新的</span
    ><span class="arrow">↔</span><span class="target">存取憑證過期後自動換發</span>
  </div>
  <div class="analogy-limit">
    <strong>類比在哪裡失準：</strong>手環掉了別人撿去就能用一整天；存取憑證只有
    15 分鐘壽命，而且伺服器隨時可以讓票根作廢——遊樂園做不到這件事。
  </div>
</div>
```

## ⭐ 分層剖面（系統堆疊、哪層負責什麼）

**何時用**：要說明「這個系統由哪幾層組成、每層負責什麼、本次只動哪一層」。

**跟樹狀元件的差別**：樹狀表達的是**分類與分支**（一個東西下面有哪些種類）；分層表達的是**堆疊與相依**（上層踩在下層之上）。講架構幾乎都該用分層，不要誤用樹狀。

```css
.layers {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.layer {
  display: grid;
  grid-template-columns: 150px 1fr auto;
  align-items: center;
  gap: 14px;
  padding: 13px 18px;
  background: var(--bg-card);
  border: 1.5px solid var(--border);
  font-size: 13.5px;
}
.layer:first-child {
  border-radius: 10px 10px 4px 4px;
}
.layer:last-child {
  border-radius: 4px 4px 10px 10px;
}
.layer .name {
  font-weight: 600;
  color: var(--slate);
}
.layer .role {
  color: var(--text-muted);
}
.layer .tag {
  font-family: var(--mono);
  font-size: 10.5px;
  color: var(--text-soft);
}
.layer.emph {
  border-color: var(--clay);
  background: var(--clay-soft);
}
.layer.emph .tag {
  color: var(--clay-d);
  font-weight: 600;
}
.layer.dim {
  opacity: 0.55;
}
```

```html
<div class="layers">
  <div class="layer">
    <span class="name">瀏覽器</span>
    <span class="role">收著換發憑證，過期時自動去換新的</span>
    <span class="tag">前端</span>
  </div>
  <div class="layer emph">
    <span class="name">認證中介層</span>
    <span class="role">驗簽章、判斷過期、決定放行或退回</span>
    <span class="tag">本次只動這層</span>
  </div>
  <div class="layer">
    <span class="name">業務邏輯</span>
    <span class="role">拿到身分後才開始做事</span>
    <span class="tag">後端</span>
  </div>
  <div class="layer dim">
    <span class="name">資料庫</span>
    <span class="role">存使用者與憑證作廢清單</span>
    <span class="tag">不受影響</span>
  </div>
</div>
```

## ⭐ 時序圖（誰呼叫誰、按什麼順序）

**何時用**：多個角色來回互動、而且**順序本身就是重點**（誰先誰後、哪一步會失敗、失敗後退回哪裡）。單向流程用流程圖就好，有來有回才需要時序圖。

**三條時序路由的優先序（2026-09-05 定案，四處說法以此為準）**：① 參與者 ≤2、無分支、訊息 ≤4 → 本節 CSS 版；② 其餘一律 → SVG 時序圖（`references/structure-diagrams.md` §7.3，分支用組合片段）；③ Mermaid 只在使用者明說「用 mermaid」時用，不再是預設。

**做法**：橫向是參與者、縱向是時間。訊息用 grid 跨欄定位，**不要手刻座標**——欄位由參與者數量算出來，改內容不會跑版。

```css
.seq {
  --lanes: 3;
  background: var(--bg-card);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 16px 18px 20px;
}
.seq-actors {
  display: grid;
  grid-template-columns: repeat(var(--lanes), 1fr);
  gap: 8px;
  margin-bottom: 12px;
}
.seq-actor {
  text-align: center;
  font-size: 12.5px;
  font-weight: 600;
  padding: 7px 6px;
  background: var(--bg-soft);
  border: 1.5px solid var(--border);
  border-radius: 8px;
}
.seq-body {
  position: relative;
  display: grid;
  grid-template-columns: repeat(var(--lanes), 1fr);
  row-gap: 9px;
}
.seq-lane {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1.5px;
  background: repeating-linear-gradient(
    180deg,
    var(--border) 0 5px,
    transparent 5px 11px
  );
  left: calc((var(--i) + 0.5) * 100% / var(--lanes));
}
.seq-msg {
  position: relative;
  z-index: 1;
  font-size: 12.5px;
  padding: 7px 12px;
  background: var(--bg-card);
  border: 1.5px solid var(--border-strong);
  border-radius: 7px;
  text-align: center;
  grid-column: var(--from) / var(--to);
}
.seq-msg.back {
  border-style: dashed;
}
.seq-msg.ok {
  border-color: var(--green);
  background: var(--green-soft);
  color: #2d4a1c;
}
.seq-msg.fail {
  border-color: var(--red);
  background: var(--red-soft);
  color: var(--red);
}
.seq-msg .dir {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--text-soft);
  margin-right: 6px;
}
```

```html
<!-- --lanes 設為參與者數量；每則訊息用 --from / --to 指定跨哪兩欄（1-indexed，to 為結束邊界）-->
<div class="seq" style="--lanes: 3">
  <div class="seq-actors">
    <div class="seq-actor">瀏覽器</div>
    <div class="seq-actor">認證中介層</div>
    <div class="seq-actor">資料庫</div>
  </div>
  <div class="seq-body">
    <div class="seq-lane" style="--i: 0"></div>
    <div class="seq-lane" style="--i: 1"></div>
    <div class="seq-lane" style="--i: 2"></div>

    <div class="seq-msg" style="--from: 1; --to: 3">
      <span class="dir">①→</span>帶著存取憑證請求資料
    </div>
    <div class="seq-msg fail" style="--from: 2; --to: 3">
      <span class="dir">②</span>驗出已過期
    </div>
    <div class="seq-msg back" style="--from: 1; --to: 3">
      <span class="dir">③←</span>退回「請換發」
    </div>
    <div class="seq-msg" style="--from: 1; --to: 4">
      <span class="dir">④→</span>拿換發憑證去換新的
    </div>
    <div class="seq-msg ok" style="--from: 1; --to: 3">
      <span class="dir">⑤←</span>發新存取憑證，原請求重送
    </div>
  </div>
</div>
```

## 誤解破解 / 狀態演進（既有元件的解釋型用法）

這兩種形態不需要新元件，但**很多人不知道可以這樣用**，所以在這裡點名：

| 想表達 | 用哪個既有元件 | 怎麼改 |
|---|---|---|
| **你以為 X，其實 Y**（破解常見誤解）| Compare card | 左欄標題改「常見的理解」（紅）、右欄「實際上」（綠）。破解迷思比正面陳述更有記憶點，教學型內容建議至少放一組 |
| **同一份資料在每個步驟長什麼樣**（狀態演進）| Vertical flow + `.mock` | 每個步驟節點下掛一個 mock，畫出該步驟結束時資料的實際樣子。比「第一步做 A、第二步做 B」的純文字有效得多 |
| **兩種角色看到的畫面不同** | Before-After UI mock（N 欄）| 每欄一個角色視角，欄頭標角色名而不是 before/after |

## Flow diagram（box + arrow 橫向）

**何時用**：系統高層 flow、左到右流程圖，**限單向直線鏈**。一出現分支（同一格兩個出口）、跨角色交接、回頭路，就不是這個元件——改走 `references/structure-diagrams.md` 畫 SVG（流程圖 / 泳道 / 狀態機）。把分支硬塞成兩行 div 或表格是 2026-09-05 前最常見的退化。

```css
.flow-stage {
  background: var(--bg-card);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
}
.flow-stage.highlight { border-color: var(--accent); background: var(--accent-soft); }
.flow-arrow {
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; color: var(--text-soft);
}
```

```html
<div class="grid grid-cols-7 gap-3 items-center">
  <div class="flow-stage">🎙️<br>錄音</div>
  <div class="flow-arrow">→</div>
  <div class="flow-stage">📝<br>逐字稿</div>
  <div class="flow-arrow">→</div>
  <div class="flow-stage highlight">🤖<br>AI 分析<br><span class="text-[10px]" style="color: var(--accent);">本次改動</span></div>
  <div class="flow-arrow">→</div>
  <div class="flow-stage">✏️<br>校正</div>
</div>
```

## Vertical flow（垂直 + 箭頭線）

**何時用**：**同一個角色**做的階段內部串行流程、垂直空間夠時。串行不等於同一角色——步驟之間換人做的，走 SVG 泳道。

```css
.flow-arrow-down {
  width: 1px; height: 28px; background: var(--border-strong);
  margin: 0 auto; position: relative;
}
.flow-arrow-down::after {
  content: '▼'; position: absolute;
  bottom: -8px; left: 50%; transform: translateX(-50%);
  color: var(--border-strong); font-size: 10px;
}
```

```html
<div class="space-y-3">
  <div class="flow-stage">階段一</div>
  <div class="flow-arrow-down"></div>
  <div class="flow-stage">階段二</div>
  <div class="flow-arrow-down"></div>
  <div class="flow-stage">階段三</div>
</div>
```

## Tree（樹狀分類 / failure mode）

**何時用**：**分類階層**（每個節點只有一個父、往下只是「屬於」關係）：分類視覺化、失敗模式樹、淺層檔案樹（2-3 級）。**不是**這個元件的：帶條件出口的決策樹（→ SVG 流程圖）、多父或有環的依賴圖（→ SVG 依賴圖），見 `references/structure-diagrams.md` §1。

```css
.tree { font-size: 13px; line-height: 1.5; }
.tree-node {
  padding: 10px 14px; border-radius: 8px;
  background: var(--bg-card); border: 1.5px solid var(--border);
  display: inline-flex; align-items: center; gap: 8px; font-weight: 500;
}
.tree-node.start { border-color: var(--accent); background: var(--accent-soft); color: var(--accent); }
.tree-node.success { border-color: var(--green); background: var(--green-soft); color: #065f46; }
.tree-node.degraded { border-color: var(--yellow); background: var(--yellow-soft); color: #713f12; }
.tree-node.hard-fail { border-color: var(--red); background: var(--red-soft); color: var(--red); }

.tree-branch {
  margin-left: 18px; padding-left: 24px;
  border-left: 1.5px solid var(--border-strong);
  padding-top: 14px; padding-bottom: 4px; position: relative;
}
.tree-branch::before {
  content: ''; position: absolute;
  left: -1.5px; top: 0; width: 14px; height: 1.5px;
  background: var(--border-strong);
}

.tree-leaf {
  margin-top: 12px; padding: 10px 14px; border-radius: 8px;
  background: var(--bg-soft); font-size: 12px; color: var(--text-muted);
}
.tree-leaf strong {
  color: var(--text); display: block; margin-bottom: 2px; font-size: 12px;
}
```

```html
<div class="tree">
  <div class="tree-node start">起點</div>
  <div class="tree-branch">
    <div class="tree-node success">✓ 成功路徑</div>
  </div>
  <div class="tree-branch">
    <div class="tree-node degraded">⚠ 降級路徑</div>
    <div class="tree-leaf">
      <strong>偵測</strong>怎麼判斷<br>
      <strong>處理</strong>fallback 策略<br>
      <strong>觀察</strong>log 標記
    </div>
  </div>
  <div class="tree-branch">
    <div class="tree-node hard-fail">✗ 硬失敗</div>
    <div class="tree-leaf">
      <strong>偵測</strong>...<br>
      <strong>處理</strong>throw
    </div>
  </div>
</div>
```

## Phase timeline（垂直 dot + line）

**何時用**：時間軸、phase 進度、歷史軌跡、review history。

```css
.phase-timeline { position: relative; padding-left: 32px; }
.phase-timeline::before {
  content: ''; position: absolute;
  left: 11px; top: 0; bottom: 0;
  width: 2px; background: var(--border);
}
.phase-item { position: relative; margin-bottom: 14px; }
.phase-item::before {
  content: ''; position: absolute;
  left: -27px; top: 8px;
  width: 12px; height: 12px;
  border-radius: 50%;
  background: var(--green);
  border: 3px solid var(--bg);
  box-shadow: 0 0 0 1.5px var(--green);
}
.phase-item-title { font-size: 13px; font-weight: 600; }
.phase-item-detail { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
```

```html
<div class="phase-timeline">
  <div class="phase-item">
    <div class="phase-item-title">Phase 0 · Audit</div>
    <div class="phase-item-detail">DB 失敗率 + 升版 audit</div>
  </div>
  <div class="phase-item">
    <div class="phase-item-title">Phase 1 · Spec</div>
    <div class="phase-item-detail">10 AC + ADR</div>
  </div>
</div>
```

## Commit box（連續節點）

**何時用**：commit 拆法視覺化、連續任務節點。

```css
.commit-box {
  background: var(--bg-card);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  padding: 14px;
  position: relative;
}
.commit-box::before {
  content: ''; position: absolute;
  left: -10px; top: 24px;
  width: 8px; height: 8px;
  border-radius: 50%; background: var(--accent);
}
.commit-box::after {
  content: ''; position: absolute;
  left: -7px; top: 32px;
  width: 1.5px; height: calc(100% - 16px);
  background: var(--border);
}
.commit-box:last-child::after { display: none; }
```

```html
<div class="space-y-3 pl-3">
  <div class="commit-box">
    <span class="badge badge-blue">Commit 1</span>
    <strong class="text-sm ml-2">baseline config</strong>
    <div class="text-[11px] mt-1.5" style="color: var(--text-muted);">3 檔</div>
  </div>
  <div class="commit-box">
    <span class="badge badge-blue">Commit 2</span>
    <strong class="text-sm ml-2">backend implementation</strong>
  </div>
</div>
```

## QA step card（編號 + 內容）

**何時用**：步驟清單、checklist、流程指南。

```css
.qa-step {
  display: grid; grid-template-columns: 36px 1fr;
  gap: 14px; padding: 12px;
  border-radius: 10px; background: var(--bg-soft);
}
.qa-step-num {
  width: 32px; height: 32px;
  border-radius: 50%; background: var(--accent); color: white;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 14px;
}
```

```html
<div class="qa-step">
  <div class="qa-step-num">1</div>
  <div>
    <div class="font-semibold text-sm">第一步</div>
    <div class="text-xs mt-1" style="color: var(--text-muted);">細節說明</div>
  </div>
</div>
```

---

## Badge / chip（語意標記）

**何時用**：狀態標記、分類 chip、metadata 顯示。

```css
.badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 10px; font-size: 11px; font-weight: 600;
  border-radius: 9999px; letter-spacing: 0.02em; white-space: nowrap;
}
.badge-green { background: var(--green-soft); color: var(--green); border: 1px solid var(--green-border); }
.badge-red { background: var(--red-soft); color: var(--red); border: 1px solid var(--red-border); }
.badge-yellow { background: var(--yellow-soft); color: var(--yellow); border: 1px solid var(--yellow-border); }
.badge-blue { background: var(--accent-soft); color: var(--accent); border: 1px solid #bfdbfe; }
.badge-purple { background: var(--purple-soft); color: var(--purple); border: 1px solid var(--purple-border); }
.badge-orange { background: var(--orange-soft); color: var(--orange); border: 1px solid var(--orange-border); }
```

```html
<span class="badge badge-green">✓ 完成</span>
<span class="badge badge-blue">Phase 1</span>
<span class="badge badge-purple">D-229</span>
<span class="badge badge-yellow">⚠ 待議</span>
<span class="badge badge-red">✗ 失敗</span>
```

## Section number（區段大編號）

**何時用**：每個主要區段標題前的視覺錨點。預設 mono 兩位數（`01` / `02`）；圈號（②③）屬 functional 風舊寫法，英文字（A B C）只給尾段程序快答的題號。

```css
.section-num {
  display: inline-flex; align-items: center; justify-content: center;
  width: 32px; height: 32px;
  background: var(--accent); color: white;
  font-weight: 700; font-size: 14px;
  border-radius: 8px; margin-right: 12px;
}
.section-num.circle { border-radius: 50%; background: var(--purple); }
```

```html
<div class="flex items-center mb-4">
  <span class="section-num">A</span>
  <div>
    <h2 class="text-xl font-bold">區段標題</h2>
    <p class="text-sm" style="color: var(--text-muted);">副說明</p>
  </div>
</div>

<!-- 圈號版（技術討論區）-->
<div class="flex items-center mb-4">
  <span class="section-num circle">②</span>
  <div>
    <h2 class="text-xl font-bold">系統架構</h2>
  </div>
</div>
```

---

## Decision card with radio choices

**何時用**：等使用者拍板的決策卡、每張卡含完整 context + 選項。

詳細互動 CSS 見 `interaction-patterns.md`。

```html
<div class="card p-6">
  <div class="grid md:grid-cols-3 gap-6">
    <div class="md:col-span-2">
      <div class="flex items-center gap-2 mb-2">
        <span class="badge badge-purple">D-1</span>
        <span class="badge badge-green">已 default</span>
      </div>
      <h3 class="text-lg font-semibold">決策標題</h3>
      <p class="text-sm mt-2" style="color: var(--text-muted);">
        背景說明、為什麼這樣選。
      </p>
      <div class="highlight-box mt-3">
        <strong>推翻代價</strong>：⋯⋯
      </div>
    </div>
    <div class="md:col-span-1">
      <div class="text-[10px] uppercase tracking-widest font-semibold mb-2"
           style="color: var(--text-muted);">你的選擇</div>
      <div class="choice-row">
        <label class="choice">
          <input type="radio" name="d-1" value="認可" checked>
          <span class="choice-dot"></span>
          <span><strong>認可</strong></span>
        </label>
        <label class="choice choice-warning">
          <input type="radio" name="d-1" value="推翻">
          <span class="choice-dot"></span>
          <span><strong>推翻</strong></span>
        </label>
      </div>
    </div>
  </div>
</div>
```

## Choice pills（radio 美化）

**何時用**：取代陽春 radio button、視覺化選項。

詳細 CSS 見 `interaction-patterns.md` § Radio 美化。

```html
<div class="grid md:grid-cols-2 gap-3">
  <label class="choice">
    <input type="radio" name="example" value="A" checked>
    <span class="choice-dot"></span>
    <span><strong>選項 A</strong> · 主要說明</span>
  </label>
  <label class="choice choice-warning">
    <input type="radio" name="example" value="B">
    <span class="choice-dot"></span>
    <span><strong>選項 B</strong> · 推翻 / 警告類</span>
  </label>
</div>
```

---

## ⭐ 資料圖表（趨勢 / 占比 / 分組 → 交棒 chart skill）

本元件庫**不含資料圖表**。需要畫真正的圖（趨勢、占比、分組、堆疊、目標 vs 實際）時 **Read `chart` skill**，照它的選圖決策表與五條鐵則做，不要在這裡自己發明。

### 先判斷：這份資料該畫圖，還是該用表格 / Stat card？

| 情況 | 用什麼 | 為什麼 |
|---|---|---|
| 3~5 個彼此獨立的 KPI 數字 | Stat card grid | 畫成柱狀圖反而看不出「各自是多少」 |
| 改前 / 改後兩個數字 | Metric dashboard | 兩個點不成趨勢 |
| 兩條長度比例（token 佔比之類）| Bar comparison | 殺雞不用牛刀、免載圖庫 |
| 精確數值要被逐格閱讀 / 對照 | 表格 | 圖是看形狀的，不是看數字的 |
| **時間序列 ≥ 5 點**、要看趨勢 / 轉折 | **圖表 → 交棒** | 這才是圖表的主場 |
| **多類別占比**要看結構 | **圖表 → 交棒** | |
| **同期多項並排比 / 組成拆解** | **圖表 → 交棒** | |

> 判斷心法：**「我要讀數字」→ 表格 / Stat card；「我要看形狀」→ 圖表。**
> 資料太稀疏（< 5 點）、量級差極端、單位混雜 → 先處理資料再談畫圖，別硬畫（chart skill 第一條鐵則）。

### 交棒規則

1. **Read `chart` skill** —— 拿它的選圖決策表選圖型、遵守它的五條鐵則（最常違反的是「不同單位永遠不共用一條 Y 軸」）。**配色歸屬**：圖表嵌在 html-visualizer 頁面時，序列色用本頁 token（clay / olive / yellow / g500 依序），不用 chart 自帶的靛藍琥珀組；chart 的 `tokens.css` 只給獨立圖表頁。
2. **先找專案自己的圖表配色**（品牌 / 語意 token），找到就用它，讓報告裡的圖跟產品畫面同一個色語言；找不到才用 chart skill 的預設調色盤。
3. **渲染驗證不能省** —— 圖庫畫出來的柱 / 線是向量路徑不是矩形，數錯選擇器會誤判成「沒渲染」；而且要**真的截圖用眼睛看好不好看**，「有渲染」不等於「好看」。

### 嚴格禁止

- **用表格假裝圖表** —— 該看形狀的資料塞進表格，等於要 user 自己在腦裡畫圖
- **手刻 SVG 折線 / 柱狀** —— 座標算錯不會報錯、只會安靜地畫出錯誤的形狀
- **用 CSS 寬度百分比模擬柱狀圖當作趨勢圖** —— Bar comparison 是「兩條比例」，不是圖表替代品
- **雙 Y 軸** —— 刻度可被任意拉伸＝誤導；要對照不同單位改用雙面板共用 X 軸

---

# 💻 Code-shape 視覺（程式開發解說場景）

> 參考 HumanLayer 的 show-me skill 引入。核心洞見：**程式碼的形狀本身就是最好的視覺**——呼叫階層、元件樹、檔案分工這些東西，用等寬字排縮排比硬轉成 div 流程圖密度高、產得快、也不會畫錯。

**適用受眾**：開發者。這個場景下函式名 / 元件名**就是內容本身**、不算雜訊；檔案路徑降級為灰色小字註腳。對非技術受眾（業務 / stakeholder）維持既有規則：邏輯描述為主、不出現 code path。

**兩條鐵則（拍板 1 的採納條件）**：

1. **不是裸 ASCII**——ASCII 樹狀圖（`├─ └─`）依然禁止。code-shape 用**帶樣式的等寬區塊**呈現：`<pre class="codeshape">` + 語法上色 span + 行內灰字註解。視覺上是一個排版過的元件、不是貼上來的終端機輸出。
2. **必配摘要文字說明**——每個 code-shape 區塊旁邊要有一兩句文字，講清楚「這張形狀要你看出什麼」（例：「串流狀態住在頁面層、不在訊息元件裡——這就是為什麼切頁不會斷線」）。形狀給結構、文字給重點，缺一不可。

### 共用 CSS

```css
pre.codeshape {
  font-family: var(--mono);
  font-size: 12.5px;
  line-height: 1.7;
  background: var(--g100);
  border: 1px solid var(--g200);
  border-radius: 8px;
  padding: 14px 16px;
  margin: 0;
  color: var(--g700);
  overflow-x: auto;   /* 手機必備：長行捲動、不凸出視窗 */
}
.cs-fn   { color: var(--slate); font-weight: 600; }  /* 函式 / 端點 */
.cs-tag  { color: var(--clay-d); font-weight: 600; } /* Vue / HTML 元件 */
.cs-hook { color: var(--olive); }                    /* composable / hook / 狀態 */
.cs-path { color: var(--g500); font-size: 11px; }    /* 檔案路徑註腳 */
.cs-note { color: var(--g500); font-style: italic; } /* 行內註解 */
```

⚠️ 390px 版面陷阱：行內註解（`.cs-note`）跟主體之間**不要墊大量空格對齊**——長行在手機上會凸出；註解間距 2 格即可，`overflow-x: auto` 兜底。

## ⭐ Code-shape 四形態（pseudocode / call tree / component tree / 檔案責任樹）

**選型**：邏輯 / 演算法 → pseudocode；執行期誰呼叫誰 → call tree；UI 結構與狀態歸屬 → component tree；檔案分工 / 大型重構 → 淺層檔案責任樹（2-3 級就好、不要全樹）。

```html
<!-- call tree：縮排=呼叫深度、註解講每步在幹嘛 -->
<pre class="codeshape"><span class="cs-fn">sendMessage</span>  <span class="cs-note">← 使用者按送出</span>
  <span class="cs-hook">useSSE().subscribe</span>  <span class="cs-note">先掛好串流訂閱</span>
  <span class="cs-fn">POST /api/chat</span>
    <span class="cs-fn">chat.send</span>  <span class="cs-note">WS RPC → AI 容器</span>
      onDelta  <span class="cs-note">→ 轉 SSE 推回</span></pre>

<!-- component tree：狀態歸屬用 hook 色、路徑當註腳 -->
<pre class="codeshape"><span class="cs-tag">&lt;WorkspacePage&gt;</span>  <span class="cs-path">pages/workspace.vue</span>
  <span class="cs-hook">useSSE()</span>  <span class="cs-note">串流狀態住在頁面層</span>
  <span class="cs-tag">&lt;ChatPanel&gt;</span>
    <span class="cs-tag">&lt;StreamingMessage&gt;</span>  <span class="cs-note">← delta 落地處</span></pre>
```

pseudocode 同樣寫法（縮排表達分支）；檔案責任樹每行「目錄 + 一句責任註解」，用縮排不用 `├─`。

## ⭐ 結構 diff（＋/− 疊在形狀上）

**何時用**：要講「**改了什麼**」的時候。並排兩棵樹要讀者自己找碴；＋/− 直接疊在結構上一眼看完。同一招套用在 call tree、component tree、檔案佈局、控制流——**diff 的形狀跟著主題走**。

**變更呈現三分法**（拍板 2）：

| 變更類型 | 用什麼 |
|---|---|
| 畫面外觀變更 | Before-After UI mock（既有並排格）|
| 結構 / 流程 / 檔案佈局變更 | **結構 diff**（本元件）|
| 大部分是新的、或讀者需要可複製的完整目標形狀 | 整塊全貼（styled code block）|

```css
pre.sdiff {
  font-family: var(--mono);
  font-size: 12.5px;
  line-height: 1.7;
  background: var(--g100);
  border: 1px solid var(--g200);
  border-radius: 8px;
  padding: 10px 0;
  margin: 0;
  color: var(--g700);
  overflow-x: auto;
}
.sdiff .line { display: block; padding: 0 16px; white-space: pre; }
.sdiff .line.add { background: var(--green-soft); color: #4a5c34; }
.sdiff .line.del { background: var(--red-soft); color: var(--red);
  text-decoration: line-through;
  text-decoration-color: rgba(184, 92, 62, 0.4); }
```

```html
<pre class="sdiff"><span class="line"> submitEdit</span>
<span class="line">   validateBlocks</span>
<span class="line del">-  saveRawText</span>
<span class="line add">+  saveBlocks</span>
<span class="line add">+    diffPublished</span>
<span class="line"> publishRecord</span></pre>
```

## Mermaid 時序圖（CDN 一行引入）

**何時用**：只在使用者明說「用 mermaid」時用（2026-09-05 起不再是預設——它的自動排版正是 diagram-design 列的 slop 特徵之一）。預設路由見 § 時序圖 的優先序：≤2 參與者無分支用 CSS 版，其餘用 SVG 時序圖（`references/structure-diagrams.md` §7.3）。

**引入方式（就一行 CDN script、零 build 步驟，跟 Tailwind CDN 同模式）**：

```html
<div class="mermaid-box"><!-- overflow-x:auto 的容器、防手機跑版 -->
<pre class="mermaid">sequenceDiagram
    participant B as 瀏覽器
    participant S as Strapi
    B->>S: 送出訊息
    S-->>B: SSE 逐段推送</pre>
</div>

<!-- </body> 前 -->
<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
<script>
  if (window.mermaid) {
    window.mermaid.initialize({
      startOnLoad: true,
      theme: "neutral",
      themeVariables: { fontFamily: "system-ui, PingFang TC, Noto Sans TC, sans-serif" },
    });
  }
</script>
```

```css
.mermaid-box {
  background: var(--paper);
  border: 1px solid var(--g200);
  border-radius: 8px;
  padding: 10px;
  overflow-x: auto;
}
```

**注意**：① 離線開檔時 CDN 載不到、`pre.mermaid` 會顯示原始文字——圖義仍可讀、版面不會壞，可接受；② `if (window.mermaid)` 守衛必加、CDN 失敗時不拋錯；③ 這是本 skill 唯二的外部 script（另一個是 Tailwind CDN），不要再加別的圖庫——真資料圖表交棒 `chart` skill。

---

## 何時用什麼元件 — 速查

| 你想呈現 | 用元件 |
|---|---|
| 一句話強調 | Highlight box |
| 痛點 / 為什麼做 | Pain card |
| 幾個 KPI | Stat card grid |
| 改前 / 改後數據 | Metric dashboard |
| 兩條 token / 時間對比 | Bar comparison |
| 趨勢 / 占比 / 分組 / 堆疊 / 目標 vs 實際 | ⭐ 資料圖表 → **交棒 chart skill**（先判斷該畫圖還是該用表格）|
| 兩個方案並排（文字 bullet）| Compare card |
| UI/UX 改動畫面對比 / 拍板前比較體驗 | ⭐ Before-After UI mock（現況 vs 修改後 / 多方案 N 欄）|
| 3+ 方案比較 | ADR alternatives table |
| 系統流程左到右、**單向無分岔** | Flow diagram（div）|
| 階段內部上到下 | Vertical flow |
| 失敗分類 / 淺層分類樹（每節點一個父） | Tree（div）|
| ⭐ 有分支的判斷流程 / 跨角色交接 / 狀態與回頭路 / 分區架構 / 多父或有環的依賴 | **SVG 結構圖 → `references/structure-diagrams.md`**（流程圖 / 泳道 / 狀態機 / 架構 / 依賴圖 / 部署 / ER / 甘特）|
| 程式邏輯 / 呼叫關係 / UI 結構歸屬 / 檔案分工（開發者受眾）| ⭐ Code-shape 四形態（必配摘要文字說明）|
| 程式結構 / 流程 / 檔案佈局「改了什麼」| ⭐ 結構 diff（外觀變更才用 Before-After mock）|
| 跨部件互動時序（有來有回、參與者多）| SVG 時序圖（`structure-diagrams.md` §7.3）；Mermaid 只在使用者明說「用 mermaid」時用 |
| 時間軸 / 歷史 | Phase timeline |
| 步驟清單 | QA step card |
| 連續任務 / commit 列 | Commit box |
| 狀態標記 | Badge |
| 等使用者拍板 | Decision card with radio |

## 方案對照表（拍板題常用；2026-09-09 加）

多方案比較的表格最容易跑版：瀏覽器自動分欄會把長句那欄撐到最寬、把短標籤欄與中等長度欄壓成一行三四個字。規則三條：**固定版面＋明定欄寬、只有標籤欄不換行、手機寬度整表橫向捲動**。

```html
<div class="opt-table-wrap">
  <table class="opt-table">
    <colgroup><col style="width:9%"><col style="width:38%"><col style="width:23%"><col style="width:30%"></colgroup>
    <thead><tr><th></th><th>做法</th><th>改動</th><th>取捨</th></tr></thead>
    <tbody>
      <tr><td><strong>A（推薦）</strong></td><td>…</td><td>…</td><td>…</td></tr>
      <tr><td>B</td><td>…</td><td>…</td><td>…</td></tr>
    </tbody>
  </table>
</div>
```

```css
.opt-table { width:100%; border-collapse:collapse; table-layout:fixed; min-width:640px; font-size:13.5px; }
.opt-table th, .opt-table td { border-bottom:1px solid var(--border); padding:9px 10px; text-align:left; vertical-align:top; }
.opt-table th { font-family:var(--mono); font-size:10.5px; letter-spacing:.06em; text-transform:uppercase; color:var(--g500); }
.opt-table td:first-child { white-space:nowrap; }   /* 只有 A／B 標籤欄不換行 */
.opt-table-wrap { overflow-x:auto; }                 /* 手機寬度整表橫向捲動 */
```

**禁**：對內容欄加 `white-space: nowrap`（該欄會吃掉整列寬度、鄰欄被壓成直排；版面健檢會報「長文字被設成不換行」）。欄數不同時比例自己配，原則是「最長句的欄 ≤ 40%」。
