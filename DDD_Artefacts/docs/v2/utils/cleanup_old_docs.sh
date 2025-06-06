#!/bin/bash

# Script to clean up unnecessary files in the docs directory
# after migration to v2 structure
# Usage: ./cleanup_old_docs.sh

DOCS_DIR="/home/chris/domain-model/DDD_Artefacts/docs"
LOG_FILE="cleanup_docs_$(date +%Y%m%d%H%M%S).log"
REMOVED_COUNT=0

echo "Starting documentation cleanup at $(date)" | tee -a $LOG_FILE
echo "Working directory: $DOCS_DIR" | tee -a $LOG_FILE
echo "-------------------------------------------" | tee -a $LOG_FILE

# List all files in the docs directory
for file in "$DOCS_DIR"/*; do
  # Skip if it's not a file
  if [ ! -f "$file" ]; then
    continue
  fi
  
  # Skip README.md
  if [ "$(basename "$file")" = "README.md" ]; then
    echo "Keeping README.md" | tee -a $LOG_FILE
    continue
  fi
  
  # Remove the file
  echo "Removing: $(basename "$file")" | tee -a $LOG_FILE
  rm "$file"
  
  # Check if removal was successful
  if [ $? -eq 0 ]; then
    ((REMOVED_COUNT++))
  else
    echo "Error removing $(basename "$file")" | tee -a $LOG_FILE
  fi
done

echo "-------------------------------------------" | tee -a $LOG_FILE
echo "Cleanup completed: $REMOVED_COUNT files removed" | tee -a $LOG_FILE
echo "Cleanup log saved to $LOG_FILE" | tee -a $LOG_FILE

# Check what's left in the directory
echo "-------------------------------------------" | tee -a $LOG_FILE
echo "Remaining items in $DOCS_DIR:" | tee -a $LOG_FILE
ls -la "$DOCS_DIR" | tee -a $LOG_FILE
