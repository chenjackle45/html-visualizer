# 結構圖（SVG）— 分支、交接、回返、跨區關係怎麼畫

> 來源：github.com/cathrynlavery/diagram-design v2.6（MIT）蒸餾。整包在 `diagram-design` skill 目錄，本檔只收「每次畫圖都要用」的部分；範例 HTML、語意 pattern、動畫按需深讀（§8）。
> 為什麼有這份：掃了兩個月共 50 份規格／流程類頁，只 5 份畫圖、14 份把流程塞進表格——不是沒需求，是元件庫只會畫直線鏈，agent 遇到分支與交接就攤成表格。三組並排實驗（泳道／流程圖／狀態機）讀者三組全選圖版：「非常好閱讀、資訊充足」。

---

## 1. 先判斷：div 直線鏈、表格，還是 SVG 結構圖

| 內容形狀                                           | 用什麼                                                        | 為什麼                            |
| -------------------------------------------------- | ------------------------------------------------------------- | --------------------------------- |
| A → B → C → D，單向、無分岔                        | `Flow diagram` / `Vertical flow`（div，見 component-library） | 直線鏈 div 就夠，SVG 是殺雞用牛刀 |
| 三欄表格講得清（項目 × 屬性）                      | 表格                                                          | 圖是看關係的，不是看格子的        |
| **有以下任一** →                                   | **SVG 結構圖（本檔）**                                        |                                   |
| ・同一節點兩個以上出口（判斷、分支）               | 流程圖                                                        |                                   |
| ・不同角色之間交接（誰做完交給誰）                 | 泳道 / 時序                                                   |                                   |
| ・回頭路（修完重審、退回重工、重試）               | 狀態機 / 泳道                                                 |                                   |
| ・元件分區、跨區連線（前端／後端／資料、信任邊界） | 架構 / 部署                                                   |                                   |
| ・一對多、多對一、有環的依賴                       | 依賴圖 / ER                                                   |                                   |
| 時間序列資料、占比、分組數字                       | 交棒 `chart` skill                                            | 那是資料圖表，不是結構圖          |

判斷心法：**「要讀順序」→ div 直線鏈；「要讀關係」→ SVG；「要讀數字」→ 表格或 chart。**

---

## 2. 選型：先看語意，再選圖型

**內容講的是「系統在做什麼行為」時**（多個來源擠一個瓶頸、兩條規則在哪分岔、哪些路徑被信任邊界擋、控制項在哪層生效、防線怎麼互補），先讀整包 `references/semantic-patterns.md` 挑一個 pattern，pattern 決定必畫的元素與更緊的預算，再用它指定的圖型排版。純結構就直接選型：

| 要呈現                                                   | 圖型              | 慣例見 §7 |
| -------------------------------------------------------- | ----------------- | --------- |
| 元件與連線、分區（前端／後端／資料）                     | 架構 Architecture | 7.1       |
| 判斷邏輯、有分支的流程、「該不該…」                      | 流程圖 Flowchart  | 7.2       |
| 多個參與者按時間來回（請求／回應、token 換發、事故重建） | 時序 Sequence     | 7.3       |
| 狀態與轉移、守衛條件（訂單狀態、連線生命週期、精靈步驟） | 狀態機 State      | 7.4       |
| 跨角色／跨部門流程、交接                                 | 泳道 Swimlane     | 7.5       |
| 事件落在時間上（發版史、事故時間軸、里程碑）             | 時間軸 Timeline   | 7.6       |
| 堆疊的抽象層（技術棧、上下文層級）                       | 分層 Layers       | 7.7       |
| 父→子且要畫連線幾何的階層（深 3～4 層、寬 4～5、或要標關鍵葉）；淺層 2～3 級純分類用 component-library 的 div Tree 就夠 | 樹 Tree | 7.8 |
| 誰依賴誰，**有多父或有環**（樹畫不出來的）               | 依賴圖 Dependency | 7.9       |
| 軟體跑在哪：環境區、主機、副本數、版本                   | 部署 Deployment   | 7.10      |
| 實體、欄位、基數（資料模型）                             | ER                | 7.11      |
| 任務與階段排在時間上                                     | 甘特 Gantt        | 7.12      |

