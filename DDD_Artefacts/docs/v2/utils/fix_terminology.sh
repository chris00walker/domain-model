#!/bin/bash

# Script to fix terminology consistency issues identified in validation
# Usage: ./fix_terminology.sh

echo "Fixing terminology issues in Ubiquitous Language documentation..."

# Define core domain terms with their proper capitalization
declare -A CORE_TERMS
CORE_TERMS=(
  ["product"]="Product"
  ["customer"]="Customer" 
  ["order"]="Order"
  ["subscription"]="Subscription"
  ["authentication"]="Authentication"
  ["pricing"]="Pricing"
  ["inventory"]="Inventory"
  ["payment"]="Payment"
  ["catalog"]="Catalog"
)

# Loop through all markdown files
find /home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language -name "*.md" | while read -r file; do
  echo "Checking terminology in $file"
  
  # 1. Standardize core domain term capitalization
  # We need to be careful to only capitalize standalone terms, not parts of other words
  for term in "${!CORE_TERMS[@]}"; do
    proper_term="${CORE_TERMS[$term]}"
    
    # Match the term as a word boundary, but avoid replacing inside code blocks
    # This is a simplified approach - more complex patterns might be needed
    sed -i "s/\b$term\b/$proper_term/g" "$file"
    
    # Also check for all lowercase version
    lower_term=$(echo "$term" | tr '[:upper:]' '[:lower:]')
    if [ "$lower_term" != "$term" ]; then
      sed -i "s/\b$lower_term\b/$proper_term/g" "$file"
    fi
  done
  
  # 2. Check and fix domain event naming conventions
  # We expect entity-first, past-tense naming
  if [[ "$file" == *"domain_event"* ]]; then
    echo "Checking domain event naming conventions in $file"
    
    # Flag common non-past-tense verbs in event names
    # This would need manual review, so just list potential issues
    non_past_tense_patterns=("Create" "Update" "Delete" "Process" "Validate" "Complete" "Cancel")
    
    for pattern in "${non_past_tense_patterns[@]}"; do
      if grep -q "$pattern" "$file"; then
        echo "  POTENTIAL NON-PAST-TENSE EVENT: Found '$pattern' in $file - consider changing to past tense (e.g., ${pattern}d or ${pattern}ed)"
      fi
    done
  fi
done

echo "Terminology issues fixed. Some manual review may still be required."
