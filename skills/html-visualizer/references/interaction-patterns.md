# 互動模式

何時加互動、加哪些、怎麼實作。所有互動都純前端（vanilla JS、不載入外部 CSS 框架，樣式寫在頁內）、無需 server。

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
/* 原生圓點視覺隱藏、但留在 Tab 順序裡。不要用 display:none／visibility:hidden：
   鍵盤選不到，版面健檢會擋（2026-10-27 評審實測 Tab 150 次焦點不落在任何選項） */
.choice { position: relative; }
/* inset:0 蓋滿整張 label：只有 1px 時，文字換成兩三行的高選項，Tab 過去邊緣會被固定列蓋住 2–4px */
.choice input[type="radio"] {
  position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; margin: 0; pointer-events: none;
}
.choice:has(input:focus-visible) { outline: 3px solid var(--clay-d); outline-offset: 2px; }
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

不預設勾選：推薦項標 `data-recommended`＋「推薦」膠囊，讀者自己點才算拍板。完整的一題（樣張、選項、補充框、回傳列進度）見 `assets/base-template.html` 的 `.decide` 卡。

```html
<div class="choice-row">
  <label class="choice" data-recommended>
    <input type="radio" name="example" value="A">
    <span class="choice-dot"></span>
    <span><strong>選項 A</strong></span><span class="rec">推薦</span>
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
<select name="priority" class="card-soft field">
  <option value="延後（預設）" selected>延後（預設）</option>
  <option value="立刻做">立刻做</option>
  <option value="不做">不做</option>
</select>
```

CSS：底色與圓角沿用起手範本的 `.card-soft`，`.field` 補寬度與欄位內距（留言框的 textarea 也用它）：

```css
.field { width: 100%; padding: 8px 12px; font-size: 14px; }
```

---

## Slider（參數微調）

**何時用**：使用者要探索某個數值的 trade-off（cap、retry budget、timeout）。即時更新對應視覺化（bar / chart）。

```html
<div class="card slider-card">
  <div class="slider-head">
    <label for="cap-slider" class="slider-label">截短 cap 值</label>
    <output id="cap-output" class="slider-value">60K</output>
  </div>
  <input type="range" id="cap-slider"
         min="10" max="200" step="10" value="60"
         class="slider-input"
         oninput="updateCap(this.value)">
  <div class="slider-scale">
    <span>10K（激進省 token）</span>
    <span>200K（完整覆蓋）</span>
  </div>

  <!-- 即時更新的視覺化 -->
  <div class="card-soft slider-impact">
    <div class="mini-label">影響估算</div>
    <div class="meter-row">
      <div class="meter-label">Token 成本</div>
      <div class="meter warm" id="cost-bar" style="width: 50%;">15.5K</div>
      <div class="meter-end" id="cost-pct">50%</div>
    </div>
    <div class="meter-row">
      <div class="meter-label">會議覆蓋率</div>
      <div class="meter cool" id="coverage-bar" style="width: 95%;">95%</div>
      <div class="meter-end" id="coverage-pct">2 小時</div>
    </div>
  </div>
</div>

<style>
.slider-card { padding: 20px; }
.slider-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.slider-label { font-size: 14px; font-weight: 600; }
.slider-value { font-family: var(--mono); font-size: 14px; font-weight: 700; color: var(--clay-ink); }
.slider-input { width: 100%; }
.slider-scale { display: flex; justify-content: space-between; gap: 12px; margin-top: 4px; font-size: 12px; color: var(--text-muted); }
.slider-impact { margin-top: 16px; }
.mini-label { font-size: 12px; font-weight: 600; letter-spacing: 0.1em; color: var(--text-soft); }
.slider-impact .mini-label { margin-bottom: 8px; }
/* .meter-row／.meter／.meter-label／.meter-end 照抄 component-library § Bar comparison */
</style>

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
<div class="kanban" id="kanban">
  <div class="card kanban-col" data-column="now">
    <div class="kanban-head" style="color: var(--clay-ink);"><svg class="ic" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;vertical-align:-0.125em"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg> Now</div>
    <div class="droppable" data-col="now"></div>
  </div>
  <div class="card kanban-col" data-column="next">
    <div class="kanban-head" style="color: var(--green);"><svg class="ic" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;vertical-align:-0.125em"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg> Next</div>
    <div class="droppable" data-col="next"></div>
  </div>
  <div class="card kanban-col" data-column="later">
    <div class="kanban-head" style="color: var(--yellow);"><svg class="ic" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;vertical-align:-0.125em"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg> Later</div>
    <div class="droppable" data-col="later"></div>
  </div>
  <div class="card kanban-col" data-column="cut">
    <div class="kanban-head" style="color: var(--text-muted);"><svg class="ic" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;vertical-align:-0.125em"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg> Cut</div>
    <div class="droppable" data-col="cut"></div>
  </div>
</div>

<style>
.kanban { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; min-height: 300px; }
.kanban-col { padding: 16px; min-height: 200px; }
.kanban-head { font-size: 14px; font-weight: 600; margin-bottom: 12px; }
.droppable { display: grid; gap: 8px; align-content: start; }
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
<div class="card comment-card" data-decision-id="d-1">
  <button class="comment-toggle"
          onclick="toggleComment('d-1')"
          title="留註解">💬</button>
  <h3>標題</h3>
  <!-- 內容 -->

  <div id="comment-d-1" class="comment-box" hidden>
    <textarea class="card-soft field"
              placeholder="留下你的想法 / 疑問 / 補充..."
              rows="3"
              oninput="saveComment('d-1', this.value)"></textarea>
  </div>
</div>

<style>
.comment-card { position: relative; }
.comment-box { margin-top: 16px; }
.field { width: 100%; padding: 8px 12px; font-size: 14px; }
.comment-toggle {
  position: absolute; top: 16px; right: 16px;
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
  const box = document.getElementById('comment-' + id);
  box.hidden = !box.hidden;
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
  if (ta) { ta.value = val; document.getElementById('comment-' + id).hidden = false; }
  const btn = document.querySelector(`[data-decision-id="${id}"] .comment-toggle`);
  if (btn && val.trim()) btn.classList.add('has-comment');
});
</script>
```

