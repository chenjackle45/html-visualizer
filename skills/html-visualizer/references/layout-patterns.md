# Layout 模式

> 容器寬度一律 `width: min(94vw, 1760px)`（`SKILL.md` 必含元素表）；本檔 snippet 已同步，`max-w-[900px]` 只用於單欄純閱讀頁的段落區。

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
  <header class="sticky top-0 z-20 bg-white border-b" style="border-color: var(--border);">
    <div class="max-w-[min(94vw,1760px)] mx-auto px-8 py-4 flex items-center justify-between">
      <div>
        <div class="text-[11px] uppercase tracking-widest font-semibold"
             style="color: var(--text-muted);">標題類別 · 日期</div>
        <h1 class="text-lg font-bold mt-0.5">主標題</h1>
      </div>
      <div class="flex items-center gap-4">
        <!-- 進度 / 互動指標 -->
        <span id="progress-summary"
              class="text-sm font-medium"
              style="color: var(--accent);">0 / 0</span>
      </div>
    </div>
  </header>

  <!-- Main grid -->
  <div class="max-w-[min(94vw,1760px)] mx-auto px-8 py-8">
    <div class="grid grid-cols-12 gap-8">

      <!-- Sidebar (lg+) -->
      <aside class="col-span-2 hidden lg:block">
        <div class="sticky top-24 space-y-1">
          <a href="#section-1" class="nav-link">區段 1</a>
          <a href="#section-2" class="nav-link">區段 2</a>
          <!-- ... -->
        </div>
      </aside>

      <!-- Main content -->
      <main class="col-span-12 lg:col-span-10 space-y-12">
        <section id="section-1"><!-- 內容 --></section>
        <section id="section-2"><!-- 內容 --></section>
      </main>

    </div>
  </div>

  <!-- Sticky bottom bar -->
  <footer class="sticky-bar mt-12">
    <div class="max-w-[min(94vw,1760px)] mx-auto px-8 py-5 flex items-center justify-between gap-6">
      <div>
        <div class="text-[11px] uppercase tracking-widest font-semibold"
             style="color: var(--text-muted);">提示文字</div>
        <div class="text-sm mt-0.5">主要 CTA 描述</div>
      </div>
      <div class="flex items-center gap-3">
        <!-- 主要按鈕 -->
        <button class="px-6 py-2.5 text-sm font-semibold text-white rounded-lg"
                style="background: var(--accent);">主要動作</button>
      </div>
    </div>
  </footer>
