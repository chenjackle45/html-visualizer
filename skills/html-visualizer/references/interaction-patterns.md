# 互動模式

何時加互動、加哪些、怎麼實作。所有互動都純前端（vanilla JS、不引外部 lib 除 Tailwind CDN）、無需 server。

## 何時加互動

| 互動 | 何時加 |
|---|---|
| Radio / dropdown 選項 | 等使用者拍板的決策卡 |
| Slider / 參數調整 | 使用者要探索 trade-off 最佳值（例：cap 值、retry 次數）|
| Drag-to-prioritize | 多 item 重新排序（例：tickets / tech-debt 排優先級）|
| Inline comment | 每張卡 user 可留註解、export 時帶出 |
| Multi-format export | Markdown / commit message draft / prompt 一鍵複製 |
| Local storage | 防止填到一半關掉丟失進度 |
| 鍵盤快捷鍵 | 純鍵盤瀏覽 / 操作 |
| Sidebar nav 自動高亮 | 內容多時、捲動到哪段 sidebar 對應段高亮 |

## 不要加互動的場景

- 純展示文件（report / 教學 / 概念解釋）——不加 radio / slider / drag 這類「主動問」互動；**全頁評論 snippet 仍預設內建**（見 § 全頁評論系統）
- 內容少（< 3 個區段）
- 一次性閱讀後不會再看的東西

---

## Radio pills（基礎、最常用）

```css
.choice {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 14px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
  background: var(--bg-card);
  font-size: 14px;
}
.choice:hover { border-color: var(--border-strong); }
.choice input[type="radio"] { display: none; }
.choice .choice-dot {
  width: 16px; height: 16px;
  border-radius: 50%;
  border: 2px solid var(--border-strong);
  background: var(--bg-card);
  flex-shrink: 0;
  transition: all 0.15s;
}
.choice input:checked ~ .choice-dot {
  border-color: var(--accent);
  background: var(--accent);
  box-shadow: inset 0 0 0 3px var(--bg-card);
}
.choice:has(input:checked) {
  border-color: var(--accent);
  background: var(--accent-soft);
}

/* 警告類選項（推翻 / 拒絕）— 紅色高亮 */
.choice.choice-warning:has(input:checked) {
  border-color: var(--red);
  background: var(--red-soft);
}
.choice.choice-warning input:checked ~ .choice-dot {
  border-color: var(--red);
  background: var(--red);
}
```

```html
<div class="grid md:grid-cols-2 gap-3">
  <label class="choice">
    <input type="radio" name="example" value="A" checked>
    <span class="choice-dot"></span>
    <span><strong>選項 A</strong></span>
  </label>
  <label class="choice choice-warning">
    <input type="radio" name="example" value="B">
    <span class="choice-dot"></span>
    <span><strong>選項 B</strong></span>
  </label>
</div>
```

## Dropdown select（多選項時）

只給非拍板用途（篩選器、切換視角）。**拍板題一律 radio、禁用 `<select>`**（兩步操作 UX 差，`verify.py` 會判未過）。

```html
<select name="priority" class="w-full card-soft px-3 py-2 text-sm">
  <option value="延後（預設）" selected>⏳ 延後（預設）</option>
  <option value="立刻做">⚡ 立刻做</option>
  <option value="不做">✗ 不做</option>
</select>
```

CSS：複用 `.card-soft`（已含 background / border / radius）。

---

## Slider（參數微調）

**何時用**：使用者要探索某個數值的 trade-off（cap、retry budget、timeout）。即時更新對應視覺化（bar / chart）。

```html
<div class="card p-5">
  <div class="flex items-center justify-between mb-3">
    <label for="cap-slider" class="text-sm font-semibold">截短 cap 值</label>
    <output id="cap-output" class="text-sm font-mono font-bold" style="color: var(--accent);">60K</output>
  </div>
  <input type="range" id="cap-slider"
         min="10" max="200" step="10" value="60"
         class="w-full"
         oninput="updateCap(this.value)">
  <div class="flex justify-between text-[11px] mt-1" style="color: var(--text-muted);">
    <span>10K（激進省 token）</span>
    <span>200K（完整覆蓋）</span>
  </div>

  <!-- 即時更新的視覺化 -->
  <div class="mt-4 card-soft p-4">
    <div class="text-[11px] uppercase tracking-widest font-semibold mb-2"
         style="color: var(--text-muted);">影響估算</div>
    <div class="bar-row">
      <div class="text-xs">Token 成本</div>
      <div class="bar warm" id="cost-bar" style="width: 50%;">15.5K</div>
      <div class="text-xs text-right" id="cost-pct">50%</div>
    </div>
    <div class="bar-row">
      <div class="text-xs">會議覆蓋率</div>
      <div class="bar cool" id="coverage-bar" style="width: 95%;">95%</div>
      <div class="text-xs text-right" id="coverage-pct">2 小時</div>
    </div>
  </div>
</div>

<script>
function updateCap(val) {
  document.getElementById('cap-output').textContent = val + 'K';
  // token 成本 = val/200 * 100%
  const costPct = Math.round(val / 200 * 100);
  document.getElementById('cost-bar').style.width = costPct + '%';
  document.getElementById('cost-bar').textContent = (val * 0.26).toFixed(1) + 'K';
  document.getElementById('cost-pct').textContent = costPct + '%';
  // 覆蓋率（log curve 簡化）
  const coverage = Math.min(99, Math.round(60 + Math.log10(val) * 25));
  const hours = (val / 30).toFixed(1);
  document.getElementById('coverage-bar').style.width = coverage + '%';
  document.getElementById('coverage-bar').textContent = coverage + '%';
  document.getElementById('coverage-pct').textContent = hours + ' 小時';
}
</script>
```

