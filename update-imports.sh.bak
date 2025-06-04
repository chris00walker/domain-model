#!/bin/bash

# Script to update relative import paths to use path aliases
# For the pricing domain

echo "Updating import paths in pricing domain files..."

# Replace '../../../../shared/' with '@shared/'
find /home/chris/domain-model/DDD_Artefacts/code/pricing -type f -name "*.ts" -exec sed -i 's|../../../../shared/|@shared/|g' {} \;

# Replace '../../../shared/' with '@shared/' (if any)
find /home/chris/domain-model/DDD_Artefacts/code/pricing -type f -name "*.ts" -exec sed -i 's|../../../shared/|@shared/|g' {} \;

# Replace '../../shared/' with '@shared/' (if any)
find /home/chris/domain-model/DDD_Artefacts/code/pricing -type f -name "*.ts" -exec sed -i 's|../../shared/|@shared/|g' {} \;

# Replace '../shared/' with '@shared/' (if any)
find /home/chris/domain-model/DDD_Artefacts/code/pricing -type f -name "*.ts" -exec sed -i 's|../shared/|@shared/|g' {} \;

# Replace relative paths between pricing components with path aliases
find /home/chris/domain-model/DDD_Artefacts/code/pricing -type f -name "*.ts" -exec sed -i 's|../../../../pricing/|@pricing/|g' {} \;
find /home/chris/domain-model/DDD_Artefacts/code/pricing -type f -name "*.ts" -exec sed -i 's|../../../pricing/|@pricing/|g' {} \;
find /home/chris/domain-model/DDD_Artefacts/code/pricing -type f -name "*.ts" -exec sed -i 's|../../pricing/|@pricing/|g' {} \;
find /home/chris/domain-model/DDD_Artefacts/code/pricing -type f -name "*.ts" -exec sed -i 's|../pricing/|@pricing/|g' {} \;

echo "Import paths updated successfully."
