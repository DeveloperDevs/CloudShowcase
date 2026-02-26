#!/bin/bash
set -e

echo "Creating CodeDeploy scripts directory..."
sudo mkdir -p /opt/codedeploy-scripts

echo "Downloading install.sh from S3 bucket base-template-devin..."

# Download from S3
sudo aws s3 cp s3://base-template-devin/install.sh /opt/codedeploy-scripts/install.sh

echo "Setting execute permissions..."
sudo chmod +x /opt/codedeploy-scripts/install.sh

echo "Artifacts downloaded and prepared."
echo "AMI Provisioning Complete"