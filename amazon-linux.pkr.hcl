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
  ami_name = "base-template-{{timestamp}}"

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
  name    = "amazon-linux-build"
  sources = ["source.amazon-ebs.amazon_linux"]

  provisioner "shell" {
    scripts = [
      "scripts/install_dependencies.sh",
      "scripts/install_codedeploy.sh",
      "scripts/partition_disks.sh",
      "scripts/download_artifacts.sh"
    ]
  }
}