設計重點：
- `<output>` element 即時顯示當前值、不用 alert
- min / max 兩端要有 label 解釋極端會發生什麼
- 視覺化即時更新（bar / chart）讓使用者「玩」trade-off
- 函式邏輯放底部、不污染 HTML

---

## Drag-to-prioritize（4 column）

**何時用**：多個 item 排優先級（tickets / tech-debt / features）。Now / Next / Later / Cut 四 column。

```html
<div class="grid grid-cols-4 gap-4 min-h-[300px]" id="kanban">
  <div class="card p-4 min-h-[200px]" data-column="now">
    <div class="font-semibold text-sm mb-3" style="color: var(--accent);">⚡ Now</div>
    <div class="space-y-2 droppable" data-col="now"></div>
  </div>
  <div class="card p-4 min-h-[200px]" data-column="next">
    <div class="font-semibold text-sm mb-3" style="color: var(--green);">📋 Next</div>
    <div class="space-y-2 droppable" data-col="next"></div>
  </div>
  <div class="card p-4 min-h-[200px]" data-column="later">
    <div class="font-semibold text-sm mb-3" style="color: var(--yellow);">⏳ Later</div>
    <div class="space-y-2 droppable" data-col="later"></div>
  </div>
  <div class="card p-4 min-h-[200px]" data-column="cut">
    <div class="font-semibold text-sm mb-3" style="color: var(--text-muted);">✗ Cut</div>
    <div class="space-y-2 droppable" data-col="cut"></div>
  </div>
</div>

<style>
.draggable-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 12px;
  cursor: move;
  font-size: 13px;
  transition: all 0.15s;
}
.draggable-card:hover { border-color: var(--accent); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.draggable-card.dragging { opacity: 0.4; }
.droppable.drag-over { background: var(--accent-soft); border-radius: 6px; }
</style>

<script>
// 初始項目
const items = [
  { id: 1, title: 'JSON Schema 自動生成', defaultCol: 'later' },
  { id: 2, title: '錯誤訊息字首抽常數', defaultCol: 'later' },
  // ...
];

items.forEach(item => {
  const card = document.createElement('div');
  card.className = 'draggable-card';
  card.draggable = true;
  card.dataset.id = item.id;
  card.textContent = item.title;
  card.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', item.id);
    card.classList.add('dragging');
  });
  card.addEventListener('dragend', () => card.classList.remove('dragging'));
  document.querySelector(`[data-col="${item.defaultCol}"]`).appendChild(card);
});

document.querySelectorAll('.droppable').forEach(zone => {
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const card = document.querySelector(`.draggable-card[data-id="${id}"]`);
    zone.appendChild(card);
    zone.classList.remove('drag-over');
    saveState();
  });
});

function getState() {
  const state = {};
  document.querySelectorAll('[data-col]').forEach(col => {
    state[col.dataset.col] = [...col.querySelectorAll('.draggable-card')].map(c => c.dataset.id);
  });
  return state;
}
function saveState() { localStorage.setItem('kanban', JSON.stringify(getState())); }
</script>
```

---

## Inline comment per section（💬 圖示）

**何時用**：每張決策卡 / section 讓使用者留註解、export 時帶出。

> ⚠️ 下面這段「每卡 💬 切換註解」是舊模式，只給**非拍板**卡片選用；拍板題的補充框一律固定可見（見 § Radio 就地拍板），全頁任意處留言用 § 全頁評論系統。

