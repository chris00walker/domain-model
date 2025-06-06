#!/bin/bash

# Script to add proper YAML frontmatter to documents
# Usage: ./fix_frontmatter.sh

echo "Adding proper YAML frontmatter to documents..."

# Define document titles based on filenames
declare -A DOC_TITLES
DOC_TITLES=(
  ["testing.md"]="Ubiquitous Language in Testing"
  ["api_design.md"]="Ubiquitous Language in API Design"
  ["ui_design.md"]="Ubiquitous Language in UI Design"
  ["database_design.md"]="Ubiquitous Language in Database Design"
  ["business_metrics_domain_mapping.md"]="Business Metrics Domain Mapping"
  ["onboarding_program.md"]="Ubiquitous Language Onboarding Program"
  ["domain_events_business_mapping.md"]="Domain Events Business Mapping"
  ["domain_event_naming.md"]="Domain Event Naming Analysis"
  ["domain-terms-requirements.md"]="Domain Terms in Requirements Analysis"
  ["value_objects_analysis.md"]="Value Objects Ubiquitous Language Analysis"
  ["terminology_alignment.md"]="Domain Terminology Alignment Guide"
  ["ubiquitous_language_guidelines.md"]="Ubiquitous Language Guidelines"
  ["ubiquitous_language_review_checklist.md"]="Ubiquitous Language Review Checklist"
  ["ubiquitous_language_evolution.md"]="Ubiquitous Language Evolution Process"
  ["guidelines.md"]="Ubiquitous Language Guidelines Index"
)

# Get current date in YYYY-MM-DD format
CURRENT_DATE=$(date +"%Y-%m-%d")

# Process all markdown files
find /home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language -name "*.md" | while read -r file; do
  filename=$(basename "$file")
  
  # Check if file already has frontmatter
  if ! grep -q "^---" "$file"; then
    echo "Adding frontmatter to $file"
    
    # Determine title from our mapping or use filename as fallback
    title="${DOC_TITLES[$filename]}"
    if [ -z "$title" ]; then
      # Convert filename to title case by removing extension and replacing underscores
      title=$(echo "$filename" | sed 's/\.md$//' | sed 's/_/ /g' | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')
    fi
    
    # Create temporary file
    temp_file=$(mktemp)
    
    # Add frontmatter at the top
    cat > "$temp_file" << EOF
---
title: "$title"
version: "1.0"
last_updated: "$CURRENT_DATE"
status: "Draft"
---

EOF

    # Append original content
    cat "$file" >> "$temp_file"
    
    # Replace original file
    mv "$temp_file" "$file"
  fi
done

echo "Frontmatter added to documents without it."
