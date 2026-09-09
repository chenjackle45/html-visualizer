# Test fixtures

Two deliberately-broken pages used to check that `skills/html-visualizer/scripts/verify.py`
actually reports problems instead of silently passing.

| File | What it is for |
|---|---|
| `no-style-test.html` | Has an inline `<script>` referencing a missing element id, and **no** inline `<style>`. Guards the regression where the JS element-id check only ran when a `<style>` block was present, so pages laid out purely with a CDN framework passed while broken. |
| `lopsided-table-test.html` | A comparison table whose last column is `white-space: nowrap`. At 768px and 1440px the layout check must report the nowrap cell and the squeezed neighbour columns (a column ≥12 chars average, narrower than 8em, stacked ≥6 lines while another column is ≥2.5× wider). Guards the table-balance check added after a page passed every check yet rendered two columns at three characters per line. |
| `svg-layout-test.html` | Contains an oversized SVG diagram. Guards the SVG handling in the layout check: the whole `<svg>` may legitimately overflow inside a scroll container, but its `<text>` nodes must not be reported as clipped. |

Run them by hand after changing anything under `scripts/`:

```
python3 ../../skills/html-visualizer/scripts/verify.py no-style-test.html --no-layout
node ../../skills/html-visualizer/scripts/layout-check.mjs svg-layout-test.html
node ../../skills/html-visualizer/scripts/layout-check.mjs lopsided-table-test.html
```

Expected: the first reports the missing element id; the second reports the SVG overflow
but no clipped text; the third reports the nowrap cell plus at least one squeezed column at 768px and 1440px. There is no automated runner — these are three manual checks.