```html
<div class="card p-6 relative" data-decision-id="d-1">
  <button class="comment-toggle absolute top-4 right-4"
          onclick="toggleComment('d-1')"
          title="留註解">💬</button>
  <h3>標題</h3>
  <!-- 內容 -->

  <div id="comment-d-1" class="hidden mt-4">
    <textarea class="w-full card-soft px-3 py-2 text-sm"
              placeholder="留下你的想法 / 疑問 / 補充..."
              rows="3"
              oninput="saveComment('d-1', this.value)"></textarea>
  </div>
</div>

<style>
.comment-toggle {
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: 50%;
  width: 32px; height: 32px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;
}
.comment-toggle:hover { background: var(--accent-soft); border-color: var(--accent); }
.comment-toggle.has-comment { background: var(--yellow-soft); border-color: var(--yellow); }
</style>

<script>
function toggleComment(id) {
  document.getElementById('comment-' + id).classList.toggle('hidden');
}
function saveComment(id, val) {
  const stored = JSON.parse(localStorage.getItem('comments') || '{}');
  stored[id] = val;
  localStorage.setItem('comments', JSON.stringify(stored));
  // 標記有 comment 的卡
  const btn = document.querySelector(`[data-decision-id="${id}"] .comment-toggle`);
  btn.classList.toggle('has-comment', !!val.trim());
}
// 載入既有 comment
const stored = JSON.parse(localStorage.getItem('comments') || '{}');
Object.entries(stored).forEach(([id, val]) => {
  const ta = document.querySelector(`#comment-${id} textarea`);
  if (ta) { ta.value = val; document.getElementById('comment-' + id).classList.remove('hidden'); }
  const btn = document.querySelector(`[data-decision-id="${id}"] .comment-toggle`);
  if (btn && val.trim()) btn.classList.add('has-comment');
});
</script>
```

---

## Multi-format export（複製按鈕）

**何時用**：表單填完後、export 給 Claude 用 / commit message / 純 markdown summary。

```html
<div class="flex items-center gap-3">
  <button id="copy-md" class="px-4 py-2 text-sm card-soft">📋 複製 Markdown</button>
  <button id="copy-commit" class="px-4 py-2 text-sm card-soft">📝 複製 Commit Messages</button>
  <button id="copy-prompt" class="px-5 py-2 text-sm font-semibold text-white rounded-lg"
          style="background: var(--accent);">🤖 複製給 Claude 的 Prompt</button>
</div>

<script>
function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.innerHTML;
    btn.innerHTML = '✅ 已複製！';
    setTimeout(() => btn.innerHTML = orig, 2000);
  }).catch(() => {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    btn.innerHTML = '✅ 已複製！';
  });
}

document.getElementById('copy-md').onclick = function() {
  copyToClipboard(buildMarkdownSummary(), this);
};
document.getElementById('copy-commit').onclick = function() {
  copyToClipboard(buildCommitMessages(), this);
};
document.getElementById('copy-prompt').onclick = function() {
  copyToClipboard(buildClaudePrompt(), this);
};

function buildMarkdownSummary() {
  // 拉所有 form 值組成 markdown
  return '...';
}
function buildCommitMessages() {
  // 組 conventional commit message draft
  return 'feat(...): ...\n\nbody\n\n---\n\nchore(...): ...';
}
function buildClaudePrompt() {
  // 組「我已決定如下、請執行」prompt
  return '我已完成決策追認，請按以下執行：\n...';
}
</script>
```

設計重點：
- 三個按鈕分開、各有 use case
- `navigator.clipboard.writeText` + fallback execCommand
- 按鈕視覺回饋（已複製）2 秒後復原
- 主要 export（送給 Claude 的 prompt）用 accent 色按鈕、其他次要

---

## Local storage（自動保存進度）

**何時用**：表單長、使用者可能切走再回來。

```html
<script>
// 自動保存所有 input / textarea / select 值
function saveState() {
  const state = {};
  document.querySelectorAll('input[type="radio"]:checked, input[type="text"], textarea, select').forEach(el => {
    if (el.type === 'radio' && el.checked) state[el.name] = el.value;
    else if (el.type !== 'radio') state[el.name || el.id] = el.value;
  });
  localStorage.setItem('html-visualizer-state-' + window.location.pathname, JSON.stringify(state));
}

function loadState() {
  const stored = JSON.parse(localStorage.getItem('html-visualizer-state-' + window.location.pathname) || '{}');
  Object.entries(stored).forEach(([key, val]) => {
    const radio = document.querySelector(`input[type="radio"][name="${key}"][value="${val}"]`);
    if (radio) { radio.checked = true; return; }
    const el = document.querySelector(`[name="${key}"], #${key}`);
    if (el) el.value = val;
  });
}

document.addEventListener('change', saveState);
document.addEventListener('input', saveState);
window.addEventListener('load', loadState);
</script>
```

---

## 鍵盤快捷鍵

```html
<script>
document.addEventListener('keydown', e => {
  // 忽略在 input / textarea 內按
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

  // j / k 上下捲動 section
  if (e.key === 'j' || e.key === 'k') {
    e.preventDefault();
    const sections = [...document.querySelectorAll('section[id]')];
    const current = sections.findIndex(s => s.getBoundingClientRect().top > -100);
    const next = e.key === 'j'
      ? sections[Math.min(current + 1, sections.length - 1)]
      : sections[Math.max(current - 1, 0)];
    next?.scrollIntoView({ behavior: 'smooth' });
  }

  // ? 顯示說明
  if (e.key === '?' && e.shiftKey) {
    document.getElementById('shortcuts-overlay').classList.toggle('hidden');
  }

  // cmd+enter 觸發主要按鈕
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    document.getElementById('copy-prompt')?.click();
  }
});
</script>

