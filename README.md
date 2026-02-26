**Note:** This is supposed to be a simple showcase of some of the things I worked on in Cloud. This is not supposed to be a very faithful recreation of the actual Cloud infrastructure from my job, just a watered down showcase with similar concepts. I will also be a lot looser with security best practices for this showcase as well.

Let's break down a few of the processes that are in this repository, and the items that contribute to each process
</br>
</br>

**Base Template:**

Used CloudFormation, CodeBuild, Packer & Ansible to generate base AMIs with essential libraries and core dependencies.

It starts with the CloudFormation template, **basetemplate.yml**, which we will use to deploy the Infrastructure needed for the Base Template process. This contains:
- A CodeBuild Project
- The CodeBuild Project's Service Role + Policy
- An S3 Bucket (Will be used by the Base Template later)

Once the CloudFormation stack is created, we can trigger a CodeBuild job to create a new Base AMI. When the job is triggered, it will follow the **buildspec.yml**, which will do the following:
- Install Packer, Ansible, Python, etc.
- Initialize Packer, validate the Packer template (**amazon-linux.pkr.hcl**) and run Packer Build from the Template
- Packer will launch a temporary VM
- On the VM, Packer will run Ansible, which will run its playbook
- After the playbook is run, Packer will stop the VM, take a snapshot and then create an AMI with the snapshot.
- The AMI will be the output that would be passed to the next process
</br>
</br>

**Internal Build:**

Used Step Functions / Logic Apps & Ansible to generate additional AMIs from the base template, with MicroStrategy product-related libraries/configurations. Used for internal builds

