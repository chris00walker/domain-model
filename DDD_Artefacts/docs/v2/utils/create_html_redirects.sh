#!/bin/bash

# Script to create HTML redirect files based on a redirect mapping
# Usage: ./create_html_redirects.sh <redirect_map.csv> <archive_dir>

REDIRECT_MAP=${1:-redirect_map.csv}
ARCHIVE_DIR=${2:-/home/chris/domain-model/DDD_Artefacts/docs/archive}

echo "Creating HTML redirects based on $REDIRECT_MAP..."

# Ensure archive directory exists
mkdir -p "$ARCHIVE_DIR"

# Skip header and process each line
tail -n +2 "$REDIRECT_MAP" | while IFS=, read -r old_path new_path status redirect_type; do
    # Skip entries with no new path or not approved
    if [[ -z "$new_path" || "$status" != "APPROVED" ]]; then
        continue
    fi
    
    # Create directory structure in archive
    old_rel_path=${old_path#/home/chris/domain-model/}
    archive_path="$ARCHIVE_DIR/$old_rel_path"
    archive_dir=$(dirname "$archive_path")
    
    mkdir -p "$archive_dir"
    
    # Convert to web paths
    old_web_path=${old_rel_path%.md}.html
    new_web_path=${new_path%.md}.html
    new_web_path=${new_web_path#/home/chris/domain-model/}
    
    # Create HTML redirect
    cat > "${archive_path%.md}.html" << EOF
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Redirecting...</title>
    <meta http-equiv="refresh" content="0; URL=/$new_web_path">
    <link rel="canonical" href="/$new_web_path">
</head>
<body>
    <h1>Redirecting...</h1>
    <p>This document has been moved to <a href="/$new_web_path">/$new_web_path</a>.</p>
</body>
</html>
EOF

    echo "Created redirect from ${archive_path%.md}.html to /$new_web_path"
done

echo "HTML redirects created in $ARCHIVE_DIR"
echo "Remember to add these files to your documentation hosting platform."