<!-- 說明 overlay（按 ? 打開）-->
<div id="shortcuts-overlay"
     class="hidden fixed inset-0 z-50 flex items-center justify-center"
     style="background: rgba(0,0,0,0.5);"
     onclick="this.classList.add('hidden')">
  <div class="card p-6 max-w-md" onclick="event.stopPropagation()">
    <h3 class="text-lg font-bold mb-4">鍵盤快捷鍵</h3>
    <table class="text-sm w-full">
      <tr><td class="py-1.5"><kbd>j</kbd> / <kbd>k</kbd></td><td>上下 section</td></tr>
      <tr><td><kbd>?</kbd></td><td>本說明</td></tr>
      <tr><td><kbd>⌘</kbd> + <kbd>Enter</kbd></td><td>複製主要 prompt</td></tr>
      <tr><td><kbd>Esc</kbd></td><td>關閉本說明</td></tr>
    </table>
  </div>
</div>
```

---

## Sidebar nav 自動高亮

**何時用**：左側 sticky nav、捲動到對應 section 時 nav 對應項高亮。

```html
<aside class="col-span-2">
  <div class="sticky top-24 space-y-1">
    <a href="#section-a" class="nav-link">A · 自主決策</a>
    <a href="#section-b" class="nav-link">B · 流程優化</a>
  </div>
</aside>

<style>
.nav-link {
  display: flex; gap: 10px; padding: 8px 12px;
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
</style>

<script>
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.toggle('active',
        l.getAttribute('href') === `#${entry.target.id}`));
    }
  });
}, { rootMargin: '-30% 0px -60% 0px' });
sections.forEach(s => observer.observe(s));
</script>
```

---

## 隱藏 textarea（選了特定選項才展開）

**何時用**：選「推翻」/「自訂」時要 user 補充說明、預設選項不需要。保持卡片精簡。

```html
<div data-decision data-id="d-2">
  <div class="choice-row">
    <label class="choice"><input type="radio" name="d-2" value="保留" checked><span class="choice-dot"></span><span>保留</span></label>
    <label class="choice choice-warning"><input type="radio" name="d-2" value="推翻"><span class="choice-dot"></span><span>推翻</span></label>
    <label class="choice"><input type="radio" name="d-2" value="自訂"><span class="choice-dot"></span><span>自訂</span></label>
  </div>
  <textarea data-comment-for="d-2"
            class="mt-3 w-full card-soft px-3 py-2 text-sm"
            placeholder="補充說明..." rows="2"></textarea>
</div>
```

補充框**固定可見**、不隨選項切換 `hidden`（使用者偏好：補充欄位永遠在；`verify.py` 會查每題都有補充框）。builder 用 `getComment(id)` 抓它的值拼進摘要。

---

## 互動進度計數

**何時用**：表單長、讓 user 知道還有多少未填。

```html
<header>
  <span id="progress-summary" style="color: var(--accent);">0 / 0</span>
  <span style="color: var(--text-muted);">已選</span>
</header>

<script>
function updateProgress() {
  const decisions = document.querySelectorAll('[data-decision]');
  let answered = 0;
  decisions.forEach(d => {
    const id = d.dataset.id.toLowerCase();
    const radio = d.querySelector(`input[type="radio"][name="${id}"]:checked`);
    const select = d.querySelector(`select[name="${id}"]`);
    if (radio || select) answered++;
  });
  document.getElementById('progress-summary').textContent = `${answered} / ${decisions.length}`;
}
document.querySelectorAll('input[type="radio"], select').forEach(el =>
  el.addEventListener('change', updateProgress));
