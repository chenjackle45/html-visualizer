# 中英混雜詞審稿清單（Step 3 必用）

> 寫 HTML 給人類看時、收尾前 batch 替換中英混雜詞、避免「不中不英」讀起來卡。

## 為什麼這個 step 重要

HTML 是 user-facing 長文件、user 通常更偏好完整中文閱讀。AI 寫長文件時容易帶過多英文技術詞（reversibility / dashboard / popup / drift / dead code 等）讓句子讀起來不順。批次替換 + 句構檢查能讓 user 一次讀懂、省來回。

不影響：AI 內部思考 / commit message / code comment / spec markdown — 那些是 dev audience、中英混雜 OK。

## 替換對照表（按主題分類）

### 流程 / 動作詞

| 英文 | 翻譯 | 備註 |
|---|---|---|
| ship | 上線 / 出貨 | git ship 命令保留 |
| reversibility | 可逆性 | |
| audit trail | 決策紀錄 / 稽核紀錄 | |
| drift | 漂移 | |
| polling | 輪詢 | |
| transaction | 異動 / 交易 | |
| retry | 重試 | |
| race condition | 競爭情境 | |
| skip | 跳過 | |
| spawn | 派出 / 啟動 | |
| cover / covered | 涵蓋 / 已涵蓋 | |
| refactor | 重構 | |
| regression | 迴歸 / 退步 | |
| autosave | 自動存檔 | |
| navigate | 導頁 | |
| fallback | 退回方案 | |
| import / export | 匯入 / 匯出 | |
| build | 建置 | |
| stash | 暫存 | |

### 介面 / UI 詞

| 英文 | 翻譯 | 備註 |
|---|---|---|
| dashboard | 儀表板 | |
| popup | 彈窗 | |
| dialog | 對話框 | |
| fold / folding | 折疊 | |
| compose | 撰寫 | 若是 endpoint 名稱則保留原文 |
| filter | 篩選 | |
| filter tab | 篩選分頁 | |
| counter badge | 計數徽章 | |
| inline reply | 內嵌回覆 | |
| dead code | 死代碼 | |
| stack | 堆疊 | |
| overflow chip | 溢出標籤 | |
| highlight | 醒目 | |
| destructive | 警示色 | |
| amber | 琥珀色 | |
| binding control | 綁定按鈕 | |

### 角色 / 系統詞

| 英文 | 翻譯 | 備註 |
|---|---|---|
| staff | staff（員工）| 首次出現加註 |
| manager | manager（主管）| 首次出現加註 |
| external | external（外部角色）| 首次出現加註 |
| caller | 呼叫端 | |
| visible UI | 可見的介面 | |

### 開發階段詞

| 英文 | 翻譯 | 備註 |
|---|---|---|
| spec | 規格 | |
| dev / dev server | 開發 / 開發伺服器 | |
| frontend / backend | 前端 / 後端 | |
| codebase | 程式碼庫 | |
| pipeline | 流程 | |
| follow-up | 待辦 | |
| tech-debt | 技術債 | |
| feature | 功能 | |
| bug | 錯誤 | |
| message | 訊息 | commit message 保留 |
| pending | 待處理 | |
| amendment | 補述 | |
| implementation | 實作 | |

### 通訊 / 流程術語

| 英文 | 翻譯 | 備註 |
|---|---|---|
| channel | 管道 | channel-agnostic / channel-specific 同樣翻 |
| inbound | inbound（接聽）| 通訊語境保留並加註 |
| outbound | outbound（撥出）| 通訊語境保留並加註 |
| unbound / bound | 未綁定 / 已綁定 | |
| binding | 綁定 / 綁定流程 | |
| metadata | metadata（中介資料）| 首次加註 |

### 設計 / pattern 詞

| 英文 | 翻譯 | 備註 |
|---|---|---|
| scope guard | 範疇守衛 | |
| visibility filter | 可見性過濾 | |
| view component | 視覺元件 | |
| cooperative-fail-fast | fail-fast 協作模式 | pattern name 保留 + 加註 |
| idempotent | 冪等 | 技術術語、可保留 |
| row lock | 列鎖 | |

## 保留原文（不翻、不加註）

這些是技術專有名詞、語境上保留比翻譯更清楚：

### Skill 名 / 工具名
- 你環境裡各 skill 與 slash command 的名字（原樣保留，不翻）
- Claude Code / Anthropic / GitHub

