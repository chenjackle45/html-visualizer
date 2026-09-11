#!/usr/bin/env python3
"""Check every skills/*/SKILL.md frontmatter against the claude.ai upload limits.

claude.ai / Cowork rejects a skill zip when `description` is longer than
200 characters (the Agent Skills spec itself allows 1024, but the web upload
uses the shorter limit) or when the zip holds more than 200 files. Run this before cutting a zip:

    python3 tests/check-frontmatter.py
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent / "skills"
NAME_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
ok = True
for skill_md in sorted(ROOT.glob("*/SKILL.md")):
    text = skill_md.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    fm = m.group(1) if m else ""
    fields = dict(re.findall(r"^([a-z-]+):[ \t]*(.*)$", fm, re.M))
    name, desc = fields.get("name", ""), fields.get("description", "")
    problems = []
    if name != skill_md.parent.name or not NAME_RE.match(name) or len(name) > 64:
        problems.append(f"name {name!r} must equal folder name, lowercase-hyphen, <=64")
    if not desc:
        problems.append("description missing")
    if len(desc) > 200:
        problems.append(f"description is {len(desc)} chars, claude.ai limit is 200")
    if re.search(r"<[^>]+>", name + desc):
        problems.append("name/description must not contain XML tags")
    files = [f for f in skill_md.parent.rglob("*")
             if f.is_file() and "__pycache__" not in f.parts and f.name != ".DS_Store"]
    if len(files) > 200:
        problems.append(f"{len(files)} files, claude.ai zip limit is 200")
    status = "FAIL" if problems else "ok"
    print(f"{status:4} {skill_md.parent.name}: description {len(desc)} chars, {len(files)} files")
    for pr in problems:
        print("     -", pr)
    ok = ok and not problems
sys.exit(0 if ok else 1)