updateProgress();
</script>
```

---

## ⭐ 全頁評論系統（page-wide commenting，預設內建）

**何時用**：每份產出都內建（`base-template` 已含；`examples/` 各範本依用途擇一內建）。AI 用 radio「主動問」、user 用全頁評論「主動提」、兩者並存。

**核心設計（極簡）**：

| 維度 | 決定 |
|---|---|
| 觸發 | 選取後浮現小 icon、點 icon 才彈窗（不打斷閱讀）|
| 評論框 | 浮動 popup 跟隨選取位置 |
| 高亮 | oat 色 mark wrap 選取段 |
| 管理 UI | **右下浮動小 pill `💬 N`、點開展開列表**（無 sticky bar、不擠版面）|
| 持久化 | localStorage（key 含 pathname）|
| 複製出口 | **只有一個** — 既有範本複製按鈕末尾拼接 `window.vtCollectComments()`、無重複按鈕 |

**整合介面（唯一 API）**：

```javascript
window.vtCollectComments()  // 回傳 "\n\n---\n\n@評論「原文」→ 評論..." 或 ""
```

⭐ **整合規約（hard rule、SKILL.md §「必含元素」對應第 ⭐⭐ 條）**：

⚠️ **vt-comment snippet 嚴禁「精簡版」省掉 `window.vtCollectComments` API**：snippet 本體可以縮短變數名（`c / sel / pi`）、可以一行化 IIFE，但**必須在 IIFE 內顯式賦值 `window.vtCollectComments = function () { ... }`**。少這個 API = builder 末尾 `window.vtCollectComments?.()` 永遠 `undefined` 短路 = 全頁評論永遠拼不進去、user 留的評論白填、且因 optional chain 完全無錯誤訊息（silent fail、極難 debug）。寫完必 grep `window\.vtCollectComments\s*=` 必命中 1 次。

範本內所有「複製拍板摘要 / 複製給 AI / 複製決策摘要 / 複製給 agent」類按鈕背後的 builder 必須三件事一起做、不可只做其中一兩件：

```javascript
function buildClaudePrompt() {
  const lines = [/* ... 收 radio + select + 每條 finding 旁的 textarea 補充框 ... */];

  // ① 每個 radio / select 拍板題必須配旁邊 textarea、builder 用 getComment(id) 抓取拼行
  // 例：lines.push(`- 題目 X：${getValue("x")}${getComment("x")}`);

  // ② 末尾必須拼全頁評論（vt-comment 選文字 popup 留的內容）
  return lines.join('\n') + (window.vtCollectComments?.() || '');
}

