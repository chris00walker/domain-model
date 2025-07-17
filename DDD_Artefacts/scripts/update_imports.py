#!/usr/bin/env python3
import os
import re
from pathlib import Path

def update_imports_in_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Update import paths from '../../../shared/' to '../../shared/'
        updated_content = re.sub(
            r"from\s+['\"]\.\.\/\.\.\/\.\.\/shared\/",
            "from '../../shared/",
            content
        )
        
        # Update import paths from "../../../shared/" to "../../shared/"
        updated_content = re.sub(
            r'from\s+["\']\.\.\/\.\.\/\.\.\/shared\/',
            'from "../../shared/',
            updated_content
        )
        
        if updated_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(updated_content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {str(e)}")
        return False

def main():
    src_dir = Path('src')
    files_updated = 0
    
    # Find all TypeScript and JavaScript files
    for ext in ['*.ts', '*.tsx', '*.d.ts']:
        for file_path in src_dir.rglob(ext):
            if update_imports_in_file(str(file_path)):
                print(f"Updated imports in {file_path}")
                files_updated += 1
    
    print(f"\nSuccessfully updated imports in {files_updated} files!")

if __name__ == "__main__":
    main()