其餘 27 型（象限、雷達、桑基、魚骨、看板、旅程、Wardley、組織圖、巢狀、金字塔、文氏、UML class、DB schema…）在整包 `SKILL.md` §3 的表；需要時再進去。

經驗法則：兩型都像 → 挑主軸那型；超過預算（§4）→ 拆成「總覽＋細部」兩張，不硬塞。

---

## 3. 六條連線規則（不可協商）

1. **正交圓角轉彎**。節點不在同一 x 或 y 軸上時，連線一律走直角，轉角用四分之一圓弧 `r=8`（擠時最小 6）。斜線是直接不及格。同軸才可用 `<line>`。
2. **標籤離線 6～10px，且有遮罩**。標籤放在線段上方（垂直段放旁邊），遮罩矩形底邊與線之間留 6～10px 可見間隙。標籤蓋在線上＝不及格。
3. **連線不重疊**。兩條線不共用路徑、不平行貼著走；必須交叉時在較不重要那條加「跳線」弧；想併線時錯開 ≥12px。發現自己在疊線＝版面錯了，兩個節點太近或超預算。
4. **同一邊多條線 → 分散接點**。N 條線進出同一邊時各有自己的接點，相鄰 ≥12px（小框最小 8）；第 k 條放在 `L·k/(N+1)`。平行同向的兩條整段保持 ≥12px。
5. **線不穿過不相干的框**。預設繞路。唯一例外：橫向大條（footer 服務、分層條）幾何上躲不開時，改虛線 `stroke-dasharray="4,3"`、標籤放在可見端、箭頭只落在真正的終點。
6. **標籤遮罩不壓到後畫的節點**。節點畫在標籤之後，遮罩若伸進節點會被蓋住、只剩半截字。標籤放在穿過空白畫布的線段上；離開節點右邊的線，遮罩要清出 `x + width`。整個在節點裡的遮罩是徽章、可以。

---

## 4. 複雜度預算（每張圖）

| 上限                             | 值                                     |
| -------------------------------- | -------------------------------------- |
| 節點                             | 9                                      |
| 箭頭／轉移                       | 12                                     |
| 強調色元素                       | 2                                      |
| 時序：生命線 / 組合片段 / alt 區 | 5 / 1（兩個只准都是單區 opt／loop）/ 2 |
| 泳道                             | 5                                      |
| 樹深度 / 每層寬度                | 4 / 5                                  |
| 分層                             | 6                                      |
| ER 實體                          | 8                                      |
| 依賴圖：節點 / 邊 / 層 / 環      | 9 / 14 / 4 / 1                         |
| 部署：區 / 節點 / 路徑           | 3 / 6 / 8                              |
| 甘特任務                         | 12                                     |
| 註解框                           | 2                                      |

超過 → 拆成總覽＋細部。**目標密度 4/10**：技術上完整、不需要導讀。九個節點以上多半是兩張圖。

---

## 5. 顏色與字級（對到 html-visualizer 的 token）

| 上游語意                    | 上游值               | 本機用                                                |
| --------------------------- | -------------------- | ----------------------------------------------------- |
| paper（背景、遮罩）         | `#f5f5f5`            | `#faf9f5`（`--ivory`）                                |
| ink（節點名、主要描邊）     | `#2d3142`            | `#141413`（`--slate`）                                |
| muted（箭頭、次要文字）     | `#4f5d75`            | `#87867f`（`--g500`）；次要文字 `#3d3d3a`（`--g700`） |
| accent（強調 1～2 處）      | `#eb6c36`            | `#d97757`（`--clay`）；深一階 `#b85c3e`               |
| accent 淡底                 | —                    | `#fbe9df`（`--accent-soft`）                          |
| hairline（分區線、分隔）    | `rgba(45,49,66,.10)` | `#d1cfc5`（`--g300`）                                 |
| link-blue（HTTP／外部呼叫） | `#2e5aa8`            | 可保留 `#2e5aa8`，或一律用 muted                      |

