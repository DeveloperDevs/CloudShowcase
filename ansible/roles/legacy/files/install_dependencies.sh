#!/bin/bash
set -e

echo "Updating yum"
sudo yum update -y

echo "Installing AWS CLI and SSM Agent..."
sudo yum install -y awscli amazon-ssm-agent

echo "Enabling and starting SSM Agent..."
sudo systemctl enable amazon-ssm-agent
sudo systemctl start amazon-ssm-agent

echo "Dependencies installed."