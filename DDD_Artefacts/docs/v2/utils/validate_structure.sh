#!/bin/bash

# Script to validate document structure against established guidelines
# Usage: ./validate_structure.sh <directory>

DIRECTORY=${1:-../ubiquitous-language}
STRUCTURE_ISSUES=0

echo "Validating document structure in $DIRECTORY..."

# Find all markdown files
files=$(find "$DIRECTORY" -name "*.md" | grep -v "README.md")

for file in $files; do
  echo "Checking $file"
  
  # Check for YAML frontmatter
  if ! grep -q "^---$" "$file"; then
    echo "  MISSING FRONTMATTER: $file lacks proper YAML frontmatter"
    STRUCTURE_ISSUES=$((STRUCTURE_ISSUES+1))
  fi
  
  # Check for title in frontmatter
  if ! grep -A5 "^---$" "$file" | grep -q "title:"; then
    echo "  MISSING TITLE: $file frontmatter lacks 'title' field"
    STRUCTURE_ISSUES=$((STRUCTURE_ISSUES+1))
  fi
  
  # Check for version in frontmatter
  if ! grep -A10 "^---$" "$file" | grep -q "version:"; then
    echo "  MISSING VERSION: $file frontmatter lacks 'version' field"
    STRUCTURE_ISSUES=$((STRUCTURE_ISSUES+1))
  fi
  
  # Check for proper H1 heading (title)
  if ! grep -q "^# " "$file"; then
    echo "  MISSING H1: $file does not have a level 1 heading (# Title)"
    STRUCTURE_ISSUES=$((STRUCTURE_ISSUES+1))
  fi
  
  # Check for Overview section
  if ! grep -q "^## Overview$" "$file"; then
    echo "  MISSING OVERVIEW: $file lacks '## Overview' section"
    STRUCTURE_ISSUES=$((STRUCTURE_ISSUES+1))
  fi
done

echo "Structure validation complete. Found $STRUCTURE_ISSUES issues."

if [ $STRUCTURE_ISSUES -eq 0 ]; then
  exit 0
else
  exit 1
fi
