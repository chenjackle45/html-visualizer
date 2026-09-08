#!/usr/bin/env bash
# 輸出當前 session 的人可讀標籤 + 短 id（給 HTML 標題與徽章用）
# 用法：eval "$(<skill 目錄>/scripts/session-label.sh)"  → $VT_LABEL / $VT_ID
set -uo pipefail

short_id="${CLAUDE_CODE_SESSION_ID:-}"
short_id="${short_id%%-*}"
[ -z "$short_id" ] && short_id="local"

label=""
# ① 背景 job：job 清單上顯示的名字（最貼近「這是哪個 session」）
if [ -n "${CLAUDE_JOB_DIR:-}" ] && [ -f "$CLAUDE_JOB_DIR/state.json" ]; then
  label=$(python3 -c "
import json,sys
try:
    d=json.load(open('$CLAUDE_JOB_DIR/state.json'))
    print((d.get('name') or '').strip())
except Exception:
    pass
" 2>/dev/null)
fi
# ② worktree：分支名比目錄名有資訊
if [ -z "$label" ]; then
  branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)
  case "$PWD" in
    */.claude/worktrees/*) label="${branch:-$(basename "$PWD")}" ;;
  esac
fi
# ③ 一般 session：專案名（+ 非主線時附分支）
if [ -z "$label" ]; then
  root=$(git rev-parse --show-toplevel 2>/dev/null || echo "$PWD")
  label=$(basename "$root")
  branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)
  case "$branch" in
    main|master|"") ;;
    *) label="$label · $branch" ;;
  esac
fi

# 來源專案（給索引頁分組用；AI 判斷不對時可自行覆寫）
project=$(basename "$(git rev-parse --show-toplevel 2>/dev/null || echo "$PWD")")
project="${project#.}"   # .claude → claude

printf 'VT_LABEL=%q\n' "$label"
printf 'VT_ID=%q\n' "$short_id"
printf 'VT_PROJECT=%q\n' "$project"
