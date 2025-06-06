#!/bin/bash

# Script to fix style guide issues identified in validation
# Usage: ./fix_style.sh

echo "Fixing style guide issues in Ubiquitous Language documentation..."

# Get all markdown files in ubiquitous-language directory
find /home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language -name "*.md" | while read -r file; do
  # 1. Fix Setext headings (=== or ---) to ATX style (# or ##)
  # First, convert "===" headings to "# " (H1)
  if grep -q "^===\+$" "$file"; then
    echo "Fixing Setext H1 headings in $file"
    # Get the line before the "===" and add "# " to it
    sed -i '/^===\+$/{ x; s/^/# /; x; d; }' "$file"
  fi
  
  # Convert "---" headings to "## " (H2)
  if grep -q "^---\+$" "$file"; then
    echo "Fixing Setext H2 headings in $file"
    # Get the line before the "---" and add "## " to it
    sed -i '/^---\+$/{ x; s/^/## /; x; d; }' "$file"
  fi
  
  # 2. Fix indented code blocks to fenced code blocks
  # This is complex to do automatically with sed, so we'll just report them
  if grep -q "^    " "$file"; then
    echo "MANUAL FIX NEEDED: $file may contain indented code blocks that need to be converted to fenced code blocks (\`\`\`)"
  
  fi
  
  # 3. Remove trailing whitespace
  if grep -q " $" "$file"; then
    echo "Removing trailing whitespace in $file"
    sed -i 's/[ \t]*$//' "$file"
  fi
  
  # 4. Fix underscore emphasis to asterisk
  if grep -q "_[^_]*_" "$file"; then
    echo "Fixing emphasis style in $file"
    # This is a simple replacement and may not catch all cases or might change some that shouldn't be changed
    # A more robust solution would require more complex parsing
    sed -i 's/_\([^_]*\)_/*\1*/g' "$file"
  fi
  
  # 5. Ensure consistent list style (hyphens for unordered lists)
  if grep -q "^\s*\*\s" "$file"; then
    echo "Fixing list style (asterisk to hyphen) in $file"
    sed -i 's/^\(\s*\)\*\s/\1- /g' "$file"
  fi
done

echo "Style issues fixed. Some manual fixes may still be required."
