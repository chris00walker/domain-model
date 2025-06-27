import os
import sys
import re

# Path to the authoritative glossary file
# Determine glossary path – prefer new location, fall back to legacy path for backward-compat.
PROJECT_ROOT = os.path.dirname(os.path.dirname(__file__))
NEW_GLOSSARY_PATH = os.path.join(
    PROJECT_ROOT, "DDD_Artefacts", "docs", "ubiquitous-language", "glossary.md"
)
LEGACY_GLOSSARY_PATH = os.path.join(
    PROJECT_ROOT, "DDD_Artefacts", "docs", "v2", "ubiquitous-language", "glossary.md"
)
GLOSSARY_PATH = NEW_GLOSSARY_PATH if os.path.isfile(NEW_GLOSSARY_PATH) else LEGACY_GLOSSARY_PATH
# Directories to scan for documentation
SCAN_DIRS = [
    os.path.join(PROJECT_ROOT, "DDD_Artefacts", "docs", "business-model"),
    os.path.join(PROJECT_ROOT, "DDD_Artefacts", "docs", "domain-knowledge", "bounded-contexts"),
]

def extract_glossary_terms(path):
    terms = set()
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            # Match lines like: - **Term**: Definition
            match = re.match(r"- \*\*([A-Za-z0-9 _-]+)\*\*:", line)
            if match:
                terms.add(match.group(1).strip())
    return terms

# A basic stoplist of common English and technical words to ignore
STOPLIST = set([
    'The', 'And', 'Or', 'If', 'Else', 'For', 'In', 'On', 'At', 'By', 'Of', 'To', 'From', 'With', 'Without', 'Is', 'Are', 'Was', 'Were', 'Be', 'Being', 'Been',
    'A', 'An', 'As', 'It', 'This', 'That', 'These', 'Those', 'Can', 'Could', 'Should', 'Would', 'May', 'Might', 'Will', 'Shall', 'Do', 'Does', 'Did', 'Not',
    'Has', 'Have', 'Had', 'But', 'So', 'Than', 'Then', 'Which', 'Who', 'Whom', 'Whose', 'What', 'When', 'Where', 'Why', 'How', 'All', 'Any', 'Some', 'No', 'None',
    'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    # Technical/common words
    'API', 'UI', 'ID', 'URL', 'HTTP', 'HTTPS', 'JSON', 'CSV', 'MD', 'Doc', 'Docs', 'Test', 'Tests', 'Testing', 'Code', 'File', 'Files', 'Folder', 'Directory',
    'True', 'False', 'Null', 'None', 'Type', 'Types', 'String', 'Number', 'Int', 'Float', 'Bool', 'List', 'Dict', 'Set', 'Object', 'Class', 'Function', 'Method',
    'Example', 'Examples', 'See', 'Note', 'Section', 'Table', 'Row', 'Column', 'Line', 'Lines', 'Page', 'Pages', 'Figure', 'Figures', 'Diagram', 'Diagrams',
    'Above', 'Below', 'Left', 'Right', 'Up', 'Down', 'Next', 'Previous', 'Current', 'New', 'Old', 'First', 'Last', 'Start', 'End', 'Beginning', 'Middle', 'After', 'Before',
    # Add more as needed for your context
])

import inflect

import re
import inflect
import string

def preprocess_markdown(text):
    # Remove Markdown formatting (bold, italics, inline code, headings, links, images, etc.)
    text = re.sub(r"[`*_#\[\]()>~\-]", " ", text)  # Remove most markdown special chars
    text = re.sub(r"!\[[^\]]*\]\([^\)]*\)", " ", text)  # Images
    text = re.sub(r"\[[^\]]*\]\([^\)]*\)", " ", text)   # Links
    text = re.sub(r"\{[^\}]*\}", " ", text)  # Curly braces
    # Remove punctuation
    text = text.translate(str.maketrans(string.punctuation, ' '*len(string.punctuation)))
    return text

