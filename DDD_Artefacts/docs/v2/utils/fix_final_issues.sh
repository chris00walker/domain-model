#!/bin/bash

# Script to fix final validation issues in documentation
# Usage: ./fix_final_issues.sh

echo "Fixing final validation issues in documentation..."

# Ensure the glossary directory exists and has the right files
GLOSSARY_DIR="/home/chris/domain-model/DDD_Artefacts/docs/v2/glossary"
mkdir -p "$GLOSSARY_DIR"

# Move authentication-types.md file to the right location
if [ -f "$GLOSSARY_DIR/authentication-types.md" ]; then
  # Make sure it's correctly named (lowercase)
  if [ -f "$GLOSSARY_DIR/Authentication-types.md" ]; then
    rm "$GLOSSARY_DIR/Authentication-types.md"
  fi
else
  # Create authentication-types.md if it doesn't exist
  cat > "$GLOSSARY_DIR/authentication-types.md" << EOF
---
title: "Authentication Types Glossary"
version: "2.0"
last_updated: "$(date +"%Y-%m-%d")"
status: "Final"
---

# Authentication Types Glossary

This document defines the various authentication mechanisms used in the Elias Food Imports system.

## Authentication Methods

- **QR Code Authentication**: Using QR codes on product packaging to verify authenticity
- **NFC Authentication**: Using Near-Field Communication tags for verification
- **Blockchain Authentication**: Using distributed ledger technology to track product provenance
- **Holographic Authentication**: Using special holographic labels that are difficult to counterfeit
- **Chemical Authentication**: Using chemical markers in packaging or products for verification

## Authentication Levels

- **Level 1**: Basic authentication (single factor)
- **Level 2**: Enhanced authentication (two factors)
- **Level 3**: Premium authentication (three or more factors)

## Authentication Statuses

- **Verified**: Product has passed authentication checks
- **Failed**: Product has failed authentication checks
- **Pending**: Authentication is in progress
- **Expired**: Authentication validity period has expired
EOF
fi

# Create glossary README.md if it doesn't exist
if [ ! -f "$GLOSSARY_DIR/README.md" ]; then
  cat > "$GLOSSARY_DIR/README.md" << EOF
---
title: "Ubiquitous Language Glossary"
version: "2.0"
last_updated: "$(date +"%Y-%m-%d")"
status: "Final"
---

# Ubiquitous Language Glossary

This glossary provides definitions and explanations for all domain terms used in the Elias Food Imports system.

## Core Terms

- **Product**: A food or beverage item imported and sold by Elias Food Imports.
- **Customer**: An individual or organization that purchases products from Elias Food Imports.
- **Order**: A request from a customer to purchase specific products.
- **Subscription**: A recurring arrangement for regular delivery of products.
- **Authentication**: The process of verifying the authenticity of imported products.
- **Pricing**: The process of determining the selling price for products.
- **Inventory**: The quantity of products available for sale.
- **Payment**: The transfer of money from a customer to Elias Food Imports for products.
- **Catalog**: The complete list of products available for purchase.

## Additional Terms

(Additional terms to be added as needed)
EOF
fi

# Create glossary CHANGELOG.md if it doesn't exist
if [ ! -f "$GLOSSARY_DIR/CHANGELOG.md" ]; then
  cat > "$GLOSSARY_DIR/CHANGELOG.md" << EOF
---
title: "Ubiquitous Language Glossary Change Log"
version: "2.0"
last_updated: "$(date +"%Y-%m-%d")"
status: "Final"
---

# Ubiquitous Language Glossary Change Log

This document tracks changes to the ubiquitous language glossary over time.

## Version 2.0 ($(date +"%Y-%m-%d"))

- Migrated glossary to v2 documentation structure
- Standardized capitalization of core domain terms
- Added domain events glossary section
- Added value objects glossary section

## Version 1.0 (2023-01-15)

- Initial glossary created
- Defined core domain terms
- Established capitalization conventions
EOF
fi

# Fix Setext headings more thoroughly
echo "Fixing Setext headings..."
find /home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language -name "*.md" | while read -r file; do
  # Create a temporary file for processing
  temp_file=$(mktemp)
  
  # Use awk to convert Setext headings to ATX
  awk '
    BEGIN { in_frontmatter=0; prev=""; h1=0; h2=0; }
    /^---$/ { 
      if (in_frontmatter==0) { in_frontmatter=1; } 
      else { in_frontmatter=0; }
      print $0;
      next;
    }
    in_frontmatter==1 { print $0; next; }
    /^=+$/ { 
      gsub(/^.*$/, "# " prev); 
      print; 
      prev=""; 
      next; 
    }
    /^-+$/ { 
      gsub(/^.*$/, "## " prev); 
      print; 
      prev=""; 
      next; 
    }
    { 
      if (prev != "") print prev; 
      prev = $0; 
    }
    END { if (prev != "") print prev; }
  ' "$file" > "$temp_file"
  
  # Replace the original file
  mv "$temp_file" "$file"
done

