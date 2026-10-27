# Layout 模式

> 容器一律用起手範本的 `.wrap`（`width: min(94vw, 1760px)`，`SKILL.md` 必含元素表）；本檔片段都套它。只有單欄純閱讀頁另外收窄到 900px（見 § Hero + 內容）。

整體版面結構。挑選方式：依內容量 + 是否互動。

## Layout 決策樹

```
內容多 + 多 section + 互動？  →  完整版（Header + Sidebar + Main + Sticky bar）
內容多 + 單純展示？           →  含 Header 標準版（無 sidebar）
內容少（單頁）？              →  Hero + 主內容
研究報告 / 教學？             →  目錄式（左 TOC + 右內容）
```

---

## 完整版（Header + Sidebar + Main + Sticky bar）

**最豐富、最常用於決策追認 / 長 spec / 多區段討論**。

```html
<body>
  <!-- Top Header（sticky）-->
  <header class="page-head">
    <div class="wrap page-head-in">
      <div>
        <div class="mini-label">標題類別 · 日期</div>
        <h1 class="page-title">主標題</h1>
      </div>
      <!-- 進度 / 互動指標 -->
      <span id="progress-summary" class="head-meta">0 / 0</span>
    </div>
  </header>

  <!-- Main grid -->
  <div class="wrap page-grid">

    <!-- Sidebar（900px 以上才顯示）-->
    <aside class="page-side">
      <nav class="side-nav">
        <a href="#section-1" class="nav-link">區段 1</a>
        <a href="#section-2" class="nav-link">區段 2</a>
        <!-- ... -->
      </nav>
    </aside>

    <!-- Main content -->
    <main class="page-main">
      <section id="section-1"><!-- 內容 --></section>
      <section id="section-2"><!-- 內容 --></section>
    </main>

  </div>

  <!-- 底部列：需要時整段複製 marathon 範本那條（references/examples/marathon-decision-sheet，含 id="preview-btn"，
       風格設定按鈕會停在它左邊）。底部列一律統一用範本的，不要自己另做；自己做的固定列不會被閃避，左下角的風格設定按鈕會蓋上去 -->
</body>
```

```css
.page-head {
  position: sticky; top: 0; z-index: 20;
  background: var(--paper);
  border-bottom: 1px solid var(--border);
}
.page-head-in {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding-top: 16px; padding-bottom: 16px;
}
.mini-label { font-size: 12px; font-weight: 600; letter-spacing: 0.1em; color: var(--text-soft); }
.page-title { font-size: 18px; font-weight: 700; margin: 2px 0 0; }
.head-meta { font-size: 14px; font-weight: 500; color: var(--clay-ink); }

.page-grid {
  display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 32px;
  padding-top: 32px; padding-bottom: 32px;
}
.page-side { grid-column: span 2; }
.side-nav { position: sticky; top: 96px; display: grid; gap: 4px; }
.page-main { grid-column: span 10; display: grid; gap: 48px; }
@media (max-width: 900px) {
  .page-side { display: none; }
  .page-main { grid-column: 1 / -1; }
}

.nav-link {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.15s;
}
.nav-link:hover { background: var(--bg-soft); color: var(--text); }
.nav-link.active {
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 500;
}
```

設計重點：
- `.wrap`：寬版容器（`width: min(94vw, 1760px)`，與 `SKILL.md` 必含元素表一致）；長段落另加 `max-width: 72ch` 行長護欄
- `.page-grid` 切 12 欄、欄距 32px：側欄 2 欄＋主內容 10 欄
- 900px 以下側欄隱藏，主內容改佔滿 12 欄
- 標題列 `position: sticky; top: 0` 配 `z-index: 20`：捲動時一直看得到
- 底部列用範本那條（見片段末的註解），範本已處理固定與閃避

---

## 標準版（Header + Main，無 sidebar）

**內容單純、不需 nav 跳轉**。例如：教學文件、單一 spec、簡短報告。

```html
<header class="page-head">
  <div class="wrap page-head-in">
    <h1 class="page-title">標題</h1>
  </div>
</header>

<main class="wrap page-body">
  <section><!-- 內容 --></section>
</main>
```

```css
/* .page-head／.page-head-in／.page-title 照抄 § 完整版那組 */
.page-body { display: grid; gap: 40px; padding-top: 32px; padding-bottom: 32px; }
```

閱讀型內容容器仍吃滿寬，段落另加 `max-width: 72ch` 控制行長（起手範本的 `.lead`、`.body-text` 已帶）。

---

## Hero + 內容（單頁短文）

**極短內容、單頁可讀完**。例如：announcement、status update、簡短決策。

```html
<main class="wrap page-narrow">

  <!-- Hero -->
  <div class="card hero-card">
    <h1 class="hero-title">主標題</h1>
    <p class="hero-sub">副說明</p>
  </div>

  <!-- 內容 -->
  <div class="hero-body">
    <section><!-- 內容 --></section>
  </div>

</main>
```

```css
/* .wrap 給寬度與左右邊距，這裡再收窄成單欄閱讀寬 */
.page-narrow { max-width: 900px; padding-top: 48px; padding-bottom: 48px; }
.hero-card { padding: 40px; margin-bottom: 32px; text-align: center; }
.hero-title { font-size: 30px; font-weight: 700; letter-spacing: -0.02em; margin: 0; }
.hero-sub { font-size: 16px; color: var(--text-soft); margin: 12px 0 0; }
.hero-body { display: grid; gap: 24px; }
```

---

## 目錄式（TOC + 內容並排）

**長文 / 教學 / 研究報告**。左固定 TOC、右是內容、左捲右捲分開。

