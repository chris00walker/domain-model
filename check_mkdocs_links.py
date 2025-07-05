import os
import yaml

# Load the mkdocs.yml file
with open('mkdocs.yml', 'r') as f:
    mkdocs_config = yaml.safe_load(f)

# Function to check if a file exists
def check_file_exists(file_path):
    full_path = os.path.join('DDD_Artefacts/docs', file_path)
    return os.path.isfile(full_path), full_path

# Function to recursively check navigation items
def check_nav_items(items, prefix=""):
    missing_files = []
    for item in items:
        if isinstance(item, dict):
            for key, value in item.items():
                if isinstance(value, str):
                    exists, path = check_file_exists(value)
                    if not exists:
                        missing_files.append((f"{prefix}{key}", value, path))
                elif isinstance(value, list):
                    missing_files.extend(check_nav_items(value, f"{prefix}{key} > "))
        elif isinstance(item, str):
            exists, path = check_file_exists(item)
            if not exists:
                missing_files.append((f"{prefix}Item", item, path))
    return missing_files

# Check all navigation items
missing_files = check_nav_items(mkdocs_config.get('nav', []))

# Print results
if missing_files:
    print("\nMissing files referenced in mkdocs.yml navigation:")
    print("-" * 80)
    for title, rel_path, full_path in missing_files:
        print(f"Section: {title}")
        print(f"  Reference: {rel_path}")
        print(f"  Full path: {full_path}")
        print("-" * 80)
else:
    print("All files in mkdocs.yml navigation exist.")

# Check for orphaned files (files in docs directory not in navigation)
print("\nChecking for orphaned files (not in navigation)...")
all_files = set()
for root, dirs, files in os.walk('DDD_Artefacts/docs'):
    for file in files:
        if file.endswith('.md'):
            rel_path = os.path.relpath(os.path.join(root, file), 'DDD_Artefacts/docs')
            all_files.add(rel_path)

# Get all files in navigation
def get_nav_files(items):
    nav_files = set()
    for item in items:
        if isinstance(item, dict):
            for value in item.values():
                if isinstance(value, str):
                    nav_files.add(value)
                elif isinstance(value, list):
                    nav_files.update(get_nav_files(value))
        elif isinstance(item, str):
            nav_files.add(item)
    return nav_files

nav_files = get_nav_files(mkdocs_config.get('nav', []))
orphaned_files = all_files - nav_files

if orphaned_files:
    print("\nOrphaned files (not in navigation):")
    print("-" * 80)
    for file in sorted(orphaned_files):
        print(file)
else:
    print("No orphaned files found.")
