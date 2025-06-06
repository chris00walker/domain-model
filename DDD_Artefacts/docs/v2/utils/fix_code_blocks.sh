#!/bin/bash

# Script to convert indented code blocks to fenced code blocks
# Usage: ./fix_code_blocks.sh

echo "Converting indented code blocks to fenced code blocks..."

# Define files to process based on validation report
declare -a FILES_TO_PROCESS=(
  "/home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language/implementation-guides/testing.md"
  "/home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language/implementation-guides/api_design.md"
  "/home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language/implementation-guides/ui_design.md"
  "/home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language/implementation-guides/database_design.md"
  "/home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language/business-integration/business_metrics_domain_mapping.md"
  "/home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language/analysis/domain_events_business_mapping.md"
  "/home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language/analysis/domain_event_naming.md"
  "/home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language/analysis/value_objects_analysis.md"
)

for file in "${FILES_TO_PROCESS[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file"
    
    # Create a temporary file
    temp_file=$(mktemp)
    
    # Process the file
    in_code_block=0
    blank_lines_after_code=0
    
    while IFS= read -r line; do
      # Check if line starts with 4 spaces (indented code block)
      if [[ "$line" =~ ^[[:blank:]]{4}[^[:blank:]] ]]; then
        # We're starting or continuing a code block
        if [ $in_code_block -eq 0 ]; then
          # This is the start of a new code block
          echo '```' >> "$temp_file"  # Start fenced block
          in_code_block=1
        fi
        # Remove the 4 spaces and add the line to the output
        echo "${line:4}" >> "$temp_file"
      else
        # Not an indented code line
        if [ $in_code_block -eq 1 ]; then
          # We just exited a code block
          # Check if this line is blank
          if [[ -z "$line" ]]; then
            blank_lines_after_code=$((blank_lines_after_code + 1))
          else
            # We have non-blank content after a code block
            echo '```' >> "$temp_file"  # End fenced block
            
            # Add back any blank lines we held
            for ((i=0; i<blank_lines_after_code; i++)); do
              echo "" >> "$temp_file"
            done
            
            echo "$line" >> "$temp_file"
            in_code_block=0
            blank_lines_after_code=0
          fi
        else
          # Regular non-code line
          echo "$line" >> "$temp_file"
        fi
      fi
    done < "$file"
    
    # If we're still in a code block at the end of the file, close it
    if [ $in_code_block -eq 1 ]; then
      echo '```' >> "$temp_file"
    fi
    
    # Replace the original file with our processed version
    mv "$temp_file" "$file"
  else
    echo "Warning: File not found - $file"
  fi
done

echo "Code block conversion complete."
