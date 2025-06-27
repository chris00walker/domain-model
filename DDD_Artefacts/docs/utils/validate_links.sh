#!/bin/bash

# Script to validate internal links in markdown files
# Usage: ./validate_links.sh <directory>

DIRECTORY=${1:-../}
BROKEN_LINKS=0

echo "Checking for broken internal links in $DIRECTORY..."

# Find all markdown files
files=$(find "$DIRECTORY" -name "*.md")

for file in $files; do
  echo "Checking $file"
  
  # Find all markdown links
  links=$(grep -o '\[[^]]*\](.[^)]*\.md[^)]*)' "$file" | sed 's/.*](//' | sed 's/).*//')
  
  for link in $links; do
    # Remove anchor part if exists
    base_link=$(echo "$link" | cut -d '#' -f 1)
    
    # Handle relative paths
    if [[ "$base_link" =~ ^/ ]]; then
      # Absolute path from repo root
      target_file="/home/chris/domain-model/DDD_Artefacts/docs/v2$base_link"
    else
      # Relative path
      dir=$(dirname "$file")
      target_file="$dir/$base_link"
    fi
    
    # Check if the file exists
    if [ -n "$base_link" ] && [ ! -f "$target_file" ]; then
      echo "  BROKEN LINK: $link in file $file"
      BROKEN_LINKS=$((BROKEN_LINKS+1))
    fi
  done
done

echo "Link validation complete. Found $BROKEN_LINKS broken links."

if [ $BROKEN_LINKS -eq 0 ]; then
  exit 0
else
  exit 1
fi