**字型**：不寫 `font-family` 屬性，靠頁面 CSS 繼承（`svg text{font-family:var(--sans)}`；技術字用 class 切 `var(--mono)`）。上游範例裡的 Geist／Google Fonts 全部拿掉。
**字級**：節點名 13px 600、次要 12px、箭頭標籤 12px。**中文一律 ≥12、不 uppercase、不加字距**；上游的 7／8／9px 只給純拉丁等寬字（埠號、代碼），多半也不需要。
**強調色**：1～2 處，給「這次改的」「該注意的」（錯誤態、瓶頸、新加的格子）。五個節點都塗＝沒有訊號。

**AI slop 特徵，看到就改**：每個節點長得一樣、圖例飄在圖裡、標籤沒遮罩、`writing-mode` 直排字、陰影、`rounded-2xl` 大圓角、深色底加螢光、照抄 Mermaid 的自動排版。

---

## 6. SVG 起手片段

### 6.1 放進頁面的殼

```html
<div class="figure">
  <!-- overflow-x:auto；窄螢幕橫向捲動、不縮字 -->
  <svg
    class="vb1000"
    viewBox="0 0 1000 520"
    role="img"
    aria-labelledby="<slug>-title <slug>-desc"
  >
    <title id="<slug>-title">一句話標題</title>
    <desc id="<slug>-desc">兩句話講圖裡的流向（螢幕閱讀器用）。</desc>
    <defs><!-- marker 見 6.2 --></defs>
    <rect width="100%" height="100%" fill="#faf9f5" />
    <!-- z-order：背景 → 分區 → 箭頭 → 標籤 → 節點 → 圖例 -->
  </svg>
</div>
```

```css
.figure {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  background: var(--ivory);
  border: 1px solid var(--g300);
  border-radius: 10px;
}
.figure svg {
  display: block;
  width: 100%;
  height: auto;
}
svg.vb1000 {
  min-width: 1000px;
} /* 等於 viewBox 寬；超寬圖可退到 0.85 倍 */
/* 窄圖（viewBox 寬 < 800，如三段直落的流程圖）不要套 vb1000 被拉寬放大字級：
   改 svg{max-width:<viewBox寬>px;min-width:<viewBox寬>px;margin:0 auto} 置中 */
svg text {
  font-family: var(--sans);
  font-size: 12px;
  fill: var(--g700);
}
svg text.n {
  font-size: 13px;
  font-weight: 600;
  fill: var(--slate);
}
svg text.mono {
  font-family: var(--mono);
}
svg text.accent {
  fill: var(--clay-d);
}
```

viewBox **先排版、後定框**：內容排完取 bbox，寬高進位到 4 的倍數，每邊 +40，底部有圖例再 +60。不要先挑寬度再把內容塞進去——超出 viewBox 的部分是靜默裁切。

### 6.2 箭頭 marker（三個一次定義，id 加 slug 前綴）

```svg
<marker id="<slug>-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#87867f"/></marker>
<marker id="<slug>-arrow-accent" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#b85c3e"/></marker>
<marker id="<slug>-arrow-open" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polyline points="0 0, 8 3, 0 6" fill="none" stroke="#87867f" stroke-width="1.2"/></marker>
```

實線 muted＝一般；accent＝主線／本次重點（≤2）；虛線 `5,4`＝回傳、非同步、可選、回頭路；open 箭頭只給 fire-and-forget。**箭頭先畫、節點後畫**。

### 6.3 節點框

```svg
<!-- 一律包 <g class="node" data-id data-kind data-title>：這是探索層（§6.7）與線端點檢查的身分標記，
     不掛探索層也照寫（成本零、之後要掛不用回頭改）。rect 加 class="box"。 -->
<g class="node" data-id="<id>" data-kind="ours" data-title="節點名" transform="translate(X,Y)">
  <rect class="box" width="140" height="64" rx="6" fill="#ffffff" stroke="#87867f"/>
  <text x="70" y="20" class="n" text-anchor="middle">節點名</text>
  <text x="70" y="37" text-anchor="middle">補充一</text>
  <text x="70" y="52" text-anchor="middle">補充二</text>
</g>
<!-- 強調：fill="#fbe9df" stroke="#d97757" stroke-width="1.5" -->
```

