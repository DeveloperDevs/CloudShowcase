**Note:** This is supposed to be a simple showcase of some of the things I worked on in Cloud. This is not supposed to be a very faithful recreation of the actual Cloud infrastructure from my job, just a watered down showcase with similar concepts. I will also be a lot looser with security best practices for this showcase as well.

Let's break down a few of the processes that are in this repository, and the items that contribute to each process
</br>
</br>

**Base Template:**

It starts with the CloudFormation template (**cloudformation/basetemplate.yml**) which we will use to deploy the Infrastructure needed for the Base Template process. This contains:
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

The step function for the build process is in (**step-functions/internal-build.yml**)

**Note:** 
This step function is a lot more simplified compared to the ones at my previous job, which would bundle multiple AMIs together to form a build

<img width="252" height="562" alt="Screenshot 2026-03-02 at 11 18 51 AM" src="https://github.com/user-attachments/assets/3cb52821-1f19-48a6-b35d-4598e3063ca4" />

Let's go through the steps:
1. We will launch an instance from the base-template AMI
2. Once the instance is running, we will invoke a Download Lambda (**lambda/DownloadScriptsFromS3.py**), which will download additional patches to the base-template
3. **[Skipped due CodeDeploy being unavailable on Free Tier on AWS]** This the bulk of the "work for the build process: We will create deployment groups to execute the CodeDeploy scripts for each company product. Some of the files will already be on the instance (baked in from the BaseTemplate process) and some are patches downloaded during step 2
4. After CodeDeploy finishes, we will create a new AMI for the build
5. Once the AMI is ready, we will write the details to DynamoDB
6. Last, we will invoke the QA Step Function, which will perform some QA checks on the instance before cleaning up
</br>
</br>

**Build QA:**

QA processes at my company operated at many levels. One was a step function (**step-functions/build-qa.yml**) that operated at the build level, which was called by the build step function.

<img width="484" height="454" alt="Screenshot 2026-03-04 at 10 38 46 AM" src="https://github.com/user-attachments/assets/daf333be-9086-4e3f-9553-c4e46ff1633d" />


Let's go through the steps:
1. There is a flag that we pass in to the step function that will skip all the QA validation and proceed straight to cleanup
2. If the flag is false, we will trigger a lambda that will check the outcome of the CodeDeploy scripts. (Right now I just have it check the directory structure but for the real company QA process, this "step" was actually a series of many different lambdas that would validate various product-related things)
4. Next, we will validate the DynamoDB entry for the build number
5. After the validation is complete, we will perform cleanup
6. Finally, we will add the validation results to DynamoDB (and, while not included in this diagram, this is where we would publish a message to Slack/Teams about the build validation results, for stakeholders to monitor)
</br>
</br>

**Provisioning:**

Now that we have a build. We can provision an "Environment" of this build for internal/customer usage. We will use CloudFormation (**cloudformation/provision.yml**) for this provisioning process.

<img width="1215" height="684" alt="Screenshot 2026-03-04 at 5 32 10 PM" src="https://github.com/user-attachments/assets/2fd5524e-9c78-4a8e-b488-95a54d2ede15" />


Here is what is provisioned:
1. An EC2 Instance (w/ the build AMI)
2. An RDS Instance
3. A Load Balancer
4. Security Groups for each
5. Target, Parameter & Subnet Groups

