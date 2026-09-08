# @unovis API Cheat-Sheet（vanilla + Vue，本檔已實機驗證渲染）

> 來源：context7 `/websites/unovis_dev` + 2026-06 實機在瀏覽器逐張驗證渲染。
> 圖庫只用 @unovis 一個，不混第二個 chart library。

## 0. 載入方式

| 情境 | 載入 |
|---|---|
| 獨立 HTML（demo / 分享 / prototype） | `import { ... } from 'https://cdn.jsdelivr.net/npm/@unovis/ts/+esm'`（jsdelivr `/+esm` 會把 d3 一起 bundle，免裝） |
| 專案內 Vue（Nuxt / shadcn-vue） | `@unovis/vue` + `@unovis/ts`（`pnpm add @unovis/vue @unovis/ts`）；專案若有 `app/components/ui/{chart,chart-*}` 封裝層，優先複用 |

## 1. 核心結構

```ts
import { XYContainer, StackedBar, GroupedBar, Line, Axis, SingleContainer, Donut, CurveType } from '@unovis/ts'

// XY 圖（柱 / 折線 / 區域）：容器 + components[] + xAxis/yAxis
new XYContainer(node, {
  height: 240,
  components: [ /* StackedBar / GroupedBar / Line ... 可多個疊在一起 */ ],
  xAxis: new Axis({ type: 'x', tickFormat, numTicks, gridLine: false, tickLine: false, domainLine: false }),
  yAxis: new Axis({ type: 'y', tickFormat, gridLine: true,  tickLine: false, domainLine: false }),
}, data)

// 單值圖（甜甜圈 / 圓餅）：容器 + component（單數）
new SingleContainer(node, { height: 240, component: new Donut({ value: d => d.value }) }, data)
```

- `data` 是第三個參數（不是 config 內）。
- accessor 慣例：`x: (_d, i) => i`（用序號當 X），`tickFormat: i => labels[i]`（軸文字查表）。
- 多系列：`y: [d => d.a, d => d.b, ...]`，`color: (d, i) => palette[i]`。
- 顏色：單色給字串，多系列給 accessor `(d,i)=>...` 或陣列。

## 2. 各圖型最小可用配置（已驗證渲染）

```ts
const x = (_d, i) => i

// ① 單系列柱
new StackedBar({ x, y: d => d, color: C.indigo, roundedCorners: 4, barPadding: 0.32 })

// ② 多系列折線（實線 + 虛線）
new Line({ x, y: d => d.cur,  color: C.indigo, lineWidth: 2.5, curveType: CurveType.MonotoneX })
new Line({ x, y: d => d.prev, color: C.slate,  lineWidth: 2, lineDashArray: [6,4], curveType: CurveType.MonotoneX })

// ③ 分組柱（並排）
new GroupedBar({ x, y: [d=>d.actual, d=>d.target], color:(d,i)=>[C.indigo,C.gold][i], roundedCorners:4, barPadding:0.18, groupPadding:0.28 })

// ④ 堆疊柱（多系列一個 StackedBar）
new StackedBar({ x, y: [d=>d.a, d=>d.b, d=>d.c, d=>d.d], color:(d,i)=>palette[i], roundedCorners:3, barPadding:0.32 })

// ⑤ 柱+折線 combo（同單位、共用 Y）—— 同個 components[] 放兩個元件即可
components: [
  new StackedBar({ x, y: d=>d.actual, color: C.indigo, roundedCorners: 4, barPadding: 0.34 }),
  new Line({ x, y: d=>d.target, color: C.amber, lineWidth: 2.5, lineDashArray:[6,4], curveType: CurveType.MonotoneX }),
]

// ⑥ 甜甜圈
new Donut({ value: d=>d.value, color: d=>d.color, arcWidth: 42, cornerRadius: 4, padAngle: 0.02 })
// 中央數字：用 CSS 絕對定位疊一個 div 在容器上（比 Donut centralLabel 好控版）

// ⑦ 雙面板（不同單位）—— 兩個獨立 XYContainer，上面板隱藏 X 文字避免重複
// 上：new XYContainer(a, { xAxis: xAxis({ tickFormat: () => '' }), ... })
// 下：new XYContainer(b, { xAxis: xAxis(), ... })
```

