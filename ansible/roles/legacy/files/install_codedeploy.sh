#!/bin/bash
set -e

echo "Installing CodeDeploy Agent..."

sudo yum install -y wget

cd /home/ec2-user

wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install
chmod +x ./install
sudo ./install auto

sudo systemctl enable codedeploy-agent

echo "CodeDeploy Agent installed."