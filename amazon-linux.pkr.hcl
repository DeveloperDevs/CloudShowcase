packer {
  required_plugins {
    amazon = {
      source  = "github.com/hashicorp/amazon"
      version = ">= 1.8.0"
    }
    ansible = {
      source  = "github.com/hashicorp/ansible"
      version = ">= 1.1.0"
    }
  }
}

variable "region" {
  type    = string
  default = "us-east-1"
}

source "amazon-ebs" "al2023" {
  region        = var.region
  instance_type = "t3.micro"
  ssh_username  = "ec2-user"
  ami_name      = "base-template-al2023-{{timestamp}}"
  iam_instance_profile = "PackerS3AccessProfile"

  associate_public_ip_address = true

  source_ami_filter {
    filters = {
      name                = "al2023-ami-2023.*-x86_64"
      architecture        = "x86_64"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    owners      = ["amazon"]
    most_recent = true
  }

  launch_block_device_mappings {
    device_name           = "/dev/xvda"
    volume_size           = 8
    volume_type           = "gp3"
    delete_on_termination = true
  }

  launch_block_device_mappings {
    device_name           = "/dev/xvdb"
    volume_size           = 10
    volume_type           = "gp3"
    delete_on_termination = true
  }
}

build {
  name    = "amazon-linux-build"
  sources = ["source.amazon-ebs.al2023"]

  # Install Python + Ansible cleanly
  provisioner "shell" {
    inline = [
      "sudo dnf clean all",
      "sudo dnf update -y",
      "sudo dnf install -y python3 python3-pip",
      "sudo pip3 install ansible"
    ]
  }

  provisioner "ansible" {
    playbook_file   = "ansible/playbook.yml"
    user            = "ec2-user"
    extra_arguments = ["-e", "ansible_python_interpreter=/usr/bin/python3"]
  }
}