**節點類型 → 外觀**（避免「每個節點長得一樣」；上游 §5 對照，換成本機 token）：

| 類型 | fill | stroke | 備註 |
|---|---|---|---|
| 一般內部元件／步驟 | `#ffffff` | `#87867f` | 預設 |
| 強調（本次改的、該注意的） | `#fbe9df` | `#d97757` 1.5 | ≤2 個 |
| 外部系統／第三方 | `rgba(20,20,19,.03)` | `rgba(20,20,19,.30)` | 淡底淡框 |
| 資料存放（DB／queue／檔案） | `#ffffff` | `#141413` | 可加左上角型別標籤 `DB` |
| 可選／未來／停用 | `#ffffff` | `#87867f` dashed `4,3` | |
| 葉節點／終端 | `rgba(20,20,19,.05)` | `#87867f` | |

用半透明 fill 時，底下先墊一層不透明 paper `<rect>`，否則箭頭會透過來。

寬度要裝得下最長那行：中文 12px 約 12px/字、13px 600 約 13.5px/字，左右各留 ≥8。**三行是上限**，塞不下就拆節點或縮短字。

### 6.4 連線路徑

```svg
<!-- 同軸：直線 -->
<path d="M x1,y H x2" marker-end="url(#<slug>-arrow)"/>
<!-- 右＋下、兩折：mid=(x1+x2)/2 -->
<path d="M x1,y1 H mid-8 Q mid,y1 mid,y1+8 V y2-8 Q mid,y2 mid+8,y2 H x2"/>
<!-- 主要是上下走、一折 L 形：從來源側邊水平出、轉角、垂直進目標的底邊／頂邊（目標在上方時 y_dst 是它的底邊）-->
<path d="M x1,y_src H x2-8 Q x2,y_src x2,y_src-8 V y_dst"/>
<!-- 交叉跳線：在較不重要那條、交叉點 cx 處加弧 -->
<path d="M x1,y H cx-8 a 8,8 0 0,1 16,0 H x2"/>
```

每條線包 `<g class="edge" data-from="<id>" data-to="<id>" data-label="標籤字">`，裡面先放一條透明寬線當點擊區、再放正式線：

```svg
<g class="edge" data-from="a" data-to="b" data-label="交給 Build">
  <path class="hit" d="…同一條 d…" fill="none" stroke="transparent" stroke-width="14"/>
  <path class="ln"  d="…" fill="none" stroke="#87867f" stroke-width="1.4" marker-end="url(#<slug>-arrow)"/>
</g>
```

`data-from`／`data-to` 必須指到存在的 `data-id`（`svg-text-check.mjs` 會驗）。標籤字要跟 §6.5 那組 `<g class="elabel">` 的文字完全一致，探索層才能一起點亮。

所有 `<path>` 共同屬性：`fill="none" stroke="#87867f" stroke-width="1.4"`（本機統一值；上游架構例 1.2、虛線 1，虛線 pattern 本機統一 `5,4`、上游架構用 `4,3`——都是刻意的單一化，不是抄錯）。主要垂直位移時從上／下邊出入，不要從側邊「戳進」節點面。

### 6.5 箭頭標籤（遮罩＋間隙）

```svg
<!-- 水平線在 y=ARROW_Y：遮罩底邊在 ARROW_Y-6 以上；整組包 <g class="elabel"> -->
<g class="elabel">
<rect x="MID_X-30" y="ARROW_Y-22" width="60" height="16" fill="#faf9f5"/>
<text x="MID_X" y="ARROW_Y-10" text-anchor="middle">標籤</text>
</g>
<!-- 垂直線在 x=ARROW_X：標籤放右側，遮罩左邊在 ARROW_X+6 以右 -->
<rect x="ARROW_X+6" y="MID_Y-8" width="W" height="16" fill="#faf9f5"/>
<text x="ARROW_X+10" y="MID_Y+4">標籤</text>
```

