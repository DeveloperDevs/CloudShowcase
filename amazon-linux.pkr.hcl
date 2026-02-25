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
  instance_type = "t3.micro"
  ssh_username  = "ec2-user"
  ami_name = "base-template-{{timestamp}}"

  associate_public_ip_address = true

  # Pull test Amazon Linux 2
  source_ami_filter {
    filters = {
      name                = "amzn2-ami-hvm-*-x86_64-gp2"
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
    inline = [
      "sudo yum install -y python3 python3-pip",
      "sudo pip3 install 'ansible<12'"
    ]
  }

  provisioner "ansible" {
    playbook_file     = "ansible/playbook.yml"
    extra_arguments   = ["-e", "ansible_python_interpreter=/usr/bin/python3"]
    user              = "ec2-user"
  }
}