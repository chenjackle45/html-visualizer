# Session 識別（多視窗並行時分辨來源）

> **為什麼要有**：使用者常同時跑好幾個 session，每個都會丟 HTML 出來要人看。開了五個分頁之後，光看內容分不出「這份是哪個 session 產的」。**每份產出都要能一眼認出來源**。

## 三層識別（一起做，缺一層就會有分不出來的情境）

| 層 | 做什麼 | 解決的情境 |
|---|---|---|
| ① 分頁標題前綴 | `<title>` 變成 `{session 名} · {主題}` | 分頁很多、標題被截斷時，前綴先出現 |
| ② 動態 favicon | 依 session 產穩定色的色塊 + 首字 | 分頁縮到只剩 icon 時，靠顏色認 |
| ③ 頂部色帶徽章 | 頁面最上方一條彩色帶：`● session 名 · 短 id` | 全螢幕看內容時，抬頭就知道在看誰的 |

顏色由短 id 雜湊而來、**同一 session 每次都同色**，所以「藍色那個是部署那條線」這種記憶會累積。

## Step 1 — 取得標籤（寫 HTML 前先跑）

```bash
eval "$(<本 skill 目錄>/scripts/session-label.sh)"
echo "$VT_LABEL / $VT_ID / $VT_PROJECT"
```

取值優先序（script 已處理）：

1. **背景 job** → job 清單上顯示的那個名字（最貼近使用者心裡的「哪個 session」）
2. **worktree** → 分支名
3. **一般 session** → 專案名（非主線分支時附上分支）

短 id 一律取 session id 前 8 碼，避免兩個同名 job 撞在一起。

**第三個值 `VT_PROJECT`** 是來源專案（由當下工作目錄的 git 根目錄推斷），給索引頁分組篩選用。推斷不準時 AI 可自行覆寫成更貼切的名字——它只是輔助標籤，不影響顏色與識別。

## Step 2 — 把值填進 snippet

整段貼進 `</body>` 前（跟全頁評論 snippet 並列即可），**只改第一個 `<script>` 裡的三個值**：

```html
<!-- ═══ Session 識別 ═══ -->
<script>
  // ← 這三個值來自 scripts/session-label.sh；label 留空字串即整段不顯示
  window.VT_SESSION = { label: "", id: "", project: "" };
</script>
<style>
  .vt-session-badge {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 5px 16px;
    background: var(--vt-session-color, #666);
    color: #fff;
    font-family: var(--mono, ui-monospace, monospace);
    font-size: 11.5px;
    letter-spacing: 0.06em;
  }
  .vt-session-badge .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #fff;
    opacity: 0.85;
    flex-shrink: 0;
  }
  .vt-session-badge .lb {
    font-weight: 700;
    text-transform: uppercase;
  }
  .vt-session-badge .id {
    margin-left: auto;
    opacity: 0.75;
  }
</style>
<script>
  (function () {
    const s = window.VT_SESSION || {};
    if (!s.label) return; // 沒填就整段停用（範本原檔即此狀態）
    const seed = s.id || s.label;
    let hue = 7;
    for (const c of seed) hue = (hue * 31 + c.charCodeAt(0)) % 360;
    const col = `hsl(${hue} 58% 42%)`;

    // ① 分頁標題前綴
    document.title = `${s.label} · ${document.title}`;

    // ② favicon：色塊 + 首字
    try {
      const cv = document.createElement("canvas");
      cv.width = cv.height = 64;
      const g = cv.getContext("2d");
      g.fillStyle = col;
      if (g.roundRect) {
        g.beginPath();
        g.roundRect(2, 2, 60, 60, 14);
        g.fill();
      } else {
        g.fillRect(2, 2, 60, 60);
      }
      g.fillStyle = "#fff";
      g.font = '700 38px ui-sans-serif, system-ui, "PingFang TC"';
      g.textAlign = "center";
      g.textBaseline = "middle";
      const ch = (s.label.match(/[A-Za-z0-9一-鿿]/) || ["?"])[0];
      g.fillText(ch.toUpperCase(), 32, 36);
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = cv.toDataURL();
      document.head.appendChild(link);
    } catch (e) {}

    // ③ 頂部色帶徽章
    const b = document.createElement("div");
    b.className = "vt-session-badge";
    b.style.setProperty("--vt-session-color", col);
    b.innerHTML =
      '<span class="dot"></span><span class="lb"></span><span class="id"></span>';
    b.querySelector(".lb").textContent = s.label;
    b.querySelector(".id").textContent = s.id || "";
    const host = document.querySelector("header") || document.body;
    host.insertBefore(b, host.firstChild);
  })();
</script>
```

## 設計決定與理由

| 決定 | 為什麼 |
|---|---|
| 色帶放在頁首**之上**、不取代 h1 | h1 要留給內容主題。若 session 名佔走 h1，開了五個分頁會變成「五份都叫某某 session」，反而更難分 |
| 顏色用雜湊、不隨機 | 同一 session 每次同色，顏色才會變成可累積的記憶 |
| 標籤留空即整段停用 | 範本原檔自己打開時乾淨、不顯示假資料；忘了填也不會露出 placeholder |
| favicon 用 canvas 現產、不外連 | 零依賴、離線可用，且不必管圖檔放哪 |

## 何時可以省略

只有一種：使用者明確說不要。

其餘情況一律加——這是**必含元素**，見 `SKILL.md` § 必含元素。
