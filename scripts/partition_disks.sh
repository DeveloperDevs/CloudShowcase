#!/bin/bash
set -e

echo "Formatting secondary EBS volume..."

sudo mkfs -t xfs /dev/xvdb

echo "Creating mount directory..."
sudo mkdir -p /opt/data

echo "Mounting volume..."
sudo mount /dev/xvdb /opt/data

echo "Persisting mount in fstab..."
echo '/dev/xvdb /opt/data xfs defaults,nofail 0 2' | sudo tee -a /etc/fstab

echo "Disk partitioning complete."