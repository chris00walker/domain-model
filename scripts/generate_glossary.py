#!/usr/bin/env python3
"""
generate_glossary.py

Fully automated glossary generator for EFI:
1. Scans ../business-model/*.md for definitions based on filename & first paragraph.
2. Scans ../DDD_Artefacts/docs/v2/domain-knowledge/core-contexts/*/README.md for definitions based on folder name & first paragraph.
3. Writes the consolidated list to ../DDD_Artefacts/docs/v2/ubiquitous-language/guidelines/glossary.md.
4. (Optional) Runs check_markdown_style.py --fix on the generated file.
"""
import re
import subprocess
from pathlib import Path

# --- Setup paths ---
SCRIPT_PATH = Path(__file__).resolve()
SCRIPT_DIR = SCRIPT_PATH.parent
PROJECT_ROOT = SCRIPT_DIR.parent

# Source directories relative to project root
BUSINESS_MD = PROJECT_ROOT / "business-model"
DOMAIN_MD   = PROJECT_ROOT / "DDD_Artefacts" / "docs" / "v2" / "domain-knowledge" / "core-contexts"

# Output glossary path
OUTPUT_GLOSSARY = PROJECT_ROOT / "DDD_Artefacts" / "docs" / "v2" / "ubiquitous-language" / "guidelines" / "glossary.md"

entries = {}

# Helper to extract first paragraph of text
def first_paragraph(text: str) -> str:
    para, started = [], False
    for line in text.splitlines():
        if not line.strip():
            if started:
                break
            continue
        para.append(line.strip())
        started = True
    return " ".join(para)

# 1. Extract from business-model files
if BUSINESS_MD.exists():
    for md in BUSINESS_MD.glob("*.md"):
        stem = md.stem
        parts = stem.split("-", 1)
        term = (parts[1] if parts[0].isdigit() else stem).replace("-", " ").strip()
        text = md.read_text(encoding="utf-8")
        definition = first_paragraph(text)
        key = re.sub(r"\W+", "", term).lower()
        entries[key] = (term, definition)

# 2. Extract from domain-knowledge context READMEs
if DOMAIN_MD.exists():
    for ctx in DOMAIN_MD.iterdir():
        readme = ctx / "README.md"
        if readme.exists():
            term = ctx.name.replace("-", " ").title()
            text = readme.read_text(encoding="utf-8")
            definition = first_paragraph(text)
            key = re.sub(r"\W+", "", term).lower()
            entries.setdefault(key, (term, definition))

# 3. Write the consolidated glossary
OUTPUT_GLOSSARY.parent.mkdir(parents=True, exist_ok=True)
out = ["# Domain Glossary", ""]
for term, definition in sorted(entries.values(), key=lambda x: x[0].lower()):
    out.append(f"- **{term}**: {definition}")
OUTPUT_GLOSSARY.write_text("\n".join(out) + "\n", encoding="utf-8")

# 4. (Optional) Style-fix - uncomment if you want linting
# subprocess.run(["python3", SCRIPT_DIR / "check_markdown_style.py", "--fix"], check=False)

print(f"✅ Generated {OUTPUT_GLOSSARY.relative_to(PROJECT_ROOT)} with {len(entries)} unique terms.")
