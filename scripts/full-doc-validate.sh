#!/bin/bash
# Full documentation validation for CI
# Mirrors the previous heavy pre-commit logic but runs in CI instead of locally.
set -euo pipefail

DOCS_DIR="DDD_Artefacts/docs"

CHANGED=$(git diff --name-only --diff-filter=ACM origin/main...HEAD | grep -E '\.(md|mdx|adoc|rst)$' || true)
# If running on freshly checked-out branch w/out diff context (workflow), fall back to all docs
if [ -z "$CHANGED" ]; then
  CHANGED=$(git ls-files | grep -E '\.(md|mdx|adoc|rst)$')
fi

echo "🔍 CI documentation validation…"

for file in $CHANGED; do
  [ -f "$file" ] || continue
  echo "\nValidating $file"

  # ADR reference check
  if grep -q 'ADR-' "$file"; then
    grep 'ADR-' "$file" | while read -r line; do
      adr_ref=$(echo "$line" | grep -o 'ADR-[0-9]\+' | head -n 1)
      [ -z "$adr_ref" ] && continue
      adr_num=$(echo "$adr_ref" | cut -d'-' -f2)
      if ! ls "$DOCS_DIR/adr/"*"${adr_num}"* 1>/dev/null 2>&1; then
        echo "❌ Invalid ADR reference: $adr_ref in $file"; exit 1
      fi
    done
  else
    echo "⚠️ No ADR references found in $file"
  fi

  # Duplicate content fingerprint
  fp=$(head -c 1000 "$file" | tr '[:upper:]' '[:lower:]' | tr -d '[:space:]' | tr -d '[:punct:]' | head -c 50)
  if [ -n "$fp" ]; then
    while read -r other; do
      [ "$other" = "$file" ] && continue
      other_fp=$(head -c 1000 "$other" | tr '[:upper:]' '[:lower:]' | tr -d '[:space:]' | tr -d '[:punct:]' | head -c 50)
      if [ "$fp" = "$other_fp" ]; then
        echo "❌ Duplicate content candidate between $file and $other"; exit 1
      fi
    done < <(git ls-files "${DOCS_DIR}" | grep -E '\.(md|mdx)$')
  fi

  # Similar title detection
  if title=$(grep -m1 '^# ' "$file" | sed 's/^# //'); then
    if [ ${#title} -gt 10 ]; then
      matches=$(grep -rlF "$title" --include="*.md" "$DOCS_DIR" | grep -v "$file" || true)
      if [ -n "$matches" ]; then
        echo "⚠️ Similar title found for '$title' in:\n$matches"; fi
    fi
  fi

done

# Rule-workflow integration (treat warning as failure in CI)
./.windsurf/scripts/validate-integration.sh
if grep -q "UNLINKED RULE" <(./.windsurf/scripts/validate-integration.sh || true); then
  echo "❌ Unlinked rules detected."; exit 1; fi

# eCommerce tag coverage (same logic as before)
if ! grep -qr "ecommerce" .windsurf/workflows; then
  echo "❌ Missing eCommerce tags in workflows"; exit 1; fi

echo "✅ CI documentation validation passed"
