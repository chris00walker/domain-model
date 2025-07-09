#!/bin/bash
# Workflow-Rule-Memory Integration Validator

# Check for unlinked rules
warn=0
for rule in .windsurf/rules/*.md; do
  if ! grep -qr "$(basename $rule)" .windsurf/workflows; then
    echo "⚠️ UNLINKED RULE (warning only): $rule"
    warn=1
  fi
done

if [ $warn -eq 0 ]; then
  echo "✅ All rules linked to workflows"
else
  echo "⚠️ Some rules are not linked to workflows. Review later."
fi
exit 0
