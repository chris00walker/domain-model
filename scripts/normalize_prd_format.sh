#!/usr/bin/env bash
# normalize_prd_format.sh
# Ensure each PRD markdown file follows the standard header order exactly once:
#   H1 Title
#   [RELATED: ADR-XXX]
#   ## Overview
#   ## Functional Requirements
#   ## Benefits
# Existing duplicate or misplaced section headings are removed and a clean
# skeleton is inserted. Content outside these sections is preserved.

set -euo pipefail
DIR=${1:-DDD_Artefacts/docs/prd}

for file in $(find "$DIR" -name "*.md"); do
  mapfile -t lines < "$file"
  title_set=false related_set=false inserted=false
  output=()
  for i in "${!lines[@]}"; do
    line="${lines[$i]}"
    # Capture the first title (H1) and ignore subsequent titles
    if [[ $i -eq 0 ]]; then
      if [[ ! $line =~ ^# ]]; then
        line="# $(basename "$file" .md | sed 's/_/ /g' | sed 's/.*/\u&/')"
      fi
      title_set=true
      output+=("$line")
      continue
    fi

    # Skip any old Overview/Functional Requirements/Benefits headers
    if [[ $line =~ ^##\ (Overview|Functional\ Requirements|Benefits) ]]; then
      # Skip until next header or EOF
      continue
    fi

    # Track if related line present
    if [[ $line == *"[RELATED:"* ]]; then
      related_set=true
      output+=("$line")
      continue
    fi

    output+=("$line")
  done

  # Insert [RELATED:] after title if missing
  if ! $related_set; then
    output=("${output[0]}" "" "[RELATED: ADR-XXX]" "${output[@]:1}")
  fi

  # Insert skeleton after the [RELATED:] line (first occurrence)
  new_output=()
  added=false
  for line in "${output[@]}"; do
    new_output+=("$line")
    if ! $added && [[ $line == *"[RELATED:"* ]]; then
      new_output+=("")
      new_output+=("## Overview")
      new_output+=("")
      new_output+=("> **Status:** Draft — auto-normalised. Update with meaningful content.")
      new_output+=("")
      new_output+=("## Functional Requirements")
      new_output+=("")
      new_output+=("> _TBD – add detailed requirements here._")
      new_output+=("")
      new_output+=("## Benefits")
      new_output+=("")
      new_output+=("> Establishes consistent documentation and enables lint compliance.")
      new_output+=("")
      added=true
    fi
  done

  printf "%s\n" "${new_output[@]}" > "$file"
  echo "Normalized $file"
done

echo "Normalization complete."
