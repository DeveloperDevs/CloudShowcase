#!/bin/bash
set -e

echo "Creating CodeDeploy scripts directory..."
sudo mkdir -p /opt/codedeploy-scripts

echo "Downloading product1.zip from S3 bucket base-template-devin..."

# Download from S3
sudo aws s3 cp s3://base-template-devin/product1.zip /opt/codedeploy-scripts/product1.zip

echo "Setting execute permissions..."
sudo chmod +x /opt/codedeploy-scripts/product1.zip

echo "Artifacts downloaded and prepared."
echo "AMI Provisioning Complete"