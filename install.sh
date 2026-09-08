#!/usr/bin/env bash
# 把這三個 skill 裝進任何支援 skill 的 agent。
#
#   ./install.sh                 裝到 ~/.agents/skills（跨 agent 共通慣例）
#   ./install.sh --detect        掃機器上已存在的 agent skill 目錄，全部裝
#   ./install.sh --dir <path>    裝到指定目錄
#   ./install.sh --copy          用複製取代 symlink（預設 symlink，改了原始碼即時生效）
#   ./install.sh --uninstall     移除本腳本裝過的項目
#
# Claude Code 使用者建議改用 plugin 安裝（見 README），可以拿到版本管理與更新。
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/skills"
SKILLS=(html-visualizer chart diagram-design)

# 各家 agent 的 user-level skill 目錄。~/.agents 是多家共用的慣例路徑。
CANDIDATES=(
  "$HOME/.agents/skills"
  "$HOME/.claude/skills"
  "$HOME/.codex/skills"
  "$HOME/.cursor/skills"
  "$HOME/.cline/skills"
  "$HOME/.copilot/skills"
  "$HOME/.factory/skills"
  "$HOME/.kiro/skills"
  "$HOME/.config/opencode/skills"
  "$HOME/.pi/agent/skills"
)

MODE=link
ACTION=install
TARGETS=()

while [ $# -gt 0 ]; do
  case "$1" in
    --detect)
      for d in "${CANDIDATES[@]}"; do
        [ -d "$(dirname "$d")" ] && TARGETS+=("$d")
      done
      shift ;;
    --dir) TARGETS+=("$2"); shift 2 ;;
    --copy) MODE=copy; shift ;;
    --uninstall) ACTION=uninstall; shift ;;
    -h|--help) sed -n '2,10p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "未知參數：$1（用 --help 看用法）" >&2; exit 2 ;;
  esac
done

[ ${#TARGETS[@]} -eq 0 ] && TARGETS=("$HOME/.agents/skills")

[ -d "$SRC" ] || { echo "找不到 skills 目錄：$SRC" >&2; exit 1; }

for target in "${TARGETS[@]}"; do
  mkdir -p "$target"
  for s in "${SKILLS[@]}"; do
    dest="$target/$s"
    if [ "$ACTION" = uninstall ]; then
      if [ -L "$dest" ]; then
        rm "$dest"; echo "移除 symlink  $dest"
      elif [ -d "$dest" ]; then
        echo "跳過（不是本腳本建的 symlink，請自行確認）  $dest" >&2
      fi
      continue
    fi
    if [ -e "$dest" ] && [ ! -L "$dest" ]; then
      echo "已存在同名目錄、不覆蓋：$dest" >&2
      echo "  要換成本版請先自行移除或改名。" >&2
      continue
    fi
    rm -f "$dest"
    if [ "$MODE" = copy ]; then
      cp -R "$SRC/$s" "$dest"; echo "複製  $dest"
    else
      ln -s "$SRC/$s" "$dest"; echo "連結  $dest -> $SRC/$s"
    fi
  done
done

if [ "$ACTION" = install ]; then
  echo
  echo "裝好了。重開 agent 或重新載入 skill 後即可使用。"
  echo "選配（真瀏覽器版面檢查）：npm i -D playwright && npx playwright install chromium"
fi