---

## Multi-format export（複製按鈕）

**何時用**：表單填完後、export 給 Claude 用 / commit message / 純 markdown summary。

```html
<div class="export-row">
  <button id="copy-md" class="btn-secondary"><svg class="ic" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;vertical-align:-0.125em"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg> 複製 Markdown</button>
  <button id="copy-commit" class="btn-secondary"><svg class="ic" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;vertical-align:-0.125em"><path d="m18.226 5.226-2.52-2.52A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-.351"/><path d="M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/><path d="M8 18h1"/></svg> 複製 Commit Messages</button>
  <button id="copy-prompt" class="btn-primary"><svg class="ic" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;vertical-align:-0.125em"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg> 複製給 Claude 的 Prompt</button>
</div>

<style>
/* 按鈕外觀用起手範本的 .btn-primary／.btn-secondary，這裡只排一列；窄螢幕放不下就換行 */
.export-row { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
</style>

<script>
function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.innerHTML;
    btn.innerHTML = '已複製';
    setTimeout(() => btn.innerHTML = orig, 2000);
  }).catch(() => {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    btn.innerHTML = '已複製';
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

**拍板頁一律用 `assets/base-template.html` 回傳列腳本裡的「// § 拍板保存（localStorage）」那段**（2026-10-27 第 3 輪裁定），不要另寫一份。行為：

| 項目 | 做法 |
|---|---|
| 存什麼 | 每題的選項值與補充框內容；`change`、`input` 都存 |
| 鍵 | `vt-decisions-<location.pathname>-<版本>`，裡面以題目 id 分開。版本由頁面自動算：每張拍板卡的題名、題目標題、各選項 value 與文字串起來的短雜湊，產頁的人不用填 |
| 載入 | 版本相同才還原讀者自己選過的值與補充；題目或選項任何一處改過，版本就不同，舊答案不還原。同路徑的舊版本鍵載入時刪掉 |
| 清除 | 預覽抽屜頂端「清除我的選擇」文字鈕，先確認再清；只在有拍板題時出現 |

還原的是讀者自己選過的值，不算「預設勾選」（那條規則管的是範本預先勾好的選項）。**為什麼要版本**：AI 常覆寫同一檔名的頁（例如每批更新的待拍板頁），新題目沿用 q1、q2、A／B。沒有版本時，讀者上次的答案會自動勾在沒看過的新題上，看起來像預設勾選，複製時還會一起送回去。全頁評論另存在 `vt-comments-<路徑>`，兩者互不影響。

**為什麼**：第 2 輪評審實測，重新整理後拍板與補充全部消失、留言卻還在，讀者分批拍板時要重做一次。

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
    const ov = document.getElementById('shortcuts-overlay');
    ov.hidden = !ov.hidden;
  }

  // cmd+enter 觸發主要按鈕
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    document.getElementById('copy-prompt')?.click();
  }
});
</script>

<!-- 說明 overlay（按 ? 打開）-->
<div id="shortcuts-overlay" class="kbd-overlay" hidden
     onclick="this.hidden = true">
  <div class="card kbd-panel" onclick="event.stopPropagation()">
    <h3>鍵盤快捷鍵</h3>
    <table class="kbd-table">
      <tr><td><kbd>j</kbd> / <kbd>k</kbd></td><td>上下 section</td></tr>
      <tr><td><kbd>?</kbd></td><td>本說明</td></tr>
      <tr><td><kbd>⌘</kbd> + <kbd>Enter</kbd></td><td>複製主要 prompt</td></tr>
      <tr><td><kbd>Esc</kbd></td><td>關閉本說明</td></tr>
    </table>
  </div>
</div>

<style>
.kbd-overlay {
  position: fixed; inset: 0; z-index: 50;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0, 0, 0, 0.5);
}
/* 上面寫了 display:flex，hidden 屬性的預設隱藏會被蓋掉，要補這條 */
.kbd-overlay[hidden] { display: none; }
.kbd-panel { max-width: 448px; }
.kbd-panel h3 { margin-bottom: 16px; }
.kbd-table { width: 100%; font-size: 14px; }
.kbd-table td { padding: 6px 0; }
</style>
```

