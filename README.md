**Note:** This is supposed to be a simple showcase of some of the things I worked on in Cloud. This is not supposed to be a very faithful recreation of the actual Cloud infrastructure from my job, just a watered down showcase with similar concepts. I will also be a lot looser with security best practices for this showcase as well.

Let's break down a few of the processes that are in this repository, and the items that contribute to each process
</br>
</br>

**Base Template:**

It starts with the CloudFormation template, **cloudformation/basetemplate.yml**, which we will use to deploy the Infrastructure needed for the Base Template process. This contains:
- A CodeBuild Project
- The CodeBuild Project's Service Role + Policy
- An S3 Bucket (Will be used by the Base Template later)

Once the CloudFormation stack is created, we can trigger a CodeBuild job to create a new Base AMI. When the job is triggered, it will follow the **buildspec.yml**, which will do the following:
- Install Packer, Ansible, Python, etc.
- Initialize Packer, validate the Packer template (**amazon-linux.pkr.hcl**) and run Packer Build from the Template
- Packer will launch a temporary VM
- On the VM, Packer will run Ansible, which will run its playbook (located at **/ansible/playbook.yml**)
- After the playbook is run, Packer will stop the VM, take a snapshot and then create an AMI with the snapshot.
- The AMI will be the output that would be passed to the next process
</br>
</br>

**Internal Build:**

Every release (monthly or quarterly), an internal build will be promoted to a release build and be made visible to everyone through the Cloud Console. The primary differences between internal and release builds is the visibility and the region presence (internal builds are only in us-east-1, release builds are in all supported regions)

For the purposes of this showcase, I will not be adding the Azure equivalent

Here is the step function for the build process. 
**Note:** It is a lot more simplified compared to the ones at work because the production process consists of multiple AMIs that can be bundled together (so multiple step functions would run and then converge to create the build, which would consist of multiple AMIs)
<img width="252" height="562" alt="Screenshot 2026-03-02 at 11 18 51 AM" src="https://github.com/user-attachments/assets/3cb52821-1f19-48a6-b35d-4598e3063ca4" />

Let's go through some of the steps
1. We will launch an instance from the base-template AMI
2. Once the instance is running, we will invoke a Download Lambda, which will download additional patches to the base-template
3. [Skipped due CodeDeploy being unavailable on Free Tier on AWS] This is where bulk of the "work for the build process actually goes on. We will create deployment groups to execute the CodeDeploy scripts for each company product. Some of the files will already be on the instance (baked in from the BaseTemplate process) and some are patches from step 2
4. We will create a new AMI for the build
5. After the AMI is ready, we will write the details to DynamoDB
6. Last, we will invoke the QA Step Function, which will perform some QA checks on the instance before cleaning up