</body>
```

```css
.sticky-bar {
  position: sticky; bottom: 0;
  background: white;
  border-top: 2px solid var(--accent);
  box-shadow: 0 -8px 20px -8px rgba(0,0,0,0.08);
  backdrop-filter: blur(12px);
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
- `max-w-[min(94vw,1760px)]`：寬版容器（與 `SKILL.md` 必含元素表一致）；長段落另加 `max-w-[72ch]` 行長護欄
- `grid-cols-12 + gap-8`：sidebar (2) + main (10)
- Sidebar `hidden lg:block`：手機隱藏、桌機顯示
- `sticky top-0` 配 `z-20`：header 永遠可見
- `sticky bottom-0` 配 `z-10`：footer bar 永遠可見

---

## 標準版（Header + Main，無 sidebar）

**內容單純、不需 nav 跳轉**。例如：教學文件、單一 spec、簡短報告。

```html
<header class="sticky top-0 z-20 bg-white border-b" style="border-color: var(--border);">
  <div class="max-w-[min(94vw,1760px)] mx-auto px-6 py-4">
    <h1 class="text-lg font-bold">標題</h1>
  </div>
</header>

<main class="max-w-[min(94vw,1760px)] mx-auto px-6 py-8 space-y-10">
  <section><!-- 內容 --></section>
</main>
```

閱讀型內容容器仍吃滿寬，靠段落的 `max-w-[72ch]` 控制行長。

---

## Hero + 內容（單頁短文）

**極短內容、單頁可讀完**。例如：announcement、status update、簡短決策。

```html
<main class="max-w-[900px] mx-auto px-6 py-12">

  <!-- Hero -->
  <div class="card p-10 mb-8 text-center">
    <h1 class="text-3xl font-bold tracking-tight">主標題</h1>
    <p class="text-base mt-3" style="color: var(--text-muted);">副說明</p>
  </div>

  <!-- 內容 -->
  <div class="space-y-6">
    <section><!-- 內容 --></section>
  </div>

</main>
```

---

## 目錄式（TOC + 內容並排）

**長文 / 教學 / 研究報告**。左固定 TOC、右是內容、左捲右捲分開。

```html
<div class="max-w-[min(94vw,1760px)] mx-auto px-8 py-8">
  <div class="grid grid-cols-12 gap-12">

    <!-- TOC -->
    <aside class="col-span-3">
      <div class="sticky top-8">
        <div class="text-[10px] uppercase tracking-widest font-semibold mb-3"
             style="color: var(--text-soft);">目錄</div>
        <ol class="space-y-2 text-sm">
          <li><a href="#chapter-1" class="nav-link">1. 章節一</a></li>
          <li><a href="#chapter-2" class="nav-link">2. 章節二</a></li>
        </ol>
      </div>
    </aside>

    <!-- Content（更窄、更舒服閱讀）-->
    <article class="col-span-9 prose-content">
      <section id="chapter-1"><!-- 內容 --></section>
    </article>

  </div>
</div>

<style>
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
<main class="max-w-[min(94vw,1760px)] mx-auto px-8 py-8">
  <div class="grid grid-cols-12 gap-8">
    <section class="col-span-12 lg:col-span-6 card p-6">
      <h3 class="font-semibold mb-4">方案 A</h3>
      <!-- ... -->
    </section>
    <section class="col-span-12 lg:col-span-6 card p-6">
      <h3 class="font-semibold mb-4">方案 B</h3>
      <!-- ... -->
    </section>
  </div>
</main>
```

---

## Dashboard / 卡片網格

**儀表板 / 多 stat / 多 card 並列**。

```html
<main class="max-w-[min(94vw,1760px)] mx-auto px-8 py-8">

  <!-- 大標 -->
  <header class="mb-8">
    <h1 class="text-2xl font-bold tracking-tight">Dashboard 標題</h1>
    <p class="text-sm" style="color: var(--text-muted);">副說明</p>
  </header>

  <!-- 主 metric grid -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    <!-- stat cards × N -->
  </div>

  <!-- 中型 chart 並列 -->
  <div class="grid lg:grid-cols-2 gap-6 mb-8">
    <div class="card p-6"><!-- chart 1 --></div>
    <div class="card p-6"><!-- chart 2 --></div>
  </div>

  <!-- 大表格 -->
  <div class="card p-6"><!-- detail table --></div>

</main>
```

---

## 響應式原則

| 螢幕寬度 | 行為 |
|---|---|
| `< md` (< 768px) | 全部 single column、sidebar 隱藏、進度指標縮小 |
| `md` (768px+) | 2 column 元素啟用、stat grid `md:grid-cols-4` |
| `lg` (1024px+) | Sidebar 顯示、主 layout 完整 |
| `xl` (1280px+) | 接近 max-width、保留邊距 |

```html
<!-- 響應式 grid 範例 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- ... -->
</div>

<!-- 響應式 sidebar -->
<aside class="col-span-2 hidden lg:block"><!-- ... --></aside>
<main class="col-span-12 lg:col-span-10"><!-- ... --></main>
```

---

## Padding / spacing 慣例

| 容器層級 | padding |
|---|---|
| 頁面外層（`main`）| `px-8 py-8`（手機 `px-6 py-6`）|
| 卡片（`.card`）| `p-6`（密集時 `p-5`）|
| 次級卡（`.card-soft`）| `p-4` 或 `p-3` |
| 內元件（`.choice` 等）| `px-3 py-2` ~ `px-4 py-3` |

| 區段間距 | gap |
|---|---|
| Header / Main / Footer 之間 | `mt-12` 或 `space-y-12` |
| Section 之間 | `space-y-12` |
| 卡片之間（同 section）| `space-y-5` 或 `gap-4`/`gap-5` |
| Card 內元素 | `space-y-3` 或 `mt-3`/`mt-4` |

---

## 一個完整 base 模板的 layout 部分

見 `assets/base-template.html` — 已包含：
- Tailwind CDN
- 配色 / 字體 token
- Header（sticky + 進度）
- Sidebar nav（自動高亮）
- Main grid
- Sticky footer bar
- Multi-format export 按鈕
- Local storage 自動保存
- 鍵盤快捷鍵

直接 copy 起手、再依需求增刪元件。
