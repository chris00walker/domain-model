#!/bin/bash

# Script to fix problematic links in markdown files
# Usage: ./fix_markdown_links.sh

echo "Fixing markdown links in documentation..."

# Get all markdown files
find /home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language -name "*.md" | while read -r file; do
  echo "Checking links in $file"
  
  # Fix asterisk-containing links by replacing asterisks with underscores
  sed -i 's/ubiquitous\*language\*/ubiquitous_language_/g' "$file"
  sed -i 's/business\*metrics\*/business_metrics_/g' "$file"
  
  # Fix absolute paths to use relative paths instead
  sed -i 's|/DDD_Artefacts/docs/v2/ubiquitous-language/guidelines.md|../guidelines.md|g' "$file"
  sed -i 's|/DDD_Artefacts/docs/v2/ubiquitous-language/analysis/domain-terms-requirements.md|../analysis/domain-terms-requirements.md|g' "$file"
  
  # Fix catalog-auth link
  sed -i 's|../../domain-knowledge/core-contexts/Catalog-auth/README.md|../../domain-knowledge/core-contexts/catalog-auth/README.md|g' "$file"
  
  # Fix authentication-types.md capitalization
  sed -i 's|Authentication-types.md|authentication-types.md|g' "$file"
  
  # Fix broken relative links in guidelines.md
  if [[ "$file" == *"guidelines.md" ]]; then
    sed -i 's|guidelines/ubiquitous_language_guidelines.md|./guidelines/ubiquitous_language_guidelines.md|g' "$file"
    sed -i 's|guidelines/ubiquitous_language_evolution.md|./guidelines/ubiquitous_language_evolution.md|g' "$file"
    sed -i 's|guidelines/ubiquitous_language_review_checklist.md|./guidelines/ubiquitous_language_review_checklist.md|g' "$file"
  fi
  
  # Fix broken links in README.md
  if [[ "$file" == *"README.md" ]]; then
    # Remove duplicate link entries if they exist
    awk '!seen[$0]++' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
  fi
  
  # Fix links in ubiquitous_language_guidelines.md
  if [[ "$file" == *"ubiquitous_language_guidelines.md" ]]; then
    sed -i 's|./ubiquitous_language_evolution.md|../guidelines/ubiquitous_language_evolution.md|g' "$file"
  fi

  # Create missing catalog-auth directory if needed
  if grep -q "catalog-auth" "$file"; then
    mkdir -p /home/chris/domain-model/DDD_Artefacts/docs/v2/domain-knowledge/core-contexts/catalog-auth
    
    # Create stub README for catalog-auth if it doesn't exist
    if [ ! -f /home/chris/domain-model/DDD_Artefacts/docs/v2/domain-knowledge/core-contexts/catalog-auth/README.md ]; then
      cat > /home/chris/domain-model/DDD_Artefacts/docs/v2/domain-knowledge/core-contexts/catalog-auth/README.md << EOF
---
title: "Catalog Authentication Domain Knowledge"
version: "1.0"
last_updated: "$(date +"%Y-%m-%d")"
status: "Draft"
---

# Catalog Authentication Domain Knowledge

## Overview

This document provides comprehensive domain knowledge about the Catalog Authentication context
within the Elias Food Imports system.

## Strategic Importance

The Catalog Authentication context is a core domain that ensures product authenticity
and prevents counterfeit products from entering the supply chain.

## Core Concepts

(To be populated with domain-specific information)
EOF
      echo "Created catalog-auth README.md"
    fi
  fi
done

echo "Link fixing complete."
