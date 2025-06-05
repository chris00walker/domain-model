#!/bin/bash

# Script to update relative import paths to use path aliases
# For all domains in the DDD project

DDD_ROOT="/home/chris/domain-model/DDD_Artefacts/src"
DOMAINS=("pricing" "catalog" "customers" "ordering" "subscriptions" "shared")

echo "Updating import paths in all domain files..."

for domain in "${DOMAINS[@]}"; do
  echo "Processing $domain domain..."
  
  # Convert imports from shared module to use path aliases
  find "$DDD_ROOT/$domain" -type f -name "*.ts" -exec sed -i 's|../../../../shared/|@shared/|g' {} \;
  find "$DDD_ROOT/$domain" -type f -name "*.ts" -exec sed -i 's|../../../shared/|@shared/|g' {} \;
  find "$DDD_ROOT/$domain" -type f -name "*.ts" -exec sed -i 's|../../shared/|@shared/|g' {} \;
  find "$DDD_ROOT/$domain" -type f -name "*.ts" -exec sed -i 's|../shared/|@shared/|g' {} \;
  
  # Convert cross-domain imports to use path aliases
  for other_domain in "${DOMAINS[@]}"; do
    if [ "$other_domain" != "$domain" ]; then
      find "$DDD_ROOT/$domain" -type f -name "*.ts" -exec sed -i "s|../../../../$other_domain/|@$other_domain/|g" {} \;
      find "$DDD_ROOT/$domain" -type f -name "*.ts" -exec sed -i "s|../../../$other_domain/|@$other_domain/|g" {} \;
      find "$DDD_ROOT/$domain" -type f -name "*.ts" -exec sed -i "s|../../$other_domain/|@$other_domain/|g" {} \;
      find "$DDD_ROOT/$domain" -type f -name "*.ts" -exec sed -i "s|../$other_domain/|@$other_domain/|g" {} \;
    fi
  done
  
  # Convert internal domain relative paths to use domain path alias
  find "$DDD_ROOT/$domain" -type f -name "*.ts" -exec sed -i "s|../../domain/|../domain/|g" {} \;
  find "$DDD_ROOT/$domain" -type f -name "*.ts" -exec sed -i "s|../../../domain/|../domain/|g" {} \;
done

echo "Import path updates completed!"

echo "Import paths updated successfully."
