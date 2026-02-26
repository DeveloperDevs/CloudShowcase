**Note:** This is supposed to be a simple showcase of some of the things I worked on in Cloud. This is not supposed to be a faithful recreation of the production ready Cloud infrastructure from my job, just a very watered down showcase with similar concepts.

Let's break down a few of the processes that are in this repository, and the items that contribute to each process

**Base Template:**
Used CloudFormation, CodeBuild, Packer & Ansible to generate base AMIs with essential libraries and core dependencies.

It starts with the CloudFormation template, **basetemplate.yml**, which we will use to deploy the Infrastructure needed for the Base Template process. This contains:
- A CodeBuild Project
- The CodeBuild Project's Service Role + Policy
- An S3 Bucket (Will be used by the Base Template job later)

**Internal Build:**
Used Step Functions / Logic Apps & Ansible to generate additional AMIs from the base template, with MicroStrategy product-related libraries/configurations. Used for internal builds

