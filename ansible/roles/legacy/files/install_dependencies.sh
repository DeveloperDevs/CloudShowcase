#!/bin/bash
set -e

echo "Updating yum"
sudo yum update -y

echo "Installing AWS CLI and Ruby..."
sudo yum install -y awscli ruby

echo "Dependencies installed."