// ③ 必須註冊、隱藏 vt-comment pill 列表底部的 fallback 重複按鈕
window.vtBuildDecisionExport = buildClaudePrompt;
```

少做任一項 = user 留的意見會漏掉一部分（漏 textarea 補充框、或漏選文字評論、或多出重複按鈕造成複製來源不一致）。沒有「現在沒空 / 之後補」例外。

完整參照實作：`references/examples/marathon-decision-sheet/index.html`，搜 `function buildSummary`（含 `getComment` 與末尾拼接 `vtCollectComments`）、`window.vtBuildDecisionExport =`、`window.vtCollectComments =` 三處。行號會漂、以函式名為準。

對沒有既有複製按鈕的範本（base-template / anthropic-gallery），snippet 內 pill 列表底部自帶一個 fallback 複製按鈕、不重複。

**命名空間**：CSS class `vt-` 前綴、localStorage key `vt-comments-${pathname}`、全域函式 `window.vtCollectComments`。

**Self-contained snippet（複製整段進範本 `</body>` 前）**：

```html
<!-- ═══════════════════════════════════════════════════════ -->
<!-- 全頁評論系統（vt-comment-* 命名空間，不要修改）            -->
<!-- ═══════════════════════════════════════════════════════ -->
<style>
  .vt-comment-trigger {
    position: fixed; z-index: 9998;
    background: var(--paper);
    border: 1.5px solid var(--clay);
    border-radius: 999px;
    padding: 6px 12px;
    font-size: 12px;
    color: var(--clay);
    font-family: var(--mono);
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(20, 20, 19, 0.12);
    display: none;
    align-items: center;
    gap: 6px;
    transition: all 0.15s;
  }
  .vt-comment-trigger:hover { background: var(--clay); color: var(--paper); }

  .vt-comment-popup {
    position: fixed; z-index: 9999;
    background: var(--paper);
    border: 1.5px solid var(--g300);
    border-radius: 12px;
    box-shadow: 0 12px 32px rgba(20, 20, 19, 0.15);
    padding: 14px 16px;
    width: 340px;
    display: none;
  }
  .vt-comment-popup .quote {
    background: var(--g100);
    border-left: 3px solid var(--clay);
    padding: 8px 10px;
    font-size: 12.5px;
    color: var(--g700);
    line-height: 1.45;
    margin-bottom: 10px;
    max-height: 80px;
    overflow-y: auto;
  }
  .vt-comment-popup textarea {
    width: 100%;
    border: 1.5px solid var(--g300);
    border-radius: 8px;
    padding: 8px 10px;
    font-size: 13px;
    font-family: var(--sans);
    resize: vertical;
    min-height: 60px;
    color: var(--slate);
    box-sizing: border-box;
  }
  .vt-comment-popup textarea:focus { outline: none; border-color: var(--clay); }
  .vt-comment-popup .actions {
    display: flex; justify-content: space-between; align-items: center;
    margin-top: 10px; font-size: 11.5px;
  }
  .vt-comment-popup .hint { color: var(--g500); font-family: var(--mono); }
  .vt-comment-popup button.send {
    background: var(--clay); color: var(--paper);
    border: none; border-radius: 8px;
    padding: 6px 14px; font-size: 12.5px;
    font-weight: 600; cursor: pointer;
  }
  .vt-comment-popup button.send:hover { background: var(--clay-d); }
  .vt-comment-popup button.cancel {
    background: transparent; border: 1px solid var(--g300);
    color: var(--g500); border-radius: 8px;
    padding: 6px 12px; font-size: 12.5px;
    cursor: pointer; margin-right: 8px;
  }

  mark.vt-comment-mark {
    background: var(--oat);
    padding: 0 2px;
    border-radius: 2px;
    cursor: pointer;
  }
  mark.vt-comment-mark:hover { background: #d5c4a8; }

  /* 右下浮動小 pill — 唯一持續顯示的管理 UI */
  .vt-comment-pill {
    position: fixed;
    right: 16px;
    bottom: 16px;
    z-index: 9990;
    background: var(--paper);
    border: 1.5px solid var(--clay);
    border-radius: 999px;
    padding: 8px 14px;
    font-family: var(--mono);
    font-size: 12px;
    color: var(--clay);
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(20, 20, 19, 0.10);
    display: none;
    align-items: center;
    gap: 6px;
    transition: all 0.15s;
  }
  .vt-comment-pill.is-active { display: inline-flex; }
  .vt-comment-pill:hover { background: var(--clay); color: var(--paper); }
  .vt-comment-pill strong { font-weight: 600; }

  /* 列表 — 從 pill 上方展開 */
  .vt-comment-list {
    position: fixed;
    right: 16px;
    bottom: 60px;
    width: 360px;
    max-height: 60vh;
    z-index: 9991;
    background: var(--paper);
    border: 1.5px solid var(--g300);
    border-radius: 14px;
    box-shadow: 0 12px 32px rgba(20, 20, 19, 0.15);
    display: none;
    flex-direction: column;
  }
  .vt-comment-list.is-open { display: flex; }
  .vt-comment-list-header {
    background: var(--paper);
    border-bottom: 1.5px solid var(--g200);
    padding: 12px 16px;
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--g500);
    font-weight: 600;
    border-radius: 14px 14px 0 0;
  }
  .vt-comment-list-items {
    overflow-y: auto;
    flex: 1;
  }
  .vt-comment-item { padding: 12px 16px; border-bottom: 1px solid var(--g200); }
  .vt-comment-item:last-child { border-bottom: none; }
  .vt-comment-item .item-quote {
    font-size: 11.5px;
    color: var(--g500);
    font-style: italic;
    border-left: 2px solid var(--oat);
    padding-left: 8px;
    line-height: 1.4;
    margin-bottom: 6px;
  }
  .vt-comment-item .item-body { font-size: 13px; color: var(--slate); line-height: 1.5; }
  .vt-comment-item .item-del {
    font-size: 11px; color: var(--g500);
    background: none; border: none;
    cursor: pointer; margin-top: 4px;
    padding: 0; font-family: inherit;
  }
  .vt-comment-item .item-del:hover { color: var(--red); }
  .vt-comment-list-footer {
    border-top: 1.5px solid var(--g200);
    padding: 10px 16px;
    display: flex;
    justify-content: space-between;
    gap: 8px;
    border-radius: 0 0 14px 14px;
    background: var(--g100);
  }
  .vt-comment-list-footer button {
    background: transparent;
    border: 1.5px solid var(--g300);
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 12px;
    color: var(--g700);
    cursor: pointer;
    font-family: inherit;
  }
  .vt-comment-list-footer button:hover { border-color: var(--slate); color: var(--slate); }
  .vt-comment-list-footer button.copy {
    background: var(--clay); color: var(--paper);
    border-color: var(--clay);
  }
  .vt-comment-list-footer button.copy:hover { background: var(--clay-d); }
  /* 範本若有 window.vtBuildDecisionExport、隱藏 fallback 複製按鈕 */
  body.vt-has-existing-export .vt-comment-list-footer button.copy { display: none; }
</style>

<button class="vt-comment-trigger" id="vt-comment-trigger">💬 評論</button>

<div class="vt-comment-popup" id="vt-comment-popup">
  <div class="quote" id="vt-popup-quote"></div>
  <textarea id="vt-popup-textarea" placeholder="對這段文字的評論 / 疑問 / 補充..."></textarea>
  <div class="actions">
    <span class="hint">⌘ + Enter 送出 · Esc 取消</span>
    <div>
      <button class="cancel" id="vt-popup-cancel">取消</button>
      <button class="send" id="vt-popup-send">送出</button>
    </div>
  </div>
</div>

<button class="vt-comment-pill" id="vt-comment-pill">💬 <strong id="vt-count">0</strong></button>

