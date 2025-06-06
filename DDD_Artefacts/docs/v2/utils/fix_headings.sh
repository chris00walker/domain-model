#!/bin/bash

# Script to convert Setext style headings (=== or ---) to ATX style (# or ##)
# Usage: ./fix_headings.sh

echo "Converting Setext style headings to ATX style..."

# Get all markdown files
find /home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language -name "*.md" | while read -r file; do
  echo "Checking headings in $file"
  
  # Create a temporary file
  temp_file=$(mktemp)
  previous_line=""
  skip_next=0
  
  while IFS= read -r line; do
    if [ $skip_next -eq 1 ]; then
      # Skip this line (it's a heading delimiter we've already processed)
      skip_next=0
      continue
    fi
    
    # Check if the line is a Setext heading delimiter
    if [[ "$line" =~ ^===+$ ]]; then
      # This is an H1 delimiter, convert previous line to ATX H1
      echo "# $previous_line" >> "$temp_file"
      skip_next=0  # We've already processed this line
    elif [[ "$line" =~ ^---+$ ]]; then
      # This is an H2 delimiter, convert previous line to ATX H2
      echo "## $previous_line" >> "$temp_file"
      skip_next=0  # We've already processed this line
    else
      # Not a heading delimiter, just output the previous line
      # but only if we have a previous line (not the first line of the file)
      if [ -n "$previous_line" ]; then
        echo "$previous_line" >> "$temp_file"
      fi
      # Remember this line for next iteration
      previous_line="$line"
    fi
  done < "$file"
  
  # Don't forget the last line
  if [ -n "$previous_line" ]; then
    echo "$previous_line" >> "$temp_file"
  fi
  
  # Replace the original file with our processed version
  mv "$temp_file" "$file"
done

echo "Heading conversion complete."
