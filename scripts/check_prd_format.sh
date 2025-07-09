#!/usr/bin/env bash
# check_prd_format.sh
# Basic lint: ensure PRD markdown files contain required sections in correct order.
# Usage: ./check_prd_format.sh <path>

set -euo pipefail

DIR=${1:-DDD_Artefacts/docs/prd}
REQUIRED=("# " "[RELATED:" "## Overview" "## Functional Requirements" "## Benefits")

fail=0
for file in $(find "$DIR" -name "*.md"); do
  order=()
  while IFS= read -r line; do
    case "$line" in
      "# "*) token="# " ;;
      "[RELATED:"*) token="[RELATED:" ;;
      "## Overview"*) token="## Overview" ;;
      "## Functional Requirements"*) token="## Functional Requirements" ;;
      "## Benefits"*) token="## Benefits" ;;
      *) token="" ;;
    esac
    if [[ -n "$token" ]]; then
      # add only first occurrence
      found=false
      for existing in "${order[@]}"; do
        if [[ "$existing" == "$token" ]]; then
          found=true; break
        fi
      done
      if ! $found; then
        order+=("$token")
      fi
    fi
  done < "$file"

  # check presence
  for req in "${REQUIRED[@]}"; do
    if ! grep -Fq "$req" "$file"; then
      echo "FORMAT ERROR: $file missing section '$req'" >&2
      fail=1
    fi
  done
  # check order simple
  if [[ $(printf '%s\n' "${order[@]}") != $(printf '%s\n' "${REQUIRED[@]}") ]]; then
    echo "FORMAT ERROR: $file sections out of order" >&2
    fail=1
  fi

done

if [[ $fail -ne 0 ]]; then
  echo "\nPRD format check failed." >&2
  exit 1
else
  echo "PRD format check passed."
fi