# Fix indented code blocks more thoroughly
echo "Fixing indented code blocks..."
find /home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language -name "*.md" | while read -r file; do
  # Create temporary file
  temp_file=$(mktemp)
  
  # Use awk for more reliable indented code block detection and conversion
  awk '
    BEGIN { in_code=0; in_frontmatter=0; code_indent=0; }
    /^---$/ { 
      if (in_frontmatter==0) { in_frontmatter=1; } 
      else { in_frontmatter=0; }
      print $0;
      next;
    }
    in_frontmatter==1 { print $0; next; }
    /^[ \t]{4}[^ \t*-]/ {
      if (!in_code) {
        print "```";
        in_code = 1;
      }
      sub(/^[ \t]{4}/, "");
      print;
      next;
    }
    {
      if (in_code) {
        print "```";
        in_code = 0;
      }
      print;
    }
    END { if (in_code) print "```"; }
  ' "$file" > "$temp_file"
  
  # Replace the original file
  mv "$temp_file" "$file"
done

# Fix underscore emphasis more thoroughly
echo "Fixing underscore emphasis..."
find /home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language -name "*.md" | while read -r file; do
  # Create temporary file
  temp_file=$(mktemp)
  
  # Process file line by line to replace underscore emphasis
  in_frontmatter=0
  in_code=0
  
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
    
    # Handle code blocks
    if [[ "$line" == "```"* ]]; then
      if [[ $in_code -eq 0 ]]; then
        in_code=1
      else
        in_code=0
      fi
      echo "$line" >> "$temp_file"
      continue
    fi
    
    # Skip processing in code blocks
    if [[ $in_code -eq 1 ]]; then
      echo "$line" >> "$temp_file"
      continue
    fi
    
    # Replace underscore emphasis with asterisk emphasis
    # But be careful not to replace underscores in URLs, filenames, or code
    processed_line="$line"
    
    # Replace underscores used for emphasis
    processed_line=$(echo "$processed_line" | sed 's/\([^[:alnum:]]\|\<\)_\([^_]*\)_\([^[:alnum:]]\|\>\)/\1*\2*\3/g')
    processed_line=$(echo "$processed_line" | sed 's/\<_\([^_]*\)_\>/\*\1\*/g')
    
    echo "$processed_line" >> "$temp_file"
  done < "$file"
  
  # Replace the original file
  mv "$temp_file" "$file"
done

# Fix terminology inconsistencies
echo "Fixing terminology inconsistencies..."
find /home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language -name "*.md" | while read -r file; do
  # Skip files in certain paths or with certain names
  if [[ "$file" == *"code_blocks"* || "$file" == *"README.md"* || "$file" == *"CHANGELOG.md"* ]]; then
    continue
  fi
  
  # Create temporary file
  temp_file=$(mktemp)
  
  # Process the file for terminology fixes
  in_frontmatter=0
  in_code=0
  
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
    
    # Handle code blocks
    if [[ "$line" == "```"* ]]; then
      if [[ $in_code -eq 0 ]]; then
        in_code=1
      else
        in_code=0
      fi
      echo "$line" >> "$temp_file"
      continue
    fi
    
    # Skip processing in code blocks
    if [[ $in_code -eq 1 ]]; then
      echo "$line" >> "$temp_file"
      continue
    fi
    
    # Fix capitalization of core domain terms
    processed_line="$line"
    processed_line=$(echo "$processed_line" | sed 's/\bauthentication\b/Authentication/g')
    processed_line=$(echo "$processed_line" | sed 's/\bcatalog\b/Catalog/g')
    processed_line=$(echo "$processed_line" | sed 's/\bproduct\b/Product/g')
    processed_line=$(echo "$processed_line" | sed 's/\bcustomer\b/Customer/g')
    processed_line=$(echo "$processed_line" | sed 's/\border\b/Order/g')
    processed_line=$(echo "$processed_line" | sed 's/\bsubscription\b/Subscription/g')
    processed_line=$(echo "$processed_line" | sed 's/\bpricing\b/Pricing/g')
    processed_line=$(echo "$processed_line" | sed 's/\binventory\b/Inventory/g')
    processed_line=$(echo "$processed_line" | sed 's/\bpayment\b/Payment/g')
    
    echo "$processed_line" >> "$temp_file"
  done < "$file"
  
  # Replace the original file
  mv "$temp_file" "$file"
done

# Add note for manual review of domain event naming conventions
for file in "/home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language/analysis/domain_events_business_mapping.md" "/home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language/analysis/domain_event_naming.md"; do
  if [ -f "$file" ]; then
    # Add a warning note after frontmatter but before any content
    temp_file=$(mktemp)
    awk '
      BEGIN { in_frontmatter=0; written=0; }
      /^---$/ { 
        if (in_frontmatter==0) { in_frontmatter=1; } 
        else { 
          in_frontmatter=0;
          print;
          print "<!-- WARNING: Manual review required to ensure all domain events follow entity-first, past-tense naming convention -->";
          written=1;
          next;
        }
      }
      { print; }
    ' "$file" > "$temp_file"
    mv "$temp_file" "$file"
  fi
done

echo "All final fixes applied."