---

## Sidebar nav 自動高亮

**何時用**：左側 sticky nav、捲動到對應 section 時 nav 對應項高亮。

```html
<!-- 放在 layout-patterns § 完整版的 .page-grid 裡 -->
<aside class="page-side">
  <nav class="side-nav">
    <a href="#section-a" class="nav-link">A · 自主決策</a>
    <a href="#section-b" class="nav-link">B · 流程優化</a>
  </nav>
</aside>

<style>
.side-nav { position: sticky; top: 96px; display: grid; gap: 4px; }
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

## 補充框（每題一個，一律常駐）

**何時用**：每道拍板題都要有。舊版標題寫「選了特定選項才展開」，跟使用偏好相反，2026-10-27 改正——補充框**一律常駐可見、可直接輸入**，不收起、不做成按鈕展開（讀者習慣直接有補充框可以輸入，收起來就找不到）。嫌佔版面就改呈現：空的時候單行高、淡底，聚焦或有內容時長高（`field-sizing: content`）。

```html
<div data-decision data-id="d-2">
  <div class="choice-row">
    <label class="choice" data-recommended><input type="radio" name="d-2" value="保留"><span class="choice-dot"></span><span>保留</span><span class="rec">推薦</span></label>
    <label class="choice choice-warning"><input type="radio" name="d-2" value="推翻"><span class="choice-dot"></span><span>推翻</span></label>
    <label class="choice"><input type="radio" name="d-2" value="自訂"><span class="choice-dot"></span><span>自訂</span></label>
  </div>
  <textarea class="note" rows="1" data-comment-for="d-2"
            placeholder="補充（選填）：條件、但書、不同意的理由"></textarea>
</div>
```

`textarea.note` 的樣式（單行高、淡底、聚焦長高）在 `assets/base-template.html`「拍板題」CSS 段，照抄即可。補充框**固定可見**、不隨選項切換 `hidden`（使用者偏好：補充欄位永遠在；`verify.py` 會查每題都有補充框，版面健檢會量它有沒有被藏起來）。builder 用 `getComment(id)` 抓它的值拼進摘要。

選項**不預設勾選**（2026-08-22 起）：推薦的那個用 `data-recommended` 標記並顯示「推薦」膠囊，讓讀者一眼看到建議、但要自己點下去才算拍板；複製摘要只含已選的題，可以分批貼回。

---

## 跳題落焦（「還差／下一題 →」與題目地圖共用）

點了跳到某題時，要讓讀者看得到第一個選項，而且焦點已經在它身上。寫法照 `assets/base-template.html` 回傳列腳本的「// § 跳題落焦」：

```js
const r = card.querySelector('input[type="radio"]');
const lab = r.closest("label");
const cs = getComputedStyle(document.documentElement);
const room = innerHeight - (parseFloat(cs.scrollPaddingTop) || 0) - (parseFloat(cs.scrollPaddingBottom) || 0); // 沒有章節列時是 auto → NaN，當 0
if (lab.getBoundingClientRect().bottom - card.getBoundingClientRect().top > room)
  lab.scrollIntoView({ block: "nearest" });   // 題卡頂到選項比兩條列之間高：把選項格捲進兩條列之間
else card.scrollIntoView({ block: "start" }); // 放得下：題卡頂端對齊（scroll-padding 讓出頂端章節列）
r.focus({ preventScroll: true });              // 焦點移到第一個選項，按空白鍵或方向鍵就能選
```

- **為什麼要判斷高度**：手機上題目加樣張常超過一屏。只捲到題卡頂時，第一個選項落在回傳列底下，焦點在它身上卻看不見（第 4 輪 editorial 390 寬實測）。
- **為什麼要 `|| 0`**：頁面沒有頂端章節列時 `scroll-padding-top` 是 `auto`，`parseFloat` 得 NaN，比較恆為 false，高題卡的選項又會落在回傳列底下（spec 390 寬實測）。
- **為什麼只捲一次**：頁面開了 `scroll-behavior: smooth`。先捲題卡、再對選項格 `nearest` 時，第二次會打斷第一次的動畫，並從起點位置算，題卡頂被捲出畫面。
- 不要用 `scrollend` 事件加逾時來補第二次捲動。Safari 舊版沒有這個事件，而且畫面會先停一下再跳一次。

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

## ⭐ 複製摘要格式（唯一格式，2026-10-27 起）

所有頁的「複製給 AI」都輸出同一個骨架，由 `assets/base-template.html` 回傳列腳本的「// § buildFeedback 複製格式」那段產生。各頁的題目行可以多帶欄位（例如方案代號），**骨架與用詞不改**：

```
# <頁面標題> · 拍板摘要            ← 沒有拍板題的頁寫「· 回饋」
時間：2026/10/27 上午2:40:00