<div class="vt-comment-list" id="vt-comment-list">
  <div class="vt-comment-list-header">— 我的評論</div>
  <div class="vt-comment-list-items" id="vt-comment-list-items"></div>
  <div class="vt-comment-list-footer">
    <button id="vt-clear-all">全部清除</button>
    <button class="copy" id="vt-copy-fallback">📋 複製評論</button>
  </div>
</div>

<script>
(function () {
  const STORAGE_KEY = 'vt-comments-' + window.location.pathname;
  const MAX_QUOTE_LEN = 80;

  let comments = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  let currentSelection = null;

  const $ = (id) => document.getElementById(id);
  const trigger = $('vt-comment-trigger');
  const popup = $('vt-comment-popup');
  const popupQuote = $('vt-popup-quote');
  const popupTextarea = $('vt-popup-textarea');
  const pill = $('vt-comment-pill');
  const countEl = $('vt-count');
  const listEl = $('vt-comment-list');
  const listItemsEl = $('vt-comment-list-items');

  // 全域 API：給範本既有複製 builder 拼接用
  window.vtCollectComments = function () {
    if (comments.length === 0) return '';
    const body = comments.map(c => {
      const q = c.quote.length > MAX_QUOTE_LEN ? c.quote.slice(0, MAX_QUOTE_LEN) + '…' : c.quote;
      return `@評論「${q}」\n  → ${c.body}`;
    }).join('\n\n');
    return '\n\n---\n\n' + body;
  };

  document.addEventListener('mouseup', handleSelection);
  document.addEventListener('touchend', handleSelection);

  function handleSelection(e) {
    if (e.target.closest('.vt-comment-popup, .vt-comment-trigger, .vt-comment-pill, .vt-comment-list')) return;
    setTimeout(() => {
      const sel = window.getSelection();
      const text = sel.toString().trim();
      if (!text || text.length < 2) { trigger.style.display = 'none'; return; }
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      currentSelection = { text, range: range.cloneRange() };
      trigger.style.display = 'inline-flex';
      trigger.style.top = Math.max(8, rect.top - 38) + 'px';
      trigger.style.left = Math.max(8, rect.left + rect.width / 2 - 40) + 'px';
    }, 10);
  }

  trigger.addEventListener('click', openPopup);

  function openPopup() {
    if (!currentSelection) return;
    const quote = currentSelection.text.length > MAX_QUOTE_LEN
      ? currentSelection.text.slice(0, MAX_QUOTE_LEN) + '…'
      : currentSelection.text;
    popupQuote.textContent = quote;
    popupTextarea.value = '';
    const tr = trigger.getBoundingClientRect();
    const popupW = 340;
    let left = tr.left;
    if (left + popupW > window.innerWidth - 16) left = window.innerWidth - popupW - 16;
    let top = tr.bottom + 6;
    if (top + 220 > window.innerHeight) top = tr.top - 230;
    popup.style.left = Math.max(8, left) + 'px';
    popup.style.top = Math.max(8, top) + 'px';
    trigger.style.display = 'none';
    popup.style.display = 'block';
    setTimeout(() => popupTextarea.focus(), 50);
  }

  $('vt-popup-cancel').addEventListener('click', closePopup);
  $('vt-popup-send').addEventListener('click', saveComment);
  popupTextarea.addEventListener('keydown', (e) => {
    if (e.isComposing || e.keyCode === 229) return;  // IME guard
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      e.stopPropagation();
      saveComment();
    }
    if (e.key === 'Escape') closePopup();
  });

  function closePopup() { popup.style.display = 'none'; currentSelection = null; }

  function saveComment() {
    const body = popupTextarea.value.trim();
    if (!body || !currentSelection) return closePopup();
    const id = 'c-' + Date.now();
    const quote = currentSelection.text;
    try {
      const mark = document.createElement('mark');
      mark.className = 'vt-comment-mark';
      mark.dataset.commentId = id;
      currentSelection.range.surroundContents(mark);
    } catch (err) {
      // 跨 element 選取無法 wrap、評論還是存、只是不 highlight
    }
    comments.push({ id, quote, body, ts: Date.now() });
    persist(); render(); closePopup();
    window.getSelection().removeAllRanges();
  }

  function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(comments)); }

  function render() {
    countEl.textContent = comments.length;
    pill.classList.toggle('is-active', comments.length > 0);
    if (comments.length === 0) listEl.classList.remove('is-open');
    listItemsEl.innerHTML = comments.map(c => {
      const qs = c.quote.length > 60 ? c.quote.slice(0, 60) + '…' : c.quote;
      return `<div class="vt-comment-item" data-id="${c.id}">
        <div class="item-quote">「${escapeHtml(qs)}」</div>
        <div class="item-body">${escapeHtml(c.body)}</div>
        <button class="item-del" data-del="${c.id}">刪除</button>
      </div>`;
    }).join('');
    listItemsEl.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', () => deleteComment(btn.dataset.del));
    });
  }

  function deleteComment(id) {
    comments = comments.filter(c => c.id !== id);
    document.querySelectorAll(`mark.vt-comment-mark[data-comment-id="${id}"]`).forEach(m => {
      const parent = m.parentNode;
      while (m.firstChild) parent.insertBefore(m.firstChild, m);
      parent.removeChild(m); parent.normalize();
    });
    persist(); render();
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
  }

  pill.addEventListener('click', () => listEl.classList.toggle('is-open'));

  $('vt-clear-all').addEventListener('click', () => {
    if (comments.length === 0) return;
    if (!confirm('確定清除全部 ' + comments.length + ' 條評論？')) return;
    document.querySelectorAll('mark.vt-comment-mark').forEach(m => {
      const parent = m.parentNode;
      while (m.firstChild) parent.insertBefore(m.firstChild, m);
      parent.removeChild(m); parent.normalize();
    });
    comments = []; persist(); render();
  });

  // Fallback 複製按鈕（範本無既有複製機制時）
  $('vt-copy-fallback').addEventListener('click', () => {
    if (comments.length === 0) return;
    const text = window.vtCollectComments().replace(/^\n\n---\n\n/, '');
    const btn = $('vt-copy-fallback');
    const orig = btn.textContent;
    const done = () => { btn.textContent = '✅ 已複製'; setTimeout(() => btn.textContent = orig, 2000); };
    navigator.clipboard.writeText(text).then(done).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta);
      ta.select(); document.execCommand('copy'); ta.remove(); done();
    });
  });

  // 偵測範本既有複製機制、隱藏 fallback 複製按鈕
  setTimeout(() => {
    if (typeof window.vtBuildDecisionExport === 'function') {
      document.body.classList.add('vt-has-existing-export');
    }
  }, 100);

  document.addEventListener('click', (e) => {
    if (popup.style.display === 'block' &&
        !e.target.closest('.vt-comment-popup, .vt-comment-trigger')) closePopup();
  });

  render();
})();
</script>
```

---

## ⭐ 漸進揭露（想深入才展開）

**何時用**：純展示 / 教學 / 解釋型的長文件。解決的是決策簿那個動線病在展示型內容上的等價版本——**兩種深度的讀者被壓成同一條線**：想快速掌握的人嫌長、想追細節的人嫌淺。

主線只留「所有人都該知道的」，深入細節收進可展開區。零 JS，`<details>` 原生支援，列印時瀏覽器也會自動展開。

**三條規則**：

1. **摘要行必須能獨立成立**——讀者要能從摘要判斷「這段值不值得展開」。寫「更多」「詳細說明」等於沒寫
2. **關鍵資訊不准收進來**。收合區放的是原理、邊界案例、推導過程、延伸閱讀；主線讀完就該能用
3. **預設收合**。若某段你覺得非展開不可，那它就不該放在收合區

```css
.reveal {
  border: 1.5px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  margin-top: 12px;
  overflow: hidden;
}
.reveal > summary {
  cursor: pointer;
  padding: 12px 16px;
  font-size: 13.5px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 10px;
  list-style: none;
  transition: background 0.15s;
}
.reveal > summary::-webkit-details-marker {
  display: none;
}
.reveal > summary::before {
  content: "▸";
  color: var(--clay);
  font-size: 11px;
  transition: transform 0.18s;
  flex-shrink: 0;
}
.reveal[open] > summary::before {
  transform: rotate(90deg);
}
.reveal > summary:hover {
  background: var(--bg-soft);
  color: var(--text);
}
.reveal > summary .tag {
  margin-left: auto;
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-soft);
}
.reveal-body {
  padding: 4px 18px 18px;
  font-size: 13.5px;
  line-height: 1.7;
  color: var(--text-muted);
  border-top: 1px dashed var(--border);
}
```

```html
<details class="reveal">
  <summary>
    為什麼換發憑證不能也放在記憶體裡就好<span class="tag">原理</span>
  </summary>
  <div class="reveal-body">
    放記憶體的東西關掉分頁就沒了，等於每次重開都要重新登入……
  </div>
</details>
```

**放在哪**：概念解釋型骨架的最後一段（「想更深入」），或某一段落內部（該段主線講完，細節就地收合）。兩種都對，依細節與主線的距離決定——距離遠的收到文末、緊貼某段的就地收合。

## 互動哲學

- **純 vanilla**：不用 framework、不用 npm install、純 CDN
- **本地優先**：所有狀態 localStorage、不打 server
- **export 是終點**：互動完最後總要把 state 倒回 prompt 給 Claude
- **不要過度設計**：互動是工具、不是炫技。文章 Thariq 警告「don't make it a product, throwaway purpose-built」
- **單一複製出口**：全頁評論不另設複製按鈕、合進範本既有的 export builder