def scan_docs_for_glossary_terms(dirs, glossary_terms):
    p = inflect.engine()
    # For each term, generate singular and plural forms (case-insensitive)
    term_variants = {}
    for term in glossary_terms:
        term_lower = term.lower()
        plural = p.plural(term_lower)
        singular = p.singular_noun(term_lower) or term_lower
        variants = set([term_lower, plural])
        if singular:
            variants.add(singular)
        # Also add title-case and capitalized forms
        variants.add(term_lower.capitalize())
        variants.add(term_lower.title())
        term_variants[term] = variants
    # Map of term -> set of file paths where found
    term_files = {term: set() for term in glossary_terms}
    # Map of term -> {file: [line numbers where found unlinked]}
    unlinked_usages = {term: {} for term in glossary_terms}
    for root in dirs:
        for subdir, _, files in os.walk(root):
            for file in files:
                if file.endswith(".md"):
                    file_path = os.path.join(subdir, file)
                    with open(file_path, "r", encoding="utf-8") as f:
                        lines = f.readlines()
                    text = preprocess_markdown(''.join(lines).lower())
                    for term, variants in term_variants.items():
                        found = False
                        for variant in variants:
                            # Match as a whole word (ignore case)
                            if re.search(rf"\b{re.escape(variant)}\b", text):
                                term_files[term].add(file_path)
                                found = True
                                break
                        if found:
                            # Now check for unlinked usages per line
                            glossary_link_patterns = [
                                rf'\[{variant}\]\([^\)]*glossary.md[^\)]*\)',
                                rf'\[{variant}\]\([^\)]*glossary\.md[^\)]*\)'
                            ]
                            for i, line in enumerate(lines, 1):
                                line_lc = line.lower()
                                for variant in variants:
                                    # If variant is present as a word
                                    if re.search(rf"\b{re.escape(variant)}\b", line_lc):
                                        # If not inside a link to glossary
                                        if not any(re.search(pat, line, re.IGNORECASE) for pat in glossary_link_patterns):
                                            unlinked_usages[term].setdefault(file_path, []).append(i)
    return term_files, unlinked_usages

import sys

