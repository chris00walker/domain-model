#!/bin/bash

# Script to fix common link issues identified in validation
# Usage: ./fix_links.sh

echo "Fixing broken links in Ubiquitous Language documentation..."

# Create missing glossary directory if needed
mkdir -p /home/chris/domain-model/DDD_Artefacts/docs/v2/glossary

# Create stub README.md in glossary for now
if [ ! -f /home/chris/domain-model/DDD_Artefacts/docs/v2/glossary/README.md ]; then
  cat > /home/chris/domain-model/DDD_Artefacts/docs/v2/glossary/README.md << EOF
---
title: "Ubiquitous Language Glossary"
version: "1.0"
last_updated: "2025-06-06"
status: "Draft"
---

# Ubiquitous Language Glossary

## Overview

This glossary provides definitions for key terms used throughout the Elias Food Imports domain model.
It serves as the central reference for the ubiquitous language established between domain experts and developers.

## Glossary Terms

(To be populated with domain terms and definitions)
EOF
  echo "Created glossary README.md"
fi

# Create stub CHANGELOG.md in glossary for now
if [ ! -f /home/chris/domain-model/DDD_Artefacts/docs/v2/glossary/CHANGELOG.md ]; then
  cat > /home/chris/domain-model/DDD_Artefacts/docs/v2/glossary/CHANGELOG.md << EOF
---
title: "Ubiquitous Language Glossary Changelog"
version: "1.0"
last_updated: "2025-06-06"
status: "Draft"
---

# Ubiquitous Language Glossary Changelog

## Overview

This document tracks changes to the ubiquitous language glossary over time.

## Version History

### Version 1.0 (2025-06-06)
- Initial creation of glossary structure
EOF
  echo "Created glossary CHANGELOG.md"
fi

# Create stub authentication-types.md in glossary for now
if [ ! -f /home/chris/domain-model/DDD_Artefacts/docs/v2/glossary/authentication-types.md ]; then
  cat > /home/chris/domain-model/DDD_Artefacts/docs/v2/glossary/authentication-types.md << EOF
---
title: "Authentication Types Glossary"
version: "1.0"
last_updated: "2025-06-06"
status: "Draft"
---

# Authentication Types Glossary

## Overview

This document defines the various authentication mechanisms and types used in the Elias Food Imports system.

## Authentication Types

(To be populated with authentication types and definitions)
EOF
  echo "Created glossary authentication-types.md"
fi

# Create technical directory and API design guide
mkdir -p /home/chris/domain-model/DDD_Artefacts/docs/v2/technical
if [ ! -f /home/chris/domain-model/DDD_Artefacts/docs/v2/technical/api-design-guide.md ]; then
  cat > /home/chris/domain-model/DDD_Artefacts/docs/v2/technical/api-design-guide.md << EOF
---
title: "API Design Guide"
version: "1.0"
last_updated: "2025-06-06"
status: "Draft"
---

# API Design Guide

## Overview

This document provides technical guidelines for designing APIs within the Elias Food Imports system,
with a focus on consistency with the ubiquitous language.

## API Design Principles

(To be populated with API design principles)
EOF
  echo "Created technical api-design-guide.md"
fi

# Create guidelines.md in ubiquitous-language directory to fix broken link
if [ ! -f /home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language/guidelines.md ]; then
  cat > /home/chris/domain-model/DDD_Artefacts/docs/v2/ubiquitous-language/guidelines.md << EOF
---
title: "Ubiquitous Language Guidelines Index"
version: "1.0"
last_updated: "2025-06-06"
status: "Draft"
---

# Ubiquitous Language Guidelines Index

## Overview

This document serves as an index to the various guidelines documents for using ubiquitous language consistently
throughout the Elias Food Imports system.

## Guidelines Documents

- [Ubiquitous Language Guidelines](guidelines/ubiquitous_language_guidelines.md)
- [Ubiquitous Language Evolution Process](guidelines/ubiquitous_language_evolution.md)
- [Ubiquitous Language Review Checklist](guidelines/ubiquitous_language_review_checklist.md)
EOF
  echo "Created ubiquitous language guidelines index"
fi

echo "Link fixing complete."