### Git 命令 / 概念
- commit / push / merge / rebase / branch / origin / master / stash（git 詞彙整體保留）
- git push / git commit / git rebase

### Framework / 工具
- Vue / Nuxt / Strapi / vitest / knex / Tailwind / Pinia / SQLite / PostgreSQL

### 系統名 / Schema 名
- 你專案的 Content Type / 資料表名（原樣保留，例：`order-item`）
- 資料庫欄位名與識別碼（原樣保留，例：`documentId`、`created_at`）

### 公知縮寫
- API / RBAC / SSE / PBX / TLS / SOP / CRM / DOM / JWT / UUID / OAuth / HTTP / HTTPS / JSON / SQL / CSS / HTML

### 敏捷 / 工程術語
- Story / Epic / Sprint / Backlog / Standup / Retro（敏捷用語一律保留）

### Endpoint / Path
- 你專案的 API 路徑一律原樣保留（例：`GET /api/items`、`POST /api/items/:id/confirm`）

### CSS / DOM / Web 術語
- class 名 / hover / active / data-attribute / 404 / 200 / 500 / GET / POST / PATCH

### Auto mode / dev mode 等 Claude Code 特定詞
- 可保留並加註中文（auto mode（自動模式））

## 元件名首次出現加註中文

元件名保留原文、首次出現時在後面用括號補一句中文說明，讓不熟該元件的讀者知道它是什麼。格式：

```
<元件名>（中文說明）

例：
UserPickerDialog（使用者挑選對話框）
StatusBadge（狀態標籤）
OrderListItem（訂單列項）
```

之後同元件重複出現可省略註解。

## Python 批次替換 script 範例

寫完 HTML 後、open 前直接複製改用：

> **⚠️ 必先 mask 程式碼區塊再替換** — 否則會把 `<script>` 內的 JavaScript API（如 `lines.push(...)` → `lines.推送(...)`）跟 `data-id="f-push"` 之類的 HTML attribute 一起翻成中文、頁面打開時瀏覽器報 `TypeError: lines.推送 is not a function`。歷史踩坑：2026-05-09 marathon HTML 第一版犯過。

```python
import re

path = '<產出檔路徑>'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# === Step 1: Mask 程式碼區塊（替換時不動）===
# <script> ... </script> / <style> ... </style> / <code> ... </code>
# data-id="..." / data-comment-for="..." / name="..." / id="..."（HTML attribute 內 ID 不可翻）
masks = []
def stash(match):
    masks.append(match.group(0))
    return f'__MASK_{len(masks)-1}__'

# 1a. mask <script> + <style> + <code> 區塊
content = re.sub(r'<script[\s\S]*?</script>', stash, content)
content = re.sub(r'<style[\s\S]*?</style>', stash, content)
content = re.sub(r'<code[\s\S]*?</code>', stash, content)

# 1b. mask HTML attribute 內 ID 字串（避免 data-id="f-push" 被翻成 "f-推送"）
# 注意 lookahead/lookbehind 限制：用 callback function 替換才能 capture full match
content = re.sub(r'(data-id|data-comment-for|name|id|for)="[^"]+"', stash, content)

# === Step 2: 跑批次替換（順序重要：長片語先、避免短詞破壞長片語）===
replacements = [
    # === 高頻流程詞 ===
    (r'reversibility', '可逆性'),
    (r'audit trail', '決策紀錄'),
    (r'\bship\b(?!ping)', '上線'),
    (r'\bdrift\b', '漂移'),
    (r'tech-debt', '技術債'),
    (r'\bfollow-up\b', '待辦'),
    (r'\bdashboard\b', '儀表板'),
    (r'\bpopup\b', '彈窗'),
    (r'\bdialog\b', '對話框'),
    (r'\bpolling\b', '輪詢'),
    (r'\bretry\b', '重試'),
    (r'\bskip\b', '跳過'),
    (r'\bspawn\b', '派出'),
    (r'\brefactor\b', '重構'),
    (r'\bpipeline\b', '流程'),
    (r'\bspec\b(?![-/])', '規格'),
    (r'\bdev server\b', '開發伺服器'),
    (r'\bdev\b(?!:)', '開發'),
    (r'\bfrontend\b(?!-)', '前端'),
    (r'\bbackend\b(?!-)', '後端'),
    (r'\bcodebase\b', '程式碼庫'),
    (r'\bbug\b', '錯誤'),
    (r'\bbuild\b', '建置'),

    # === UI / 介面 ===
    (r'\bfilter\b(?! tab)', '篩選'),
    (r'filter tab', '篩選分頁'),
    (r'counter badge', '計數徽章'),
    (r'thread folding', '對話串折疊'),
    (r'inline reply', '內嵌回覆'),
    (r'dead code', '死代碼'),
    (r'binding control', '綁定按鈕'),
    (r'\bhighlight\b', '醒目'),
    (r'\bdestructive\b', '警示色'),
    (r'\bamber\b', '琥珀色'),

    # === 角色加註中文（換成你這份產出裡的角色）===
    (r'\bstaff\b', 'staff（員工）'),
    (r'\bmanager\b', 'manager（主管）'),

    # === 設計術語 ===
    (r'scope guard', '範疇守衛'),
    (r'visibility filter', '可見性過濾'),

    # === 元件名首次加註（用 lookahead 避免重複加）===
    # 換成你這份產出裡實際出現的元件，一個元件一行
    (r'\bUserPickerDialog\b(?!（)', 'UserPickerDialog（使用者挑選對話框）'),
    (r'\bStatusBadge\b(?!（)', 'StatusBadge（狀態標籤）'),
]

for old, new in replacements:
    content = re.sub(old, new, content)

# === Step 3: 收尾清理 ===
# 3a. 清掉重複加註括號（多輪替換後可能產生）
content = re.sub(r'(（[^）]+）)\1+', r'\1', content)

# === Step 4: 還原 mask（程式碼區塊原樣放回）===
for i, original in enumerate(masks):
    content = content.replace(f'__MASK_{i}__', original)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Done. File size: {len(content)} bytes")
print(f"Masked blocks restored: {len(masks)}")
```

