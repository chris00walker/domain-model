#!/bin/bash

# Script to find references to documentation paths in code and other files
# Usage: ./find_doc_references.sh <project_root> <redirect_map.csv>

PROJECT_ROOT=${1:-/home/chris/domain-model}
REDIRECT_MAP=${2:-redirect_map.csv}
OUTPUT_FILE="doc_references.csv"

echo "Searching for documentation references in $PROJECT_ROOT..."

# Create CSV header
echo "SourceFile,LineNumber,MatchedPath,NewPath" > $OUTPUT_FILE

# Extract old paths from redirect map (skip header)
old_paths=$(tail -n +2 "$REDIRECT_MAP" | cut -d',' -f1)

# Search for each old path in project files
for old_path in $old_paths; do
    # Get relative path for grep pattern
    rel_path=${old_path#$PROJECT_ROOT/}
    
    # Look for references to this path in code files
    # Exclude the utils directory and generated files
    grep -r --include="*.{ts,js,java,md,json,yaml,yml}" \
         --exclude-dir={node_modules,dist,build,.git,archive,utils} \
         -l "$rel_path" "$PROJECT_ROOT" | while read -r source_file; do
        
        # Get corresponding new path from redirect map
        new_path=$(grep "^$old_path," "$REDIRECT_MAP" | cut -d',' -f2)
        
        # Find line numbers for each occurrence
        grep -n "$rel_path" "$source_file" | while IFS=":" read -r line_num match; do
            echo "$source_file,$line_num,$old_path,$new_path"
        done
    done
done >> $OUTPUT_FILE

echo "Documentation references found and saved to $OUTPUT_FILE"
echo "Review this file to identify where documentation references need to be updated."
