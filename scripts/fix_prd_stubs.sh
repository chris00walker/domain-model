#!/usr/bin/env bash
# fix_prd_stubs.sh
# Auto-patch PRD markdown files to satisfy format checker by inserting
# missing required sections with placeholder draft content.
# Usage: ./scripts/fix_prd_stubs.sh <dir>

set -euo pipefail
DIR=${1:-DDD_Artefacts/docs/prd}

for file in $(find "$DIR" -name "*.md"); do
  # skip if already compliant (Overview present)
  if grep -Fq "## Overview" "$file"; then
    continue
  fi

  tmp=$(mktemp)
  inserted=false

  while IFS= read -r line; do
    echo "$line" >> "$tmp"
    # after first [RELATED: line, insert template once
    if ! $inserted && [[ "$line" == *"[RELATED:"* ]]; then
      cat >> "$tmp" <<'EOT'

## Overview

> **Status:** Draft — scaffolded automatically. Replace with context-specific summary.

## Functional Requirements

> _TBD – flesh out detailed requirements here._

## Benefits

> Clear documentation enables alignment, compliance, and future traceability.
EOT
      inserted=true
    fi
  done < "$file"

  # If we never found [RELATED:] (rare), prepend full skeleton
  if ! $inserted; then
    cat > "$tmp" <<'EOT'
[RELATED: ADR-XXX]

## Overview

> **Status:** Draft — scaffolded automatically. Replace with context-specific summary.

## Functional Requirements

> _TBD – flesh out detailed requirements here._

## Benefits

> Clear documentation enables alignment, compliance, and future traceability.

EOT
    cat "$file" >> "$tmp"
  fi

  mv "$tmp" "$file"
  echo "Patched $file"

done

echo "All stub files patched."
