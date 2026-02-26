**Note:** This is supposed to be a simple showcase of some of the things I worked on in Cloud. This is not supposed to be a faithful recreation of the production ready Cloud infrastructure from my job, just a very watered down showcase with similar concepts.

Let's break down a few of the processes that are in this repository, and the items that contribute to each process

**Base Template:**
Used CloudFormation, CodeBuild, Packer & Ansible to generate base AMIs with essential libraries and core dependencies.

**Internal Build:**
Used Step Functions / Logic Apps & Ansible to generate additional AMIs from the base template, with MicroStrategy product-related libraries/configurations. Used for internal builds