if __name__ == "__main__":
    glossary_terms = extract_glossary_terms(GLOSSARY_PATH)
    # Remove stoplist words from glossary terms
    filtered_glossary_terms = {term for term in glossary_terms if term not in STOPLIST}
    term_files, unlinked_usages = scan_docs_for_glossary_terms(SCAN_DIRS, filtered_glossary_terms)

    fix_mode = '--fix' in sys.argv
    files_modified = {}

    if fix_mode:
        print("\n=== Glossary Link Auto-Fix Mode Enabled ===")
        for term in sorted(filtered_glossary_terms):
            for file, lines in unlinked_usages[term].items():
                if not lines:
                    continue
                with open(file, 'r', encoding='utf-8') as f:
                    file_lines = f.readlines()
                # Lowercase variants for matching
                variants = [term, term.lower(), term.title(), term.capitalize()]
                # Build glossary link (relative path)
                link = f"[{term}](../ubiquitous-language/guidelines/glossary.md#{term.lower()})"
                changed = False
                for idx in set(lines):
                    orig = file_lines[idx-1]
                    new = orig
                    for v in sorted(variants, key=len, reverse=True):
                        # Only replace if not already inside a link
                        pat = rf'(?<!\[){v}(?!\])'
                        if re.search(rf'\b{v}\b', orig) and not re.search(rf'\[{v}\]\([^\)]*glossary.md[^\)]*\)', orig, re.IGNORECASE):
                            # Replace only standalone word
                            new = re.sub(rf'\b{v}\b', link, new)
                    if new != orig:
                        file_lines[idx-1] = new
                        files_modified.setdefault(file, []).append(idx)
                        changed = True
                if changed:
                    with open(file, 'w', encoding='utf-8') as f:
                        f.writelines(file_lines)
        if files_modified:
            print("\nGlossary links inserted in the following files:")
            for file, lines in files_modified.items():
                print(f"  {file}: lines {', '.join(map(str, sorted(set(lines))))}")
        else:
            print("No glossary links needed to be inserted.")

    print("\n=== Ubiquitous Language Consistency Report ===\n")
    missing_terms = []
    context_map = {}
    for term in sorted(filtered_glossary_terms):
        files = term_files[term]
        if files:
            print(f"{term}:\n  Found in:")
            contexts = set()
            for f in sorted(files):
                # Show context (directory) as well as file
                context = os.path.relpath(os.path.dirname(f), os.path.dirname(__file__))
                print(f"    - {f} (context: {context})")
                # Use top-level directory under core-contexts or business-model as context
                parts = context.split(os.sep)
                if 'core-contexts' in parts:
                    idx = parts.index('core-contexts')
                    if idx + 1 < len(parts):
                        contexts.add(parts[idx + 1])
                elif 'business-model' in parts:
                    contexts.add('business-model')
            context_map[term] = contexts
        else:
            missing_terms.append(term)
    if missing_terms:
        print("\nGlossary terms NOT found in any documentation:")
        for term in missing_terms:
            print(f"  {term}")
    else:
        print("\nAll glossary terms were found in documentation.")

    # Ambiguity/cross-context usage summary
    ambiguous_terms = {term: ctxs for term, ctxs in context_map.items() if len(ctxs) > 1}
    if ambiguous_terms:
        print("\n=== Potential Ambiguity: Terms Found in Multiple Contexts ===")
        for term, ctxs in ambiguous_terms.items():
            print(f"{term}: found in contexts: {', '.join(sorted(ctxs))}")
        print("\nReview these terms to ensure context-specific meanings are explicit and ambiguity is avoided.")
    else:
        print("\nNo terms found in multiple contexts.")

    # Glossary link enforcement summary
    print("\n=== Glossary Link Enforcement: Unlinked Usages ===")
    any_unlinked = False
    for term in sorted(filtered_glossary_terms):
        for file, lines in unlinked_usages[term].items():
            if lines:
                any_unlinked = True
                print(f"{term} in {file}: unlinked on lines {', '.join(map(str, lines))}")
    if not any_unlinked:
        print("All glossary term usages are properly linked to the glossary.")

    # Automated Compliance Checklist
    print("\n=== Automated Compliance Checklist ===")
    for term in sorted(filtered_glossary_terms):
        print(f"\nChecklist for '{term}':")
        # 1. Concept recognized by domain experts (manual)
        print("  [ ] 1. Does the term reflect a concept that domain experts recognize? (MANUAL CHECK)")
        # 2. Consistent use in code, docs, conversation (auto: found in docs)
        found_in_docs = bool(term_files[term])
        print(f"  [{'x' if found_in_docs else ' '}] 2. Is the term consistently used in code, documentation, and conversation? (found in documentation)")
        # 3. Clearly defined without technical jargon (auto: present in glossary)
        print(f"  [x] 3. Is the term clearly defined without technical jargon? (definition in glossary)")
        # 4. Avoid ambiguity in bounded context (auto: only one context)
        contexts = context_map.get(term, set())
        print(f"  [{'x' if len(contexts) == 1 else ' '}] 4. Does the term avoid ambiguity within its bounded context? (found in {len(contexts)} context{'s' if len(contexts)!=1 else ''})")
        # 5. If multiple meanings, explicitly documented (auto: more than one context)
        if len(contexts) > 1:
            print("  [ ] 5. If the term has different meanings across bounded contexts, is this explicitly documented? (REVIEW NEEDED)")
        else:
            print("  [x] 5. If the term has different meanings across bounded contexts, is this explicitly documented? (n/a)")
        # 6. Reviewed and approved by domain experts (manual)
        print("  [ ] 6. Has the term been reviewed and approved by domain experts? (MANUAL CHECK)")