```html
<div class="wrap toc-layout">

  <!-- TOC -->
  <aside>
    <nav class="toc-in">
      <div class="mini-label">目錄</div>
      <ol class="toc-list">
        <li><a href="#chapter-1" class="nav-link">1. 章節一</a></li>
        <li><a href="#chapter-2" class="nav-link">2. 章節二</a></li>
      </ol>
    </nav>
  </aside>

  <!-- Content（更窄、更舒服閱讀）-->
  <article class="prose-content">
    <section id="chapter-1"><!-- 內容 --></section>
  </article>

</div>

<style>
.toc-layout {
  display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 9fr); gap: 48px;
  padding-top: 32px; padding-bottom: 32px;
}
.toc-in { position: sticky; top: 32px; }
.mini-label { font-size: 12px; font-weight: 600; letter-spacing: 0.1em; color: var(--text-soft); }
.toc-in .mini-label { margin-bottom: 12px; }
/* 章節號寫在文字裡，清掉瀏覽器預設的清單編號 */
.toc-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; font-size: 14px; }
.prose-content {
  font-size: 16px;
  line-height: 1.75;
}
.prose-content h2 { font-size: 1.5rem; font-weight: 700; margin-top: 2rem; }
.prose-content p { margin-top: 1rem; }
.prose-content ul, .prose-content ol { margin-top: 0.75rem; padding-left: 1.5rem; }
</style>
```

---

## 兩欄對等（comparison / before-after）

**兩個方案 / 視角並排比較、不分主次**。

```html
<main class="wrap duo">
  <section class="card">
    <h3>方案 A</h3>
    <!-- ... -->
  </section>
  <section class="card">
    <h3>方案 B</h3>
    <!-- ... -->
  </section>
</main>
```

```css
.duo {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px;
  padding-top: 32px; padding-bottom: 32px;
}
@media (max-width: 900px) { .duo { grid-template-columns: 1fr; } }
```

卡片標題沿用起手範本的 `.card h3`，不另寫 class。

---

## Dashboard / 卡片網格

**儀表板 / 多 stat / 多 card 並列**。

```html
<main class="wrap dash">

  <!-- 大標 -->
  <header class="dash-head">
    <h1 class="dash-title">Dashboard 標題</h1>
    <p class="dash-sub">副說明</p>
  </header>

  <!-- 主 metric 格線 -->
  <div class="stat-grid dash-row">
    <!-- stat cards × N -->
  </div>

  <!-- 中型 chart 並列 -->
  <div class="dash-charts dash-row">
    <div class="card"><!-- chart 1 --></div>
    <div class="card"><!-- chart 2 --></div>
  </div>

  <!-- 大表格 -->
  <div class="card"><!-- detail table --></div>

</main>
```

```css
.dash { padding-top: 32px; padding-bottom: 32px; }
.dash-head { margin-bottom: 32px; }
.dash-title { font-size: 24px; font-weight: 700; letter-spacing: -0.02em; margin: 0; }
.dash-sub { font-size: 14px; color: var(--text-soft); margin: 4px 0 0; }
.dash-row { margin-bottom: 32px; }
/* stat 格線：桌機四欄、900px 以下兩欄（component-library § Stat card 同一個 class） */
.stat-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.dash-charts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
@media (max-width: 900px) {
  .stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .dash-charts { grid-template-columns: 1fr; }
}
```

卡片內距用 `.card` 自帶的，不另加。

---

## 響應式原則

斷點跟起手範本一致：900px 與 640px。

| 螢幕寬度 | 行為 |
|---|---|
| 640px 以下（手機）| `.wrap` 左右邊距縮成 16px；`.kpis` 改一欄；stat 格線兩欄 |
| 900px 以下 | 側欄隱藏、主內容佔滿；兩欄並排的版面（`.duo`、`.dash-charts`）改一欄；stat 格線兩欄 |
| 900px 以上 | 側欄顯示、主版面完整；stat 格線四欄 |

```html
<!-- 響應式卡片格線：起手範本的 .cards，一張卡至少 280px，放不下就換行，手機一欄 -->
<div class="cards">
  <!-- ... -->
</div>

<!-- 響應式側欄：用 § 完整版的 .page-side／.page-main，900px 以下側欄隱藏 -->
<aside class="page-side"><!-- ... --></aside>
<main class="page-main"><!-- ... --></main>
```

---

## Padding / spacing 慣例

下表是起手範本實際用的值；新寫的 class 照這組數字。

| 容器層級 | padding |
|---|---|
| 頁面外層（`.wrap`）| 左右 32px（640px 以下 16px），上下依區段另加 |
| 卡片（`.card`）| 範本已帶 22px 24px（640px 以下左右 18px）|
| 次級卡（`.card-soft`）| 範本已帶 14px 16px |
| 內元件（`.choice` 等）| 8px 12px ～ 12px 16px |

| 區段間距 | gap |
|---|---|
| Header / Main / Footer 之間 | 48px |
| Section 之間 | 48px |
| 卡片之間（同 section）| 16–20px（`.cards` 是 16px）|
| Card 內元素 | 12–16px |

---

## 一個完整 base 模板的 layout 部分

見 `assets/base-template.html` — 已包含：
- 頁內樣式（不載入外部 CSS 框架）
- 配色 / 字體 token
- Header（sticky + 進度）
- Sidebar nav（自動高亮）
- Main grid
- Sticky footer bar
- Multi-format export 按鈕
- Local storage 自動保存
- 鍵盤快捷鍵

直接 copy 起手、再依需求增刪元件。
