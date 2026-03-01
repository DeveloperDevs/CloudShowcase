import boto3
import time
import botocore

ssm = boto3.client("ssm")

def lambda_handler(event, context):

    instance_id = event.get("InstanceId")
    base_ami_id = event.get("BaseAmiId")
    paid = event.get("Paid", False)

    bucket = "build-devin"
    key = "patch1.zip"

    print(f"InstanceId: {instance_id}")
    print(f"BaseAmiId: {base_ami_id}")
    print(f"Paid: {paid}")

    commands = [
        "sudo mkdir -p /opt/patch1",
        f"sudo aws s3 cp s3://{bucket}/{key} /opt/patch1.zip",
    ]

    # Send command
    response = ssm.send_command(
        InstanceIds=[instance_id],
        DocumentName="AWS-RunShellScript",
        Parameters={"commands": commands},
    )

    command_id = response["Command"]["CommandId"]
    print(f"CommandId: {command_id}")

    # Poll for completion
    max_attempts = 40
    attempt = 0

    while attempt < max_attempts:
        try:
            result = ssm.get_command_invocation(
                CommandId=command_id,
                InstanceId=instance_id
            )

            status = result["Status"]
            print(f"Current status: {status}")

            if status in ["Success", "Failed", "Cancelled", "TimedOut"]:
                break

        except botocore.exceptions.ClientError as e:
            error_code = e.response["Error"]["Code"]

            if error_code == "InvocationDoesNotExist":
                print("Invocation not ready yet, retrying...")
            else:
                raise

        time.sleep(5)
        attempt += 1

    if attempt == max_attempts:
        raise Exception("SSM command timed out waiting for completion")

    if status != "Success":
        raise Exception(f"SSM command failed: {result}")

    return {
        "Status": "Download complete",
        "CommandId": command_id,
        "InstanceId": instance_id,
        "BaseAmiId": base_ami_id,
        "Paid": paid
    }