遮罩寬度 = 字寬 + 8。標籤要落在穿過空白的線段上（規則 6）。**線段長度 < 標籤寬 + 16 時不要硬放**：把兩端節點拉開，或標籤改掛在端點旁（節點外側、起點環／終點環下方），否則遮罩會被兩側後畫的節點蓋掉半截。

### 6.6 分區（架構／部署）與圖例

```svg
<!-- 分區：畫在箭頭之前 -->
<rect x=".." y=".." width=".." height=".." rx="8" fill="rgba(20,20,19,0.02)" stroke="#d1cfc5" stroke-dasharray="4,4"/>
<rect x="label_x" y="y+4" width="label_w" height="14" fill="#faf9f5"/>
<text x="label_x+4" y="y+15" class="mono" style="letter-spacing:.1em">FRONTEND</text>
<!-- 圖例：所有節點之後、圖的最底下一條，永遠不放進圖區 -->
<line x1="30" y1="LEGEND_Y-8" x2="W-30" y2="LEGEND_Y-8" stroke="#d1cfc5" stroke-width=".8"/>
<text x="30" y="LEGEND_Y+8" class="mono" style="letter-spacing:.14em;fill:#87867f">LEGEND</text>
```

分區內第一個節點上方留 ≥16px 給區名；最多 3 區，再多就該用泳道。圖例每一項包 `<g class="lg" data-kind="<kind>">`（跟節點的 `data-kind` 對得上），探索層才能點圖例藏一類。

### 6.7 探索層（選配）

一段共用的 CSS＋JS，疊在已畫好的 SVG 上，讓讀者**點一格只看相連的、沿箭頭追到底、shift 點兩格找最短路徑並編號、切作者寫好的章節視角**；網址 `#focus=<id>`／`#route=<a>~<b>`／`#view=<id>` 可直接貼給人。設計取捨：只取這四種互動，不做完整的圖表檢視器——搜尋、縮放平移、匯出圖片對一張看得完的圖沒有生產者。

**掛載條件**：圖有分支／交接／回頭路，**且節點 ≥6**。三格直線鏈、單純分層圖不掛——沒東西可探索的圖掛互動是「強迫互動」。一頁多張圖時只挑最需要追線的那一張掛；深連結只作用在第一張。

**怎麼掛**（作者只做這四步，側欄與章節按鈕由腳本自己建）：

```html
<div class="xp" data-explore>
  <div class="figure"><svg class="vb1000 xplore" viewBox="…">…§6.1～6.6 照畫，節點／線／標籤／圖例都帶身分標記…</svg></div>
  <!-- 選配：這張圖有兩種以上讀法才寫；每章 3～6 格、一句 note 講這章看什麼 -->
  <script type="application/json" class="xp-views">
  [{"id":"main","label":"① 主線","focus":["a","b","c"],"note":"…"},
   {"id":"gate","label":"② 閘那一段","focus":["c","d"],"note":"…"}]
  </script>
</div>
```

1. 把 `assets/diagram-explore.css` 全文貼進頁面 `<style>`、`assets/diagram-explore.js` 全文貼進 `</body>` 前的 `<script>`（不外連、不改內容）。貼進去後 `grep -c '</script>'` 應該只多 1：內嵌腳本本文若出現 script 結尾標籤字樣會被瀏覽器提前切斷、整層靜默失效（0906 第一次接就撞到，`verify.py` 的「腳本無法解析」會抓）。
2. `svg` 加 class `xplore`，外面包 `<div class="xp" data-explore>`。
3. 節點 `g.node[data-id][data-kind][data-title]` 含 `rect.box`；線 `g.edge[data-from][data-to][data-label]` 含 `path.hit`＋`path.ln`；標籤 `g.elabel`；圖例 `g.lg[data-kind]`（§6.3～6.6 的片段已含）。
4. 章節 JSON 選配。`data-title` 是側欄顯示名，寫節點第一行字。

