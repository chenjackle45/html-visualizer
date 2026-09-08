# html-visualizer

> [繁體中文](README.md)

**Gets your AI to turn long answers into a readable web page instead of a wall of text.**

---

## What it fixes

You ask your AI something. It replies with three hundred lines of text. The content may be fine, but you have to scroll from top to bottom, and by the end you've forgotten the beginning.

With this installed, the same question gets you a web page: jump around with a table of contents, compare things side by side in a table, and see an actual diagram where a diagram belongs. You can also just hand the file to a colleague.

**No new commands to learn, and you don't change how you talk.** It shows up on its own when the answer is long. When you don't want it, say "just give me plain text".

---

## What that looks like

| You say | You get |
|---|---|
| "Summarize these meeting notes" | A summary page: conclusions up front, details grouped into sections, action items listed separately |
| "Teach me how this works" | A tutorial page: one line to define it, then an analogy, then a walkthrough, and finally when it stops applying |
| "Which of these approaches should I pick?" | A comparison page you can actually tick your answers on, then copy them in one click and paste back |
| "Put this plan in front of my boss" | A page for non-technical readers: top-down, with screen mockups, and the confusing technical bits hidden |
| "What's the trend in these numbers?" | A chart, not a pile of numbers |
| "Draw this process for me" | A flow diagram, with branches, handoffs and loops back |

---

## Install

**The easy way**: paste this URL to your AI and tell it "install this for me".

```
https://github.com/chenjackle45/html-visualizer
```

That's it. It reads the instructions and puts everything in the right place. When it's done, tell it to reload, or just restart.

Works with Claude Code, Codex, Cursor, Cline, GitHub Copilot, OpenCode and others — anything that understands skills.

<details>
<summary>If you'd rather do it yourself</summary>

**Claude Code** has a built-in package manager:

```
/plugin marketplace add chenjackle45/html-visualizer
/plugin install html-visualizer@chenjackle45
```

Check with `/plugin list`. Update with `/plugin update html-visualizer@chenjackle45`, remove with `/plugin uninstall html-visualizer@chenjackle45`.

**Everything else** — clone it and run the installer:

```
git clone https://github.com/chenjackle45/html-visualizer.git
cd html-visualizer
./install.sh --detect
```

`--detect` finds the skill folders your AI tools already use and installs into all of them. Other options:

| Command | What it does |
|---|---|
| `./install.sh` | Installs to `~/.agents/skills/` (shared by several tools) |
| `./install.sh --dir <path>` | Installs to a folder you name |
| `./install.sh --copy` | Copies instead of symlinking |
| `./install.sh --uninstall` | Removes it |

To update, run `git pull` in the cloned folder — no reinstall needed.

Needs `python3` (3.8 or newer) on your machine.

</details>

---

## Using it

**Just talk normally.** All of these work:

- "Turn this into a report"
- "Give me a version I can show people"
- "List some options for me to pick from"
- "Explain this to me"
- "Draw this process"

If it doesn't kick in, just say "make this a web page".

Pages open in your browser automatically and are saved to `~/Documents/claude-html/`, with an index so you can find "that one from last week".

---

## Common questions

**My AI doesn't seem to know about it.**
Restart, or tell it to reload its skills.

**The answer is still a wall of text.**
Short answers deliberately don't trigger it — you don't want a web page for a one-liner. Just say "make this a web page" if you want one.

**A check says "unverified" — is something broken?**
No. Before showing you a page it checks the layout isn't broken, and that step needs an extra browser tool. Without it the check says "unverified", meaning "not checked" — not "something's wrong". To install it: `npm i -D playwright && npx playwright install chromium`.

---

<details>
<summary>Technical detail: what this actually does</summary>

Three skills working together:

| Skill | Role |
|---|---|
| `html-visualizer` | The entry point. Picks a layout, builds the page, runs the self-check, opens it |
| `chart` | Data charts, drawn with `@unovis`, sharing one palette across chart types |
| `diagram-design` | Structure diagrams as hand-laid SVG. A fork of [cathrynlavery/diagram-design](https://github.com/cathrynlavery/diagram-design) v2.6 |

**Why not just ask the AI for HTML**: because AI-generated HTML fails silently, and the AI can't see it. So a self-check runs before the page reaches you. Every item maps to a real incident:

| Check | The incident it prevents |
|---|---|
| Syntax-check every script, confirm the elements it reaches for exist | A copy button that did nothing at all, because one newline character broke the whole script |
| Parse every stylesheet, catch stray or unterminated braces | A page with no styling whatsoever, because the CSS was cut mid-rule. Braces had been counted and matched exactly, so nothing looked wrong |
| Render at phone, tablet and desktop widths in a real browser | The same page looks fine on a desktop and spills off a phone |
| Four invisible failures: text squeezed into a vertical strip, elements flattened, contrast too low, content hidden behind something | A report passed every check, then came back with the text rendered one character per line |
| Consistency of the tick-box wiring | You answer everything and the copied summary silently drops three of them |

**Cross-tool**: nothing is vendor-locked. The skill config uses only the two most common fields, and the scripts need just `python3` plus optional `node`. For the session label it tries environment variables, then the Git branch, then the folder name. To open a page it uses a browser tool if there is one, otherwise the system opener, and failing that it just tells you where the file is.

**Settings**:

| Environment variable | Effect |
|---|---|
| `HTML_VISUALIZER_ARCHIVE_DIR` | Where pages are saved (default `~/Documents/claude-html`) |
| `HTML_VISUALIZER_PLAYWRIGHT_ROOT` | Extra path to look for Playwright |

After installing, `skills/html-visualizer/references/examples/` has working examples you can open.

</details>

---

## Language

The skill instructions are written in Traditional Chinese (the author's working language). **Generated pages follow the language of your conversation** — chat in English and you get English pages.

## Author

Jackle Chen — [jackle.pro](https://jackle.pro/) · [@chenjackle45](https://github.com/chenjackle45)

Questions and suggestions: [open an issue](https://github.com/chenjackle45/html-visualizer/issues).

## Credits

- [diagram-design](https://github.com/cathrynlavery/diagram-design) by Cathryn Lavery — MIT. Icons: Tabler (MIT), Simple Icons (CC0), Devicon (MIT), log-z/logos (MIT). See `skills/diagram-design/THIRD_PARTY_LICENSES.md`.
- [@unovis](https://unovis.dev) — Apache-2.0, loaded from CDN.
- [Tailwind CSS](https://tailwindcss.com) — MIT, loaded from CDN.
- [Mermaid](https://mermaid.js.org) — MIT, loaded only when you explicitly ask for a Mermaid diagram.
- The "code-shape" component was inspired by HumanLayer's *show-me* skill.
- The default visual style follows Anthropic's editorial look; nothing is copied from Anthropic.

## License

MIT — see `LICENSE`. Third-party material keeps its own license.
