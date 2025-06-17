import argparse
import re
import sys
from pathlib import Path

GLOSSARY_PATH = Path("/home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language/guidelines/glossary.md")
STYLE_GUIDE_PATH = Path("DDD_Artefacts/docs/v2/STYLE_GUIDE.md")

# Key style rules for glossary entries (can be extended)
GLOSSARY_ENTRY_RE = re.compile(r"^- \*\*([A-Za-z0-9 _\-/]+)\*\*: .+")
SECTION_HEADER_RE = re.compile(r"^##? .+")


def check_glossary_format(lines):
    violations = []
    fixed_lines = []
    term_lines = {}
    seen_terms = set()
    duplicate_violations = []
    in_candidate_section = False
    for i, line in enumerate(lines):
        # Check for candidate section to skip strict enforcement if needed
        if line.strip().startswith("## Candidate Terms"):
            in_candidate_section = True
        # Only check actual glossary entries (not headings, notes, etc.)
        if line.startswith("- "):
            match = GLOSSARY_ENTRY_RE.match(line)
            if not match:
                violations.append((i + 1, line))
                # Attempt to auto-fix: bold term before colon, ensure dash and colon
                fixed = re.sub(r"^- ?([A-Za-z0-9 _\-/]+):", r"- **\1**:", line)
                if not fixed.startswith("- **"):  # fallback
                    fixed = "- **FIXME**: " + line.lstrip("- ")
                fixed_lines.append(fixed)
            else:
                term = match.group(1).strip().lower()
                if term in seen_terms:
                    duplicate_violations.append((i + 1, match.group(1)))
                else:
                    seen_terms.add(term)
                term_lines.setdefault(term, []).append(i + 1)
                fixed_lines.append(line)
        else:
            fixed_lines.append(line)
    return violations, duplicate_violations, fixed_lines


def main():
    parser = argparse.ArgumentParser(description="Check and fix Markdown style for glossary.md")
    parser.add_argument("--fix", action="store_true", help="Automatically fix simple style violations in place")
    args = parser.parse_args()

    if not GLOSSARY_PATH.exists():
        print(f"Glossary file not found: {GLOSSARY_PATH}")
        sys.exit(1)

    with GLOSSARY_PATH.open("r", encoding="utf-8") as f:
        lines = f.readlines()

    violations, duplicate_violations, fixed_lines = check_glossary_format(lines)

    if not violations and not duplicate_violations:
        print("glossary.md is fully compliant with style and duplicate rules.")
        return

    if violations:
        print("Found the following style violations in glossary.md:")
        for lineno, bad_line in violations:
            print(f"  Line {lineno}: {bad_line.strip()}")
    if duplicate_violations:
        print("\nFound duplicate glossary terms (case-insensitive):")
        for lineno, term in duplicate_violations:
            print(f"  Line {lineno}: Duplicate term '{term}'")
    # Scaffold for future: cross-reference check
    # print("\n[TODO] Cross-reference check: Not yet implemented.")

    if args.fix:
        with GLOSSARY_PATH.open("w", encoding="utf-8") as f:
            f.writelines(fixed_lines)
        print(f"\nFixed {len(violations)} style violations in-place. Duplicates must be manually resolved.")
    else:
        print(f"\nRun with --fix to automatically correct style issues. Duplicates must be manually resolved.")

if __name__ == "__main__":
    main()
