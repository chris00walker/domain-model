#!/bin/bash

# Script to fix document structure issues identified in validation
# Usage: ./fix_structure.sh

echo "Fixing structure issues in Ubiquitous Language documentation..."

# Fix missing version fields in frontmatter
declare -a FILES_NEEDING_VERSION=(
  "/home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language/implementation-guides/api_design.md"
  "/home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language/implementation-guides/ui_design.md"
  "/home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language/implementation-guides/database_design.md"
  "/home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language/analysis/domain-terms-requirements.md"
  "/home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language/guidelines/ubiquitous_language_guidelines.md"
  "/home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language/guidelines/ubiquitous_language_evolution.md"
)

for file in "${FILES_NEEDING_VERSION[@]}"; do
  if [ -f "$file" ]; then
    # Check if version already exists
    if ! grep -q "version:" "$file"; then
      # Add version after title
      sed -i '/title:/a version: "1.0"' "$file"
      echo "Added version field to $file"
    fi
  fi
done

# Fix missing Overview section in api_design.md
API_DESIGN_FILE="/home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language/implementation-guides/api_design.md"
if [ -f "$API_DESIGN_FILE" ]; then
  if ! grep -q "^## Overview$" "$API_DESIGN_FILE"; then
    # Find the H1 title line number
    H1_LINE=$(grep -n "^# " "$API_DESIGN_FILE" | cut -d':' -f1)
    if [ -n "$H1_LINE" ]; then
      # Add Overview section after the H1 line
      H1_LINE=$((H1_LINE + 1))
      sed -i "${H1_LINE}i\\\\n## Overview\\n\\nThis document provides guidelines for applying the ubiquitous language in API design across the Elias Food Imports system. It ensures that all APIs reflect the core domain terminology and concepts consistently.\\n" "$API_DESIGN_FILE"
      echo "Added Overview section to $API_DESIGN_FILE"
    fi
  fi
fi

echo "Structure issues fixed."