**刻意不做**：搜尋、縮放平移、深色主題、匯出圖片、播放動畫——圖 ≤12 格一眼看得完，這些沒有生產者。**嵌在會剝掉 script 與 data-* 的 sandbox 環境時不適用**。

---

## 7. 各型畫法慣例

### 7.1 架構 Architecture

- 依層或信任邊界分區（前端→後端→資料；公開→私有）；主流向左→右或上→下，選一個守住。
- 1～2 個強調節點：主要整合點、主要資料庫、關鍵判斷點。
- 虛線分區框標記 VPC／信任區，區名放在框線上的遮罩裡。
- 虛線路徑（可選、回傳、非同步）走同一套正交規則，只是語意較輕、交叉時它讓路。

### 7.2 流程圖 Flowchart

- **形狀表示類型，不用顏色**：橢圓 `rx=20` 起／迄；矩形 `rx=6` 動作；菱形判斷（≤3 個出口）；實心小點 `r=4` 分支匯合。
- 上→下；菱形出口慣例「是」往右、「否」往下，但每條出口都要標。
- 強調色給主線（happy path）或最關鍵的那一個判斷，不是每個判斷。
- 四個以上出口的菱形 → 拆成巢狀菱形。

### 7.3 時序 Sequence

- 參與者橫排在頂端；生命線為虛線垂直往下；訊息是水平箭頭，時間上→下。
- 啟動條：生命線上的細長矩形（w=8）標示持有控制權的區間，巢狀呼叫可疊。
- 訊息四種：同步呼叫＝實線填實箭頭；**回傳＝虛線填實箭頭（絕不實線）**；非同步＝虛線 open 箭頭；主線成功回應＝實線 accent（≤2）。
- 分支（token 有效／無效、重試、可選步）用 **組合片段框** `alt`／`opt`／`loop`：框只跨參與的生命線，左上角小標籤寫運算子，守衛 `[條件]` 放標籤下；`alt` 最多兩區、虛線分隔。不要自己發明散落的 if/else 箭頭群。
- 片段框排版：框左右各超出參與的生命線 ≥12px；訊息之間 ≥24px；守衛到第一則訊息 ≥24px；`alt` 分隔線上下各留 16px；標籤不可蓋到別條生命線。
- 生命線 ≤5、片段 ≤1（兩個只准都是單區）、巢狀 ≤1。
- **有分支的時序**：整包的 `assets/example-sequence.html` 是無分支 happy path，不夠用——改讀 `references/type-sequence.md` 的「Combined fragments」段＋ `assets/example-sequence-oauth.html`（含 alt 片段）。

### 7.4 狀態機 State

- 狀態＝圓角矩形 `rx=8`；起點＝實心點 `r=6`；終點＝環點（外圈 `r=8` 描邊＋內圈 `r=5` 實心）。
- 轉移標籤格式 `事件 [守衛] / 動作`，用不到的段省略；**每條轉移都要標**，這是狀態機存在的理由。
- 自迴圈畫在狀態上方（或下方）的小 U 形；沿主流向排（左→右或上→下），交叉前先重排。
- 「任何狀態 → 錯誤」不要從每個狀態各畫一條，改一條註解 `* → Error on timeout`。
- 轉移數 > 狀態數 × 2 → 多半是兩個狀態機。強調色給該注意的狀態（錯誤態或完成態）。

### 7.5 泳道 Swimlane

- 一道＝一個執行者／團隊，道名放左邊界（或頂端）用 mono 小字；道與道之間 1px 細線。
- 步驟放在做它的那一道裡；**跨道的箭頭是最重要的邊**，把最耦合或最耗時的那條交接塗 accent。
- 不要強求每道步數相等，一道只有一步很正常；步驟跨兩道＝沒決定誰負責，選一個。
- 箭頭來回蛇行 → 重排步驟讓主流向大致直行。道數 ≤5，多了先按「誰做」而非「哪個階段」合併。
- **欄距**：一般欄距 ≥24；**有分岔的欄（一個節點往兩道出）欄距 ≥80**，否則兩折路徑的垂直段貼著下一欄節點、標籤沒地方放。
- **道名欄 ≥140px**（mono 11px 約 6.6px／字、中文 12px 約 12px／字），放不下就拆兩三行，不要縮字。
- 上游 `example-swimlane.html` 的跨道交接畫成斜線，**不要抄**；跨道一律照 §3 規則 1 走正交圓角。

