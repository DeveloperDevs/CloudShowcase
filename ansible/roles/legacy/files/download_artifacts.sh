#!/bin/bash
set -e

echo "Creating CodeDeploy scripts directory..."

sudo mkdir -p /opt/codedeploy-scripts

echo "Creating mock install script..."
echo 'echo Hello from CodeDeploy script' | sudo tee /opt/codedeploy-scripts/install.sh

sudo chmod +x /opt/codedeploy-scripts/install.sh

echo "Artifacts prepared."
echo "AMI Provisioning Complete"