## 3. Vue（`@unovis/vue`）對應寫法

vanilla 的 `new Line({...})` ⇄ `<VisLine />`；config 變 props。

```vue
<script setup lang="ts">
import { VisXYContainer, VisStackedBar, VisLine, VisAxis } from '@unovis/vue'
import { CurveType } from '@unovis/ts'
const x = (_d, i) => i
</script>
<template>
  <VisXYContainer :data="data" :height="240">
    <VisStackedBar :x="x" :y="(d)=>d.actual" :color="'#2D4F8E'" :rounded-corners="4" :bar-padding="0.34" />
    <VisLine :x="x" :y="(d)=>d.target" :color="'#C9740A'" :line-width="2.5" :line-dash-array="[6,4]" :curve-type="CurveType.MonotoneX" />
    <VisAxis type="x" :tick-format="(i)=>labels[i]" :grid-line="false" :tick-line="false" :domain-line="false" />
    <VisAxis type="y" :grid-line="true" :tick-line="false" :domain-line="false" />
  </VisXYContainer>
</template>
```

> 專案若已有封裝層（例：`app/components/ui/{chart,chart-*}`（BarChart / LineChart / chart legend 等）。專案內做圖**優先複用這層**，不要每次重抄 VisXYContainer。

## 4. 踩過的坑（血淚，務必記住）

| 坑 | 真相 / 解法 |
|---|---|
| **量到「沒渲染」(rects:0)** | @unovis 的**柱是 `<path class="...-bar">` 不是 `<rect>`**！折線也是 `<path>`。數 `<rect>` 永遠以為沒畫。要驗就數 `path[class*="bar"]` / `path[class*="line"]` / donut `path[class*="segment"]`。 |
| **進場動畫時序** | 建好後標記不會同步出現（有 ~600ms 動畫）。量渲染前 `await sleep(1200)`；首次載 CDN 再多等。 |
| **折線砸到地板** | @unovis 把 `null` 當數值 0 → 線直接掉到 0。要斷線：accessor 回傳 `undefined`（不是 null/0）。 |
| **雙軸陷阱** | 不同單位（萬元 vs 倍數）**不要**塞兩條 Y 軸（刻度可被任意拉伸＝會誤導）。改用上下雙面板共用 X 軸（見 ⑦）。 |
| **同單位 combo 是正當的** | 同單位的「目標 vs 實際」柱+折線疊在同個 components[] 共用一條 Y 軸 —— 這不算雙軸、是對的。 |
| **軸樣式別逐圖寫** | 統一走 `--vis-axis-*` CSS 變數（見 tokens.css），一次設定全圖一致。 |
| **file:// 開不起來** | 某些自動化導航會把 `file://` 改成 `https://`。驗證用本機 server：`cd <dir> && python3 -m http.server 8848` 再開 `http://localhost:8848/xxx.html`。雙擊開 file:// 通常可以（ESM 從 https CDN import 允許），但若空白就改走 localhost。 |

## 5. 常用 props 速查

- **XYContainer**：`height` `width` `margin` `xDomain` `yDomain` `duration`（動畫毫秒）
- **StackedBar / GroupedBar**：`x` `y`(單 or 陣列) `color` `roundedCorners`(數字) `barPadding`(0~1) `groupPadding`(分組用) `barWidth` `barMaxWidth`
- **Line**：`x` `y`(單 or 陣列) `color` `lineWidth` `lineDashArray`([實,空]) `curveType`(`CurveType.MonotoneX` 平滑)
- **Donut**：`value` `color` `arcWidth` `cornerRadius` `padAngle` `centralLabel` `centralSubLabel`
- **Axis**：`type`('x'|'y') `tickFormat` `numTicks` `gridLine` `tickLine` `domainLine` `label`
