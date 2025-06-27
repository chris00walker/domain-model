#!/bin/bash

# Script to validate ubiquitous language terminology consistency
# Usage: ./validate_terminology.sh <directory>

DIRECTORY=${1:-../ubiquitous-language}
ISSUES=0

echo "Validating terminology consistency in $DIRECTORY..."

# Extract the list of core domain terms from the glossary or terminology alignment guide
# For now we'll check a few critical terms as examples - this should be expanded
CORE_TERMS=(
  "Product"
  "Customer"
  "Order"
  "Subscription"
  "Authentication"
  "Pricing"
  "Inventory"
  "Shipment"
  "Payment"
  "Catalog"
)

# Find all markdown files
files=$(find "$DIRECTORY" -name "*.md")

for file in $files; do
  echo "Checking $file"
  
  # Check for consistent capitalization of core terms
  for term in "${CORE_TERMS[@]}"; do
    # Check for incorrect casing variations using lowercase version of the term
    term_lower=$(echo "$term" | tr '[:upper:]' '[:lower:]')
    incorrect_variants=$(grep -o "\b$term_lower\b" "$file" | wc -l)
    
    if [ $incorrect_variants -gt 0 ]; then
      echo "  TERMINOLOGY ISSUE: $file has inconsistent capitalization of core term '$term'"
      ISSUES=$((ISSUES+1))
    fi
  done
  
  # Check for consistent use of domain event naming convention (past tense)
  if grep -q "Event" "$file"; then
    present_tense=$(grep "Event" "$file" | grep -E "\b(Create|Update|Delete|Process|Validate)\b" | wc -l)
    if [ $present_tense -gt 0 ]; then
      echo "  TERMINOLOGY ISSUE: $file may have events not using past tense naming convention"
      ISSUES=$((ISSUES+1))
    fi
  fi
done

echo "Terminology validation complete. Found $ISSUES issues."

if [ $ISSUES -eq 0 ]; then
  exit 0
else
  exit 1
fi
