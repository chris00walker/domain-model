#!/bin/bash

# Script to validate style guide compliance in markdown files
# Usage: ./validate_style.sh <directory>

DIRECTORY=${1:-../ubiquitous-language}
STYLE_ISSUES=0

echo "Validating style guide compliance in $DIRECTORY..."

# Find all markdown files
files=$(find "$DIRECTORY" -name "*.md" | grep -v "README.md")

for file in $files; do
  echo "Checking $file"
  
  # Check for consistent heading style (ATX style)
  if grep -q "^===" "$file" || grep -q "^---$" "$file"; then
    echo "  STYLE ISSUE: $file uses Setext style headings (=== or ---) instead of ATX style (# or ##)"
    STYLE_ISSUES=$((STYLE_ISSUES+1))
  fi
  
  # Check for consistent list style (- vs *)
  if grep -q "^\* " "$file"; then
    echo "  STYLE ISSUE: $file uses asterisk (*) for lists instead of hyphen (-)"
    STYLE_ISSUES=$((STYLE_ISSUES+1))
  fi
  
  # Check for proper code block style
  if grep -q "^    [^\`]" "$file"; then
    echo "  STYLE ISSUE: $file uses indented code blocks instead of fenced code blocks (\`\`\`)"
    STYLE_ISSUES=$((STYLE_ISSUES+1))
  fi
  
  # Check for trailing whitespace
  if grep -q " $" "$file"; then
    echo "  STYLE ISSUE: $file contains lines with trailing whitespace"
    STYLE_ISSUES=$((STYLE_ISSUES+1))
  fi
  
  # Check for consistent emphasis style (* vs _)
  if grep -q "_[^_]*_" "$file"; then
    echo "  STYLE ISSUE: $file uses underscore (_) for emphasis instead of asterisk (*)"
    STYLE_ISSUES=$((STYLE_ISSUES+1))
  fi
done

echo "Style validation complete. Found $STYLE_ISSUES issues."

if [ $STYLE_ISSUES -eq 0 ]; then
  exit 0
else
  exit 1
fi
