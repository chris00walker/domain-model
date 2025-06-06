#!/bin/bash

# Script to generate a redirect map between old and new documentation locations
# Usage: ./generate_redirect_map.sh <old_docs_path> <new_docs_path>

OLD_DOCS=${1:-/home/chris/domain-model/business-model}
NEW_DOCS=${2:-/home/chris/domain-model/DDD_Artefacts/docs/v2}
OUTPUT_FILE="redirect_map.csv"

echo "Generating redirect mapping from $OLD_DOCS to $NEW_DOCS..."

# Ensure output in CSV format with headers
echo "OldPath,NewPath,Status,RedirectType" > $OUTPUT_FILE

# Find all markdown files in old directory
find "$OLD_DOCS" -name "*.md" | while read old_file; do
    # Get relative path from old docs root
    rel_path=${old_file#$OLD_DOCS/}
    
    # Convert to base filename for matching purposes
    base_name=$(basename "$old_file" .md)
    filename_lower=$(echo "$base_name" | tr '[:upper:]' '[:lower:]')
    
    # Search for potential matches in new docs
    matched_files=$(find "$NEW_DOCS" -name "*.md" | xargs grep -l "$filename_lower" 2>/dev/null)
    
    if [ -n "$matched_files" ]; then
        # Take the first match as best candidate
        best_match=$(echo "$matched_files" | head -n 1)
        echo "$old_file,$best_match,CANDIDATE,MATCH_BY_CONTENT"
    else
        # Look for filename-based matches
        filename_match=$(find "$NEW_DOCS" -name "*$filename_lower*.md" 2>/dev/null | head -n 1)
        
        if [ -n "$filename_match" ]; then
            echo "$old_file,$filename_match,CANDIDATE,MATCH_BY_FILENAME"
        else
            # No match found
            echo "$old_file,,MISSING,NO_MATCH"
        fi
    fi
done >> $OUTPUT_FILE

echo "Redirect mapping generated in $OUTPUT_FILE"
echo "Please review the mapping and update the Status column as needed."
echo "For entries marked as MISSING, manually identify the appropriate new location."
