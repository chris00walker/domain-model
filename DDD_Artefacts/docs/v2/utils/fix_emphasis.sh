#!/bin/bash

# Script to convert underscore emphasis to asterisk emphasis
# Usage: ./fix_emphasis.sh

echo "Converting underscore emphasis to asterisk emphasis..."

# Get files with underscore emphasis issues from validation report
declare -a FILES_TO_PROCESS=(
  "/home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language/implementation-guides/api_design.md"
  "/home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language/guidelines/ubiquitous_language_guidelines.md"
  "/home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language/guidelines.md"
)

for file in "${FILES_TO_PROCESS[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file"
    
    # Replace underscore emphasis with asterisk emphasis
    # Be careful not to replace underscores in code, URLs, or file paths
    sed -i 's/\b_\([^_]*\)_\b/*\1*/g' "$file"
    
    # Handle any remaining underscores in emphasis
    sed -i 's/\([^[:alnum:]]\)_\([^_]*\)_\([^[:alnum:]]\)/\1*\2*\3/g' "$file"
  else
    echo "Warning: File not found - $file"
  fi
done

echo "Emphasis conversion complete."