### 7.6 時間軸 Timeline

- 中央一條水平細線；刻度標時間邊界（季、月、sprint），日期 mono 放線下。
- 事件＝線上實心小圓 `r=4`，標籤上下交錯避免撞、用 1px 細線連到圓；里程碑＝accent 圓 `r=6` ＋粗體標籤。
- **時間刻度要誠實**：間隔不等就不等距畫；太密的區段明顯斷軸，不為了好看假裝線性。

### 7.7 分層 Layers

- 全寬矩形垂直堆疊，4～6 層，同 x 同寬，層高 56～72。
- 每列左→右：索引標籤（`L3`／`APPLICATION` mono 小字）、層名（本機 13～15px 600；上游 14～16）、右側備註（mono）。
- 層間 1px 細線；填色二選一：交替淺色或全 paper 只靠線，選一個守住。
- 左側外緣放方向指示（`抽象 ↑`／`封包 ↓`）；強調色只給一層（瓶頸、正在討論的那層）。

### 7.8 樹 Tree

- 根在上、子往下（或根在左）；節點小矩形 `rx=6`，寬 120～180、高 40～52，寬度最多兩種。
- **連線正交**：父節點往下一小段、水平匯流排連兄弟、每個子節點從頂邊短垂直進入；1px muted。
- 深度 ≤4、每層 ≤5；強調色給根**或**關鍵葉子，不兩者都給；不跳層。

### 7.9 依賴圖 Dependency

- 只在**有多父或有環**時用，否則是樹。按依賴深度分層排列：沒人依賴的入口在頂層，越深越下，層距 120。
- 每個節點右上角放 fan-in 徽章（`4 in`），最高的那個就是這張圖的故事。
- **最多一條逆向邊**（環）：accent 虛線 `5,4`、繞外側走、可見端放 `CYCLE` 標籤；這條邊與它的標籤就是全部的強調色，節點本身不塗。
- 外部套件用淡底＋淡描邊；葉節點淡底 muted 描邊；版本／來源放 mono 副標。超預算把一群葉子合成 `+6 leaves` 一個節點並在說明註明。

### 7.10 部署 Deployment

- 三層包含：**區**（環境或網路邊界，虛線 `4,4` 大框、區名左上）→ **基礎設施節點**（主機／pod／受管服務，左上角矩形型別標籤 `POD`／`VM`／`MANAGED`）→ **產物晶片**（24px 高小矩形，服務名＋右對齊版本 mono）。
- 副本數用右上角徽章 `x3`，不要一顆副本畫一個節點。
- 網路路徑標協定與埠 `HTTPS:443`；跨區路徑 link-blue、區內 muted、複寫／非同步虛線。
- 看不到「放在哪、幾份、什麼版本」的決定 → 不是部署圖，用架構圖。區 ≤3、節點 ≤6、路徑 ≤8。

### 7.11 ER 資料模型

- 實體＝兩段框：表頭（型別標籤＋實體名）、內文（欄位一行一個 mono；PK 前綴 `#`，FK 前綴 `→`）。
- 關係線兩端標基數 `1`／`N`／`0..1`／`1..*`（mono，離實體邊 10～12px），可加關係名置中。
- 相關實體靠近擺、讓多數關係是直線；強調色給聚合根。實體 ≤8；幾十個 FK 不要每條都畫，改按叢集排。
- 要畫真正的資料表（SQL 型別、索引、欄位對欄位 FK）用整包的 `type-db-schema.md`。

### 7.12 甘特 Gantt