## 替換後驗證（必跑、避免遺漏）

mask 不一定 100% 完整、寫完後執行驗證：

```bash
# 1. 確認 JS API 沒被中文化
grep -E "\.推送|\.推\b|.length\b.*推|forEach 推" <產出檔路徑>
# expected: 無 match

# 2. 確認 HTML attribute 內 ID 沒被改
grep -E 'data-id="[^"]*[一-鿿]|name="[^"]*[一-鿿]' <產出檔路徑>
# expected: 無 match（attribute 內無中文）

# 3. open 前 quick read 一段 JS、確認 push/forEach/querySelector 等保留英文
sed -n '/<script>/,/<\/script>/p' <產出檔路徑> | grep -E "\.push|\.forEach|querySelector"
# expected: 全英文 API name
```

任一驗證 fail → 回頭修 mask 規則、重跑替換、不可直接 open 給 user 看（瀏覽器會報 TypeError）。

## 句構檢查 checklist（替換後 read 一遍）

批次替換完不可立刻 open、必須再 read 一段、檢查：

1. **嵌套引號破壞句子** — 例：「原本「每 Story 上線前必過閘門「你的實機驗收」」護欄」→ 改成「原本的護欄是『每個 Story 上線前必須由你親跑實機驗收』」
2. **多餘空格** — 替換留下中文間多空格、`re.sub(r'  +', ' ')` 收尾（注意：HTML 內 leading whitespace 會被 prettier 還原、不用擔心 indentation 被破壞、瀏覽器 render 時 whitespace 會 collapse）
3. **重複加註括號** — `metadata（中介資料）（中介資料）` 之類、用 `re.sub(r'(（[^）]+）)\1+', r'\1', content)` 清
4. **詞性不通** — 替換後動詞變名詞或反之、要重組句子（例：「合 5 commit」→「合併為 5 個 commit」）
5. **value 屬性沒替換到** — radio / select 的 `value="..."` 內若有英文也要替換（注意這影響 buildSummary() 的 markdown 輸出）

## 例外（不適用此清單）

| 情境 | 為何不審 |
|---|---|
| AI 內部思考 / scratch | AI 看 markdown、中英混雜 OK |
| commit message | dev audience、git 工具術語完整保留 |
| code comment / docstring | dev audience |
| spec markdown 技術討論段 | dev audience |
| HTML 內的 `<style>` / `<script>` | 程式碼區、不審內部 |

只審 HTML body 顯示給人看的文字 — `<title>` / `<h1>` / 段落 / 卡片標題 / 按鈕文字 / radio value / 表格內容。
