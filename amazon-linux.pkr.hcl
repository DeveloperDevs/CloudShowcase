packer {
  required_plugins {
    amazon = {
      source  = "github.com/hashicorp/amazon"
      version = ">= 1.0.0"
    }
  }
}

variable "region" {
  type    = string
  default = "us-east-1"
}

source "amazon-ebs" "amazon_linux" {

  region        = var.region
  instance_type = "t2.micro"
  ssh_username  = "ec2-user"
  ami_name = "custom-base-ami-{{timestamp}}"

  associate_public_ip_address = true

  # Pull latest Amazon Linux
  source_ami_filter {
    filters = {
      name                = "al2023-ami-*-x86_64"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    owners      = ["amazon"]
    most_recent = true
  }

  # Root volume
  launch_block_device_mappings {
    device_name           = "/dev/xvda"
    volume_size           = 8
    volume_type           = "gp3"
    delete_on_termination = true
  }

  # Additional volume
  launch_block_device_mappings {
    device_name           = "/dev/xvdb"
    volume_size           = 10
    volume_type           = "gp3"
    delete_on_termination = true
  }
}

build {
  name    = "amazon-linux-free-tier-build"
  sources = ["source.amazon-ebs.amazon_linux"]

  provisioner "shell" {
    inline = [

      # Update system
      "sudo yum update -y",

      # Install AWS CLI + Ruby
      "sudo yum install -y awscli ruby",

      # Install CodeDeploy Agent
      "sudo yum install -y wget",
      "cd /home/ec2-user",
      "wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install",
      "chmod +x ./install",
      "sudo ./install auto",
      "sudo systemctl enable codedeploy-agent",

      # Format + mount secondary volume
      "sudo mkfs -t xfs /dev/xvdb",
      "sudo mkdir -p /opt/data",
      "sudo mount /dev/xvdb /opt/data",
      "echo '/dev/xvdb /opt/data xfs defaults,nofail 0 2' | sudo tee -a /etc/fstab",

      # CodeDeploy scripts
      "sudo mkdir -p /opt/codedeploy-scripts",
      "echo 'echo Hello from CodeDeploy script' | sudo tee /opt/codedeploy-scripts/install.sh",
      "sudo chmod +x /opt/codedeploy-scripts/install.sh",

      "echo 'AMI Provisioning Complete'"
    ]
  }
}