#!/bin/bash

# Master validation script for documentation
# Usage: ./run_validation.sh [directory]

DIRECTORY=${1:-../ubiquitous-language}
BASE_DIR=$(dirname "$0")
VALIDATION_FAILED=0
REPORT_FILE="validation_report.md"

echo "# Documentation Validation Report" > $REPORT_FILE
echo "" >> $REPORT_FILE
echo "Generated on: $(date)" >> $REPORT_FILE
echo "" >> $REPORT_FILE
echo "## Summary" >> $REPORT_FILE
echo "" >> $REPORT_FILE

# Run link validation
echo "Running link validation..."
$BASE_DIR/validate_links.sh $DIRECTORY > link_results.txt
LINK_STATUS=$?
LINK_ISSUES=$(grep "BROKEN LINK" link_results.txt | wc -l)
echo "* Link Validation: $([ $LINK_STATUS -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED ($LINK_ISSUES issues)")" >> $REPORT_FILE

# Run structure validation
echo "Running document structure validation..."
$BASE_DIR/validate_structure.sh $DIRECTORY > structure_results.txt
STRUCTURE_STATUS=$?
STRUCTURE_ISSUES=$(grep "MISSING" structure_results.txt | wc -l)
echo "* Structure Validation: $([ $STRUCTURE_STATUS -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED ($STRUCTURE_ISSUES issues)")" >> $REPORT_FILE

# Run style validation
echo "Running style guide validation..."
$BASE_DIR/validate_style.sh $DIRECTORY > style_results.txt
STYLE_STATUS=$?
STYLE_ISSUES=$(grep "STYLE ISSUE" style_results.txt | wc -l)
echo "* Style Guide Validation: $([ $STYLE_STATUS -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED ($STYLE_ISSUES issues)")" >> $REPORT_FILE

# Run terminology validation
echo "Running terminology validation..."
chmod +x $BASE_DIR/validate_terminology.sh
$BASE_DIR/validate_terminology.sh $DIRECTORY > terminology_results.txt
TERMINOLOGY_STATUS=$?
TERMINOLOGY_ISSUES=$(grep "TERMINOLOGY ISSUE" terminology_results.txt | wc -l)
echo "* Terminology Validation: $([ $TERMINOLOGY_STATUS -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED ($TERMINOLOGY_ISSUES issues)")" >> $REPORT_FILE

echo "" >> $REPORT_FILE

# Append detailed results
if [ $LINK_STATUS -ne 0 ]; then
  echo "## Link Issues" >> $REPORT_FILE
  echo "" >> $REPORT_FILE
  grep "BROKEN LINK" link_results.txt | sed 's/^/- /' >> $REPORT_FILE
  echo "" >> $REPORT_FILE
  VALIDATION_FAILED=1
fi

if [ $STRUCTURE_STATUS -ne 0 ]; then
  echo "## Structure Issues" >> $REPORT_FILE
  echo "" >> $REPORT_FILE
  grep "MISSING" structure_results.txt | sed 's/^/- /' >> $REPORT_FILE
  echo "" >> $REPORT_FILE
  VALIDATION_FAILED=1
fi

if [ $STYLE_STATUS -ne 0 ]; then
  echo "## Style Issues" >> $REPORT_FILE
  echo "" >> $REPORT_FILE
  grep "STYLE ISSUE" style_results.txt | sed 's/^/- /' >> $REPORT_FILE
  echo "" >> $REPORT_FILE
  VALIDATION_FAILED=1
fi

if [ $TERMINOLOGY_STATUS -ne 0 ]; then
  echo "## Terminology Issues" >> $REPORT_FILE
  echo "" >> $REPORT_FILE
  grep "TERMINOLOGY ISSUE" terminology_results.txt | sed 's/^/- /' >> $REPORT_FILE
  echo "" >> $REPORT_FILE
  VALIDATION_FAILED=1
fi

# Add recommendations section
echo "## Recommendations" >> $REPORT_FILE
echo "" >> $REPORT_FILE

if [ $VALIDATION_FAILED -eq 0 ]; then
  echo "✅ All validation checks passed. Documentation is ready for Phase 4: Redirect & Cleanup." >> $REPORT_FILE
else
  echo "The following actions are recommended:" >> $REPORT_FILE
  echo "" >> $REPORT_FILE
  
  if [ $LINK_STATUS -ne 0 ]; then
    echo "1. Fix broken links identified in the report." >> $REPORT_FILE
  fi
  
  if [ $STRUCTURE_STATUS -ne 0 ]; then
    echo "2. Update document structure to follow established guidelines:" >> $REPORT_FILE
    echo "   - Ensure all documents have proper frontmatter with title, version, and last_updated" >> $REPORT_FILE
    echo "   - Ensure all documents have consistent headings structure" >> $REPORT_FILE
  fi
  
  if [ $STYLE_STATUS -ne 0 ]; then
    echo "3. Address style guide inconsistencies:" >> $REPORT_FILE
    echo "   - Use ATX-style headings (# Heading) consistently" >> $REPORT_FILE
    echo "   - Use hyphens (-) for unordered lists" >> $REPORT_FILE
    echo "   - Use fenced code blocks (\`\`\`) instead of indented blocks" >> $REPORT_FILE
    echo "   - Remove trailing whitespace" >> $REPORT_FILE
  fi
  
  if [ $TERMINOLOGY_STATUS -ne 0 ]; then
    echo "4. Fix terminology inconsistencies:" >> $REPORT_FILE
    echo "   - Standardize capitalization of core domain terms" >> $REPORT_FILE
    echo "   - Ensure domain events follow entity-first, past-tense naming convention" >> $REPORT_FILE
  fi
  
  echo "" >> $REPORT_FILE
  echo "Once these issues are addressed, re-run validation to confirm all checks pass before proceeding to the next phase." >> $REPORT_FILE
fi

# Cleanup temp files
rm -f link_results.txt structure_results.txt style_results.txt terminology_results.txt

echo "Validation complete. See $REPORT_FILE for detailed results."

if [ $VALIDATION_FAILED -eq 0 ]; then
  echo "✅ All validation checks passed!"
  exit 0
else
  echo "❌ Validation failed. See $REPORT_FILE for details."
  exit 1
fi