- Q1 <短題名>：<選項> — <補充>     ← 只列已選的題；補充沒寫就不接「 — 」
- Q3 <短題名>：<選項>
還有 2 題沒選：Q2 <短題名>、Q4 <短題名>（之後再貼）   ← 都選了寫「全部 M 題都選了」

---

@評論「<引文>」
  → <留言>
```

- 頁面標題去掉 session 前綴（識別 snippet 會在分頁標題前加「<session> · 」）。
- 沒有拍板題、也沒有留言時，標題與時間後面接「（還沒有留言：反白頁面上任一段文字就能留言）」。
- 補充寫了、那題卻沒選：這段**不進**複製內容（只含已選的題），由回傳列與預覽抽屜底部的「第 N 題寫了補充但還沒選，這段不會複製」提示讀者（「// § 補充提示」那段）。
- 不要再用「（尚未選任何題）」「（另有 N 題還沒選，之後再貼）」這類各頁自創的句子。

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
| 重新整理 | 載入時依每則留言的引文在內文找回位置、重掛反白標記（空白差異不計，跨元素見下）；找不到的那則在清單標「原文已變動」 |
| 清單 | 引文是按鈕：點了捲到那段並短暫高亮；引文正體、12px、`--text-soft`。右上有關閉鈕，Esc 也能關；有回傳列時清單底緣跟著列高 |
| 跨元素反白 | 選取跨了粗體、徽章、連結時，逐個文字節點各包一個 mark（同一個 `data-comment-id`）；重新整理時先在單一文字節點找，找不到再把文字節點串起來找、逐段包回。都找不到才標「原文已變動」 |
| 用詞 | 介面一律叫「留言」（浮動鈕、清單標題、留言框提示、複製鈕）；複製內容的 `@評論「…」` 標記照舊，AI 端以它辨識 |
| 手機反白 | 除了 `mouseup`／`touchend`，也聽 `selectionchange`（防抖 150ms）叫出留言鈕：iOS 拖選取把手不一定送 touchend。按下留言鈕當下重讀選取範圍；在補充框、留言框裡選字不算 |
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

**Self-contained snippet（複製整段進範本 `</body>` 前）**：與 `assets/base-template.html` 裡 `<!-- vt-comment:start…-->` 到 `<!-- vt-comment:end -->` 那段逐字相同（範例頁用腳本整段替換這兩行之間），**base 是唯一來源**——要改評論系統先改 base，再整段同步到這裡與各範例，不各自修改。共用複製工具（`window.vtCopyText`／`window.vtSelectForManualCopy`）也在這段裡，評論清單的複製鈕要用它。

```html
<!-- vt-comment:start（全頁評論系統整段，範例頁用腳本從這行替換到 vt-comment:end）-->
<!-- ═══════════════════════════════════════════════════════ -->
<!-- 全頁評論系統 — 預設內建、可手動移除                       -->
<!-- 完整 snippet 見 references/interaction-patterns.md       -->
<!-- § 全頁評論系統（page-wide commenting，預設內建）         -->
<!-- ═══════════════════════════════════════════════════════ -->
<style>
  .vt-comment-trigger {
    position: fixed;
    z-index: 9998;
    background: var(--paper);
    border: 1.5px solid var(--clay);
    border-radius: 999px;
    padding: 6px 12px;
    font-size: 12px;
    color: var(--clay-ink, #a64b2e);
    font-family: var(--mono);
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(20, 20, 19, 0.12);
    display: none;
    align-items: center;
    gap: 6px;
    transition: all 0.15s;
  }
  .vt-comment-trigger:hover {
    background: var(--clay-d, #b85c3e);
    color: var(--paper);
  }
  .vt-comment-popup {
    position: fixed;
    z-index: 9999;
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
  .vt-comment-popup textarea:focus {
    outline: none;
    border-color: var(--clay);
  }
  .vt-comment-popup .actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
    font-size: 12px;
  }
  .vt-comment-popup .hint {
    color: var(--text-soft);
    font-family: var(--mono);
  }
  .vt-comment-popup button.send {
    background: var(--clay-d, #b85c3e);
    color: var(--paper);
    border: none;
    border-radius: 8px;
    padding: 6px 14px;
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
  }
  .vt-comment-popup button.send:hover {
    background: var(--clay-ink, #a64b2e);
  }
  .vt-comment-popup button.cancel {
    background: transparent;
    border: 1px solid var(--g300);
    color: var(--text-soft);
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 12.5px;
    cursor: pointer;
    margin-right: 8px;
  }
  mark.vt-comment-mark {
    background: var(--oat);
    padding: 0 2px;
    border-radius: 2px;
    cursor: pointer;
  }
  mark.vt-comment-mark:hover {
    background: #d5c4a8;
  }
  /* 從清單點過來時短暫亮一下，讀者知道是哪一段 */
  mark.vt-comment-mark.is-flash {
    background: #f7d9a0;
    box-shadow: 0 0 0 3px #f7d9a0;
  }
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
    color: var(--clay-ink, #a64b2e);
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(20, 20, 19, 0.1);
    display: none;
    align-items: center;
    gap: 6px;
    transition: all 0.15s;
  }
  .vt-comment-pill.is-active {
    display: inline-flex;
  }
  .vt-comment-pill:hover {
    background: var(--clay-d, #b85c3e);
    color: var(--paper);
  }
  .vt-comment-pill strong {
    font-weight: 600;
  }
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
  .vt-comment-list.is-open {
    display: flex;
  }
  .vt-comment-list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    background: var(--paper);
    border-bottom: 1.5px solid var(--g200);
    padding: 12px 16px;
    font-family: var(--mono);
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-soft);
    font-weight: 600;
    border-radius: 14px 14px 0 0;
  }
  .vt-list-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    margin: -8px -8px -8px 0;
    padding: 0;
    background: none;
    border: 0;
    border-radius: 8px;
    color: var(--g700);
    cursor: pointer;
  }
  .vt-list-close:hover {
    background: var(--g100);
    color: var(--slate);
  }
  .vt-comment-list-items {
    overflow-y: auto;
    flex: 1;
  }
  .vt-comment-item {
    padding: 12px 16px;
    border-bottom: 1px solid var(--g200);
  }
  .vt-comment-item:last-child {
    border-bottom: none;
  }
  /* 引文：正體、12px、墨色。找得回原文的是按鈕（點了捲過去），找不回的標「原文已變動」 */
  .vt-comment-item .item-quote {
    display: block;
    width: 100%;
    text-align: left;
    font: inherit;
    font-size: 12px;
    color: var(--text-soft);
    font-style: normal;
    background: none;
    border: 0;
    border-left: 2px solid var(--oat);
    padding: 0 0 0 8px;
    line-height: 1.45;
    margin-bottom: 6px;
  }
  button.item-quote {
    cursor: pointer;
  }
  button.item-quote:hover {
    color: var(--slate);
    border-left-color: var(--clay);
  }
  .vt-comment-item .item-lost {
    display: inline-block;
    margin-left: 6px;
    padding: 0 7px;
    font-size: 12px;
    color: var(--yellow-ink);
    background: var(--yellow-soft);
    border-radius: 999px;
    white-space: nowrap;
  }
  .vt-comment-item .item-body {
    font-size: 13px;
    color: var(--slate);
    line-height: 1.5;
  }
  .vt-comment-item .item-del {
    font-size: 12px;
    color: var(--text-soft);
    background: none;
    border: none;
    cursor: pointer;
    margin-top: 4px;
    padding: 0;
    font-family: inherit;
  }
  .vt-comment-item .item-del:hover {
    color: var(--red);
  }
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
  .vt-comment-list-footer button:hover {
    border-color: var(--slate);
    color: var(--slate);
  }
  .vt-comment-list-footer button.copy {
    background: var(--clay-d, #b85c3e);
    color: var(--paper);
    border-color: var(--clay-d, #b85c3e);
  }
  .vt-comment-list-footer button.copy:hover {
    background: var(--clay-ink, #a64b2e);
  }
  body.vt-has-existing-export .vt-comment-list-footer button.copy {
    display: none;
  }
</style>
<button class="vt-comment-trigger" id="vt-comment-trigger"><svg class="ic" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;vertical-align:-0.125em"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/></svg> 留言</button>
<div class="vt-comment-popup" id="vt-comment-popup">
  <div class="quote" id="vt-popup-quote"></div>
  <textarea
    id="vt-popup-textarea"
    placeholder="對這段文字的留言：疑問、補充、不同意的地方…"
  ></textarea>
  <div class="actions">
    <span class="hint">⌘ + Enter 送出 · Esc 取消</span>
    <div>
      <button class="cancel" id="vt-popup-cancel">取消</button
      ><button class="send" id="vt-popup-send">送出</button>
    </div>
  </div>
</div>
<button class="vt-comment-pill" id="vt-comment-pill">
  <svg class="ic" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;vertical-align:-0.125em"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"/></svg> <strong id="vt-count">0</strong>
</button>
<div class="vt-comment-list" id="vt-comment-list">
  <div class="vt-comment-list-header">
    <span>我的留言</span>
    <button type="button" class="vt-list-close" id="vt-list-close" aria-label="關閉留言清單"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg></button>
  </div>
  <div class="vt-comment-list-items" id="vt-comment-list-items"></div>
  <div class="vt-comment-list-footer">
    <button id="vt-clear-all">全部清除</button>
    <button class="copy" id="vt-copy-fallback"><svg class="ic" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:inline-block;vertical-align:-0.125em"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg> 複製留言</button>
  </div>
</div>
<!-- ═══════════════════════════════════════════════════════ -->
<!-- 共用複製工具 — file:// 下瀏覽器停用 navigator.clipboard，   -->
<!-- 一定會落到 execCommand 備援；備援也可能失敗，必須誠實回報   -->
<!-- ═══════════════════════════════════════════════════════ -->
<script>
  // 三段式：clipboard API → execCommand 備援 → 都失敗回 false（不假報成功）
  window.vtCopyText = async function (text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        // 落到 execCommand 備援
      }
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    try {
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      return document.execCommand("copy") === true;
    } catch (err) {
      return false;
    } finally {
      ta.remove();
    }
  };

  // 複製失敗時的出路：把文字放進可選取區域並全選，使用者按一次 Cmd+C 即可
  // target 有給就用頁面既有的預覽區（wrap 為它的外層、會自動展開）；
  // 沒有預覽區就建一個臨時可選取區（雙擊可關閉）。
  window.vtSelectForManualCopy = function (text, target, wrap) {
    let node = target;
    if (node) {
      node.textContent = text;
      if (wrap) wrap.classList.remove("hidden");
    } else {
      node = document.getElementById("vt-manual-copy-box");
      if (!node) {
        node = document.createElement("pre");
        node.id = "vt-manual-copy-box";
        node.title = "雙擊關閉";
        node.style.cssText =
          "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:10000;" +
          "max-width:min(720px,92vw);max-height:40vh;overflow:auto;white-space:pre-wrap;" +
          "background:#fff;color:#111;border:1.5px solid #999;border-radius:10px;" +
          "padding:14px 16px;font-size:12.5px;line-height:1.6;" +
          "box-shadow:0 12px 40px rgba(0,0,0,.28)";
        node.addEventListener("dblclick", function () {
          node.remove();
        });
        document.body.appendChild(node);
      }
      node.textContent = text;
    }
    node.scrollIntoView({ block: "nearest" });
    const sel = window.getSelection();
    if (sel) {
      const range = document.createRange();
      range.selectNodeContents(node);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    return node;
  };
</script>

<script>
  (function () {
    const S = "vt-comments-" + location.pathname,
      L = 80;
    let c = JSON.parse(localStorage.getItem(S) || "[]"),
      sel = null;
    const $ = (i) => document.getElementById(i),
      tr = $("vt-comment-trigger"),
      p = $("vt-comment-popup"),
      pq = $("vt-popup-quote"),
      pt = $("vt-popup-textarea"),
      pi = $("vt-comment-pill"),
      ce = $("vt-count"),
      le = $("vt-comment-list"),
      li = $("vt-comment-list-items");
    window.vtCollectComments = function () {
      if (!c.length) return "";
      return (
        "\n\n---\n\n" +
        c
          .map((x) => {
            const q =
              x.quote.length > L ? x.quote.slice(0, L) + "…" : x.quote;
            return `@評論「${q}」\n  → ${x.body}`;
          })
          .join("\n\n")
      );
    };
    const UI = ".vt-comment-popup,.vt-comment-trigger,.vt-comment-pill,.vt-comment-list";
    // 讀目前的選取：不到 2 個字、焦點在表單欄位裡、或選在留言介面裡就回 null
    function rs() {
      const s = getSelection(),
        t = s.toString().trim();
      if (!t || t.length < 2 || !s.rangeCount) return null;
      // 在補充框、留言框裡選字（編輯自己打的字）不算：Chrome 的選取會回傳框內文字，錨點卻在框外
      if (document.activeElement && document.activeElement.matches("input,textarea,select")) return null;
      // 在留言清單或留言框裡選字不算：否則會對清單裡的引文再留一則言（第 4 輪複查補回）
      const a = s.anchorNode,
        ae = a && (a.nodeType === 1 ? a : a.parentElement);
      if (ae && ae.closest(UI)) return null;
      return { text: t, range: s.getRangeAt(0).cloneRange() };
    }
    function sh() {
      const x = rs();
      if (!x) {
        tr.style.display = "none";
        return;
      }
      sel = x;
      const b = x.range.getBoundingClientRect();
      tr.style.display = "inline-flex";
      tr.style.top = Math.max(8, b.top - 38) + "px";
      tr.style.left = Math.max(8, b.left + b.width / 2 - 40) + "px";
    }
    function hs(e) {
      if (
        e.target.closest(
          ".vt-comment-popup,.vt-comment-trigger,.vt-comment-pill,.vt-comment-list,button,input,select,textarea",
        )
      )
        return;
      setTimeout(sh, 10);
    }
    document.addEventListener("mouseup", hs);
    document.addEventListener("touchend", hs);
    // § selectionchange：手機拖選取把手不一定送 touchend，選取一變就重算留言鈕（防抖 150ms）
    let sw;
    document.addEventListener("selectionchange", () => {
      clearTimeout(sw);
      // 留言框開著時不動：讀者在框外又選了別段，送出時要存的還是框上那段引文（第 4 輪複查補回）
      sw = setTimeout(() => {
        if (p.style.display !== "block") sh();
      }, 150);
    });
    tr.addEventListener("click", op);
    function op() {
      // 按下當下重讀選取：防抖期間選取又改過時，以按下那一刻為準
      const x = rs();
      if (x) sel = x;
      if (!sel) return;
      const q = sel.text.length > L ? sel.text.slice(0, L) + "…" : sel.text;
      pq.textContent = q;
      pt.value = "";
      const t = tr.getBoundingClientRect();
      let l = t.left;
      if (l + 340 > innerWidth - 16) l = innerWidth - 356;
      let to = t.bottom + 6;
      if (to + 220 > innerHeight) to = t.top - 230;
      p.style.left = Math.max(8, l) + "px";
      p.style.top = Math.max(8, to) + "px";
      tr.style.display = "none";
      p.style.display = "block";
      setTimeout(() => pt.focus(), 50);
    }
    $("vt-popup-cancel").addEventListener("click", cp);
    $("vt-popup-send").addEventListener("click", sc);
    pt.addEventListener("keydown", (e) => {
      if (e.isComposing || e.keyCode === 229) return;
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        e.stopPropagation();
        sc();
      }
      if (e.key === "Escape") cp();
    });
    function cp() {
      p.style.display = "none";
      sel = null;
    }
    function sc() {
      const b = pt.value.trim();
      if (!b || !sel) return cp();
      const id = "c-" + Date.now(),
        q = sel.text,
        x = { id, quote: q, body: b, ts: Date.now() };
      try {
        const m = document.createElement("mark");
        m.className = "vt-comment-mark";
        m.dataset.commentId = id;
        sel.range.surroundContents(m);
      } catch (e) {
        // 選取跨了元素（粗體、徽章、連結）：surroundContents 包不了，改成逐個文字節點各包一段
        if (!wr(sel.range, id)) x.nomark = 1; // 一段都包不了才不標；清單照列，但不能標成「原文已變動」
      }
      c.push(x);
      ps();
      rn();
      cp();
      getSelection().removeAllRanges();
    }
    function ps() {
      localStorage.setItem(S, JSON.stringify(c));
    }
    const mk = (id) =>
      document.querySelector(`mark.vt-comment-mark[data-comment-id="${id}"]`);
    // § 跨元素標記：一則留言可以有好幾個 mark（同一個 data-comment-id），每個文字節點各包一段。
    //   只有空白的片段不包（表格列之間的換行包了 mark 會讓表格結構出錯）
    function wp(n, a, b, id) {
      if (a >= b || !n.nodeValue.slice(a, b).trim()) return 0;
      const r = document.createRange();
      r.setStart(n, a);
      r.setEnd(n, b);
      const e = document.createElement("mark");
      e.className = "vt-comment-mark";
      e.dataset.commentId = id;
      r.surroundContents(e);
      return 1;
    }
    const tws = (root) =>
      document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) =>
          n.parentElement &&
          !n.parentElement.closest(
            "script,style,.vt-comment-popup,.vt-comment-trigger,.vt-comment-pill,.vt-comment-list",
          )
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT,
      });
    // 把一個跨元素的選取範圍逐節點包起來；回傳包了幾段
    function wr(range, id) {
      const root = range.commonAncestorContainer,
        ns = [];
      if (root.nodeType === 3) ns.push(root);
      else for (let n, w = tws(root); (n = w.nextNode()); ) if (range.intersectsNode(n)) ns.push(n);
      let k = 0;
      ns.forEach((n) => {
        const a = n === range.startContainer ? range.startOffset : 0,
          b = n === range.endContainer ? range.endOffset : n.nodeValue.length;
        k += wp(n, a, b, id);
      });
      return k;
    }
    // 重新整理後標記會消失（只存了引文）：依引文在內文找回位置再包一次。
    // 只找單一文字節點內的引文；空白不計較（原始碼換行縮排 vs 選取時的單一空格）
    function ra(x) {
      if (mk(x.id)) return;
      const w = x.quote.trim().split(/\s+/).filter(Boolean);
      if (!w.length) return;
      const re = new RegExp(
        w.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\s+"),
      );
      const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) =>
          n.parentElement &&
          !n.parentElement.closest(
            "script,style,.vt-comment-popup,.vt-comment-trigger,.vt-comment-pill,.vt-comment-list",
          )
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT,
      });
      for (let n; (n = tw.nextNode()); ) {
        const m = re.exec(n.nodeValue);
        if (!m) continue;
        const r = document.createRange();
        r.setStart(n, m.index);
        r.setEnd(n, m.index + m[0].length);
        const e = document.createElement("mark");
        e.className = "vt-comment-mark";
        e.dataset.commentId = x.id;
        r.surroundContents(e);
        return;
      }
      // 單一文字節點找不到：把文字節點串起來再找（引文跨了粗體、徽章、連結），找到後逐段包回。
      // 跨元素時選取文字在元素交界可能多一個換行、也可能沒有，所以詞與詞之間空白可有可無
      const all = [];
      let txt = "";
      for (let n, w = tws(document.body); (n = w.nextNode()); ) {
        all.push([n, txt.length]);
        txt += n.nodeValue;
      }
      const re2 = new RegExp(
        w.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("\\s*"),
      );
      const m2 = re2.exec(txt);
      if (!m2) return;
      const st = m2.index,
        en = st + m2[0].length;
      all
        .filter(([n, o]) => o < en && o + n.nodeValue.length > st)
        .forEach(([n, o]) => wp(n, Math.max(0, st - o), Math.min(n.nodeValue.length, en - o), x.id));
    }
    function rn() {
      ce.textContent = c.length;
      pi.classList.toggle("is-active", c.length > 0);
      if (!c.length) le.classList.remove("is-open");
      li.innerHTML = c
        .map((x) => {
          const q =
            x.quote.length > 60 ? x.quote.slice(0, 60) + "…" : x.quote;
          const quote = mk(x.id)
            ? `<button type="button" class="item-quote" data-jump="${eh(x.id)}" title="捲到這段">「${eh(q)}」</button>`
            : `<div class="item-quote">「${eh(q)}」${x.nomark ? "" : '<span class="item-lost">原文已變動</span>'}</div>`;
          return `<div class="vt-comment-item" data-id="${eh(x.id)}">${quote}<div class="item-body">${eh(x.body)}</div><button class="item-del" data-del="${eh(x.id)}">刪除</button></div>`;
        })
        .join("");
      li.querySelectorAll("[data-del]").forEach((b) =>
        b.addEventListener("click", () => dc(b.dataset.del)),
      );
      li.querySelectorAll("[data-jump]").forEach((b) =>
        b.addEventListener("click", () => jp(b.dataset.jump)),
      );
    }
    // 清單點引文：捲到那段、短暫高亮；手機上清單會蓋住內文，捲過去時順手收起
    function jp(id) {
      const m = mk(id);
      if (!m) return;
      m.scrollIntoView({ block: "center" });
      const ms = document.querySelectorAll(`mark.vt-comment-mark[data-comment-id="${id}"]`);
      ms.forEach((e) => e.classList.add("is-flash"));
      setTimeout(() => ms.forEach((e) => e.classList.remove("is-flash")), 1600);
      if (innerWidth <= 640) le.classList.remove("is-open");
    }
    function dc(id) {
      c = c.filter((x) => x.id !== id);
      document
        .querySelectorAll(`mark.vt-comment-mark[data-comment-id="${id}"]`)
        .forEach((m) => {
          const pr = m.parentNode;
          while (m.firstChild) pr.insertBefore(m.firstChild, m);
          pr.removeChild(m);
          pr.normalize();
        });
      ps();
      rn();
    }
    function eh(s) {
      return String(s).replace(
        /[&<>"']/g,
        (ch) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[ch],
      );
    }
    pi.addEventListener("click", () => le.classList.toggle("is-open"));
    // 清單關閉：右上關閉鈕、Esc
    $("vt-list-close").addEventListener("click", () => le.classList.remove("is-open"));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") le.classList.remove("is-open");
    });
    // 有回傳列時，清單底緣跟著列高（列在手機與拍板頁會變高），不要壓到列
    const bar = document.querySelector(".sticky-bar");
    if (bar) new ResizeObserver(() => (le.style.bottom = bar.getBoundingClientRect().height + 12 + "px")).observe(bar);
    $("vt-clear-all").addEventListener("click", () => {
      if (!c.length) return;
      if (!confirm("確定清除全部 " + c.length + " 則留言？")) return;
      document.querySelectorAll("mark.vt-comment-mark").forEach((m) => {
        const pr = m.parentNode;
        while (m.firstChild) pr.insertBefore(m.firstChild, m);
        pr.removeChild(m);
        pr.normalize();
      });
      c = [];
      ps();
      rn();
    });
    $("vt-copy-fallback").addEventListener("click", async (e) => {
      if (!c.length) return;
      const t = window.vtCollectComments().replace(/^\n\n---\n\n/, ""),
        b = e.currentTarget,
        o = b.innerHTML; // innerHTML：按鈕裡有 SVG 圖示，用 textContent 還原會把圖示弄丟
      const ok = await window.vtCopyText(t);
      if (ok) {
        b.textContent = "已複製";
      } else {
        // 複製不到就不假報成功：把評論放進臨時區域並全選
        window.vtSelectForManualCopy(t);
        b.textContent = "已選取 → 請按 Cmd+C";
      }
      setTimeout(() => (b.innerHTML = o), ok ? 2000 : 6000);
    });
    setTimeout(() => {
      if (typeof window.vtBuildDecisionExport === "function")
        document.body.classList.add("vt-has-existing-export");
    }, 100);
    document.addEventListener("click", (e) => {
      if (
        p.style.display === "block" &&
        !e.target.closest(".vt-comment-popup,.vt-comment-trigger")
      )
        cp();
    });
    c.forEach(ra);
    rn();
  })();
</script>
<!-- vt-comment:end -->
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

- **純 vanilla**：不用 framework、不用 npm install、不用 build
- **本地優先**：所有狀態 localStorage、不打 server
- **export 是終點**：互動完最後總要把 state 倒回 prompt 給 Claude
- **不要過度設計**：互動是工具、不是炫技。文章 Thariq 警告「don't make it a product, throwaway purpose-built」
- **單一複製出口**：全頁評論不另設複製按鈕、合進範本既有的 export builder
