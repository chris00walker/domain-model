#!/bin/bash

# This script updates import paths in TypeScript files after directory renaming
# It changes paths from '../../../shared/' to '../../shared/'

# Find all TypeScript files in the src directory
export FILES=$(find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.d.ts" \) -exec grep -l "from '\.\.\/\.\.\/\.\.\/shared\/" {} \;)

# Update import paths in each file
for file in $FILES; do
  echo "Updating import paths in $file"
  # Update paths from '../../../shared/' to '../../shared/'
  sed -i '' "s|from '\.\.\/\.\.\/\.\.\/shared\/|from '../../shared/|g" "$file"
  sed -i '' 's|from "\.\.\/\.\.\/\.\.\/shared\/|from "../../shared/|g' "$file"
done

echo "Import paths updated successfully!"
