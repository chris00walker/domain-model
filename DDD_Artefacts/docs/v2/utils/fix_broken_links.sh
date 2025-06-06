#!/bin/bash

# Script to fix broken links
echo "Creating glossary files and fixing links..."

# Create glossary directory
GLOSSARY_DIR="/home/chris/domain-model/DDD_Artefacts/docs/v2/glossary"
mkdir -p "$GLOSSARY_DIR"

# Create authentication-types.md
cat > "${GLOSSARY_DIR}/authentication-types.md" << 'EOF'
---
title: "Authentication Types Glossary"
version: "2.0"
last_updated: "2025-06-06"
status: "Final"
---

# Authentication Types Glossary

This document defines the various authentication mechanisms used in the Elias Food Imports system.

## Authentication Methods

- **QR Code Authentication**: Using QR codes on product packaging to verify authenticity
- **NFC Authentication**: Using Near-Field Communication tags for verification
- **Blockchain Authentication**: Using distributed ledger technology to track product provenance
- **Holographic Authentication**: Using special holographic labels that are difficult to counterfeit
- **Chemical Authentication**: Using chemical markers in packaging or products for verification

## Authentication Levels

- **Level 1**: Basic authentication (single factor)
- **Level 2**: Enhanced authentication (two factors)
- **Level 3**: Premium authentication (three or more factors)

## Authentication Statuses

- **Verified**: Product has passed authentication checks
- **Failed**: Product has failed authentication checks
- **Pending**: Authentication is in progress
- **Expired**: Authentication validity period has expired
EOF

# Create README.md
cat > "${GLOSSARY_DIR}/README.md" << 'EOF'
---
title: "Ubiquitous Language Glossary"
version: "2.0"
last_updated: "2025-06-06"
status: "Final"
---

# Ubiquitous Language Glossary

This glossary provides definitions and explanations for all domain terms used in the Elias Food Imports system.

## Core Terms

- **Product**: A food or beverage item imported and sold by Elias Food Imports.
- **Customer**: An individual or organization that purchases products from Elias Food Imports.
- **Order**: A request from a customer to purchase specific products.
- **Subscription**: A recurring arrangement for regular delivery of products.
- **Authentication**: The process of verifying the authenticity of imported products.
- **Pricing**: The process of determining the selling price for products.
- **Inventory**: The quantity of products available for sale.
- **Payment**: The transfer of money from a customer to Elias Food Imports for products.
- **Catalog**: The complete list of products available for purchase.

## Additional Terms

(Additional terms to be added as needed)
EOF

# Create CHANGELOG.md
cat > "${GLOSSARY_DIR}/CHANGELOG.md" << 'EOF'
---
title: "Ubiquitous Language Glossary Change Log"
version: "2.0"
last_updated: "2025-06-06"
status: "Final"
---

# Ubiquitous Language Glossary Change Log

This document tracks changes to the ubiquitous language glossary over time.

## Version 2.0 (2025-06-06)

- Migrated glossary to v2 documentation structure
- Standardized capitalization of core domain terms
- Added domain events glossary section
- Added value objects glossary section

## Version 1.0 (2023-01-15)

- Initial glossary created
- Defined core domain terms
- Established capitalization conventions
EOF

echo "Glossary files created."