- 左欄任務名（180px），右側時間軸左→右；列高 40、條高 24；時間刻度 mono 放第一列上方，下方一條細線。
- 階段用淡色分區框包住該階段的列，區名放左上。
- **只有一條強調色 bar**（關鍵交付或關鍵路徑），其餘 muted 15% 填色；今天／里程碑用 muted 垂直虛線。
- 任務 ≤12、每階段平行軌 ≤5；起迄日期放軸上不放 bar 內；v1 不畫任務相依箭頭。

---

## 8. 按需深讀整包（`diagram-design` skill 目錄）

| 情境                                                         | 讀什麼                                                                                                                | 為什麼值得多花這些 token                                          |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 選定圖型後、動筆前 | `assets/example-<type>.html`（只讀 minimal light 那份，不讀 `-dark`／`-full`／`-terminal`／`-animated`） | 完整座標範例；照著抄幾何比自己算穩，尤其 Opus／Sonnet 產頁時。⚠️ **範例只抄版面與節點，連線幾何以 §3 為準**——上游 `example-swimlane.html` 的兩條跨道交接是斜線（違反規則 1），照抄會不及格 |
| 內容是「行為」：瓶頸、分岔比較、信任邊界、控制目錄、防線互補 | `references/semantic-patterns.md`                                                                                     | 從「畫結構」升到「畫行為」，pattern 規定必畫元素與靜態退化方式    |
| 讀者要「一步一步看」／逐步高亮                           | `references/animation.md` ＋ `assets/template-motion.html`                                                            | 本機沒有 sanitizer，step-through 控制腳本可用；靜態幀仍要資訊完整 |
| 架構圖要認得出的元件圖示                                     | `references/primitive-icons.md`（依 `### 名稱` 找，整段 `<svg>` 貼進去、只加 x/y、一律 24×24、顏色走 `currentColor`） | 一眼認出 Postgres／Redis／Docker                                  |
| 本檔沒列的 27 型                                             | 整包 `SKILL.md` §3 表 → 對應 `references/type-*.md`                                                                   |                                                                   |

**不要讀**：`onboarding.md`／`profiles.md`／`style-guide.md`（顏色用 §5 對照表）、`import-*.md`、`export.md`、`doctor.md`、`scripts/`、`assets/icons.html`（給人看的圖庫頁，含 Google Fonts）。

---

## 9. 畫完自檢（open 前過一遍）

1. 每條連線：正交？轉角有圓弧？沒有斜線？
2. 每個標籤：有遮罩？離線 6～10px？沒壓到節點？
3. 同一邊多條線各有接點、相鄰 ≥12px？沒有兩條線疊在一起？交叉處有跳線？
4. 節點 ≤9、強調色 ≤2、箭頭數在**該型預算**內（一般 12、依賴圖 14、部署 8，見 §4）？超了有沒有拆圖？
4b. 有沒有線穿過不相干的框（規則 5）？躲不開的那條改虛線、標籤放可見端了嗎？
5. 每個節點最長那行放得進框？（中文 12px/字估）viewBox 是排完才定的？
6. 中文字級 ≥12？沒有 `font-family` 屬性、沒有字面 Geist／Google Fonts？
7. `<title>`／`<desc>` 有寫？marker／mask 的 id 有 slug 前綴？
8. 圖例在圖區外的最底下？圖旁有一句話說明假設（若跳過了確認步驟）？
9. 節點都是 `g.node[data-id]`、線都是 `g.edge[data-from][data-to]`、端點都指到存在的 id？（`svg-text-check.mjs` 會驗）有分支且 ≥6 格的圖掛了探索層（§6.7）、直線鏈沒掛？掛了就用 playwright 點一格看有沒有變淡、console 零錯誤。

`verify.py` 的版面健檢對 SVG 文字會誤報「被切掉」（它拿 `scrollWidth` 量 SVG 元素，數字沒意義）；**真正的檢查是第 5 條**——跑 `node <本 skill 目錄>/scripts/svg-text-check.mjs <file.html>`：對每段 `<text>` 用 `getBBox()` 比 viewBox 與它前一個兄弟 `<rect>`（遮罩或節點框），列出超出的。SVG 在 390／768px 報「凸出視窗」是 `.figure` 受控橫向捲動、屬預期。
