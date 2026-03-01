import boto3
import time

ssm = boto3.client("ssm")

def lambda_handler(event, context):

    # Extract values from Step Function payload
    instance_id = event["Instance"]["Instances"][0]["InstanceId"]
    base_ami_id = event.get("BaseAmiId")
    paid = event.get("Paid", False)

    # Hardcode S3 location (or make configurable)
    bucket = "build-devin"
    key = "patch1.zip"

    print(f"InstanceId: {instance_id}")
    print(f"BaseAmiId: {base_ami_id}")
    print(f"Paid: {paid}")

    commands = [
        "sudo mkdir -p /opt/patch1",
        f"sudo aws s3 cp s3://{bucket}/{key} /opt/patch.zip",
    ]

    response = ssm.send_command(
        InstanceIds=[instance_id],
        DocumentName="AWS-RunShellScript",
        Parameters={"commands": commands},
    )

    command_id = response["Command"]["CommandId"]

    # Wait for SSM command completion
    while True:
        result = ssm.get_command_invocation(
            CommandId=command_id,
            InstanceId=instance_id
        )

        status = result["Status"]

        if status in ["Success", "Failed", "Cancelled", "TimedOut"]:
            break

        time.sleep(5)

    if status != "Success":
        raise Exception(f"SSM command failed: {result}")

    return {
        "Status": "Download and unzip complete",
        "CommandId": command_id,
        "InstanceId": instance_id,
        "BaseAmiId": base_ami_id,
        "Paid": paid
    }