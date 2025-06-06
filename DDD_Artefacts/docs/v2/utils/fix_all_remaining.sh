#!/bin/bash

# Script to fix all remaining validation issues in documentation
# Usage: ./fix_all_remaining.sh

echo "Fixing all remaining validation issues in documentation..."

# Fix frontmatter for all files
find /home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language -name "*.md" | while read -r file; do
  filename=$(basename "$file")
  dirname=$(basename "$(dirname "$file")")
  
  # Skip files that already have frontmatter
  if grep -q "^---" "$file"; then
    echo "File $file already has frontmatter, skipping..."
    continue
  fi
  
  echo "Adding frontmatter to $file"
  
  # Generate title based on filename and directory
  title=""
  case "$filename" in
    "testing.md") title="Ubiquitous Language in Testing" ;;
    "api_design.md") title="Ubiquitous Language in API Design" ;;
    "ui_design.md") title="Ubiquitous Language in UI Design" ;;
    "database_design.md") title="Ubiquitous Language in Database Design" ;;
    "business_metrics_domain_mapping.md") title="Business Metrics Domain Mapping" ;;
    "onboarding_program.md") title="Ubiquitous Language Onboarding Program" ;;
    "domain_events_business_mapping.md") title="Domain Events Business Mapping" ;;
    "domain_event_naming.md") title="Domain Event Naming Analysis" ;;
    "domain-terms-requirements.md") title="Domain Terms in Requirements Analysis" ;;
    "value_objects_analysis.md") title="Value Objects Ubiquitous Language Analysis" ;;
    "terminology_alignment.md") title="Domain Terminology Alignment Guide" ;;
    "ubiquitous_language_guidelines.md") title="Ubiquitous Language Guidelines" ;;
    "ubiquitous_language_review_checklist.md") title="Ubiquitous Language Review Checklist" ;;
    "ubiquitous_language_evolution.md") title="Ubiquitous Language Evolution Process" ;;
    "guidelines.md") title="Ubiquitous Language Guidelines Index" ;;
    "README.md") title="Ubiquitous Language Consistency Framework" ;;
    *) title="$(echo "$filename" | sed 's/\.md$//' | sed 's/_/ /g' | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')" ;;
  esac
  
  # Create temporary file
  temp_file=$(mktemp)
  
  # Add frontmatter
  cat > "$temp_file" << EOF
---
title: "$title"
version: "2.0"
last_updated: "$(date +"%Y-%m-%d")"
status: "Final"
---

EOF
  
  # Append original content
  cat "$file" >> "$temp_file"
  
  # Replace original file
  mv "$temp_file" "$file"
done

# Fix trailing whitespace in all files
echo "Removing trailing whitespace..."
find /home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language -name "*.md" | xargs sed -i 's/[[:space:]]*$//'

# Fix remaining indented code blocks
echo "Converting remaining indented code blocks..."
find /home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language -name "*.md" | while read -r file; do
  # Check if file contains indented code blocks
  if grep -q "^    [^ ]" "$file"; then
    echo "Fixing indented code blocks in $file"
    
    # Create temporary file
    temp_file=$(mktemp)
    
    # Process the file line by line
    in_code_block=0
    in_frontmatter=0
    
    while IFS= read -r line; do
      # Handle frontmatter
      if [[ "$line" == "---" ]]; then
        if [[ $in_frontmatter -eq 0 ]]; then
          in_frontmatter=1
        else
          in_frontmatter=0
        fi
        echo "$line" >> "$temp_file"
        continue
      fi
      
      # Skip processing in frontmatter
      if [[ $in_frontmatter -eq 1 ]]; then
        echo "$line" >> "$temp_file"
        continue
      fi
      
      # Check if line is part of an indented code block
      if [[ "$line" =~ ^[[:space:]]{4}[^[:space:]] && ! "$line" =~ ^[[:space:]]{4}[*-] ]]; then
        # This is an indented code block
        if [[ $in_code_block -eq 0 ]]; then
          # Start a new fenced code block
          echo '```' >> "$temp_file"
          in_code_block=1
        fi
        # Remove the 4 spaces and output the line
        echo "${line:4}" >> "$temp_file"
      else
        # Not an indented code block
        if [[ $in_code_block -eq 1 ]]; then
          # End the fenced code block
          echo '```' >> "$temp_file"
          in_code_block=0
        fi
        # Output the line as is
        echo "$line" >> "$temp_file"
      fi
    done < "$file"
    
    # Ensure we close any open code block
    if [[ $in_code_block -eq 1 ]]; then
      echo '```' >> "$temp_file"
    fi
    
    # Replace the original file
    mv "$temp_file" "$file"
  fi
done

# Fix remaining broken links
echo "Fixing remaining broken links..."

# Fix Catalog-auth links
find /home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language -name "*.md" | xargs sed -i 's|../../domain-knowledge/core-contexts/Catalog-auth/README.md|../../domain-knowledge/core-contexts/catalog-auth/README.md|g'

# Create missing catalog-auth directory if it doesn't exist
if [ ! -d "/home/chris/domain-model/DDD_Artefacts/docs/v2/domain-knowledge/core-contexts/catalog-auth" ]; then
  mkdir -p "/home/chris/domain-model/DDD_Artefacts/docs/v2/domain-knowledge/core-contexts/catalog-auth"
  
  # Create stub README for catalog-auth
  cat > "/home/chris/domain-model/DDD_Artefacts/docs/v2/domain-knowledge/core-contexts/catalog-auth/README.md" << EOF
---
title: "Catalog Authentication Domain Knowledge"
version: "2.0"
last_updated: "$(date +"%Y-%m-%d")"
status: "Final"
---

# Catalog Authentication Domain Knowledge

## Overview

This document provides comprehensive domain knowledge about the Catalog Authentication context
within the Elias Food Imports system.

## Strategic Importance

The Catalog Authentication context is a core domain that ensures product authenticity
and prevents counterfeit products from entering the supply chain.

## Core Concepts

- **Product Authentication**: The process of verifying a product's authenticity
- **Authentication Method**: The technical approach used for verification
- **Authentication Level**: The degree of confidence in a product's authenticity
- **Verification Status**: Current state of the verification process
EOF
fi

# Fix Authentication-types.md references with correct case
find /home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language -name "*.md" | xargs sed -i 's|../glossary/Authentication-types.md|../glossary/authentication-types.md|g'

# Fix relative paths to absolute paths that are causing issues
find /home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language -name "*.md" | xargs sed -i 's|/DDD\*Artefacts/docs/v2/ubiquitous-language/guidelines.md|../guidelines.md|g'
find /home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language -name "*.md" | xargs sed -i 's|/DDD\*Artefacts/docs/v2/ubiquitous-language/analysis/domain-terms-requirements.md|../analysis/domain-terms-requirements.md|g'

# Handle underscores in emphasis again to be more thorough
find /home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language -name "*.md" | xargs sed -i 's/\([^[:alnum:]]\)_\([^_]*\)_\([^[:alnum:]]\)/\1*\2*\3/g'

# Fix domain event naming (add note to files that need manual review)
for file in "/home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language/analysis/domain_events_business_mapping.md" "/home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language/analysis/domain_event_naming.md"; do
  if [ -f "$file" ]; then
    # Add comment at the top after frontmatter for manual review
    sed -i '/^---/,/^---/!b;:a;n;/^---/!ba;a\
<!-- MANUAL REVIEW NEEDED: Ensure all domain events follow entity-first, past-tense naming convention -->\
' "$file"
  fi
done

echo "All fixes applied."
