import boto3
import time

ssm = boto3.client("ssm")

REQUIRED_FILES = [
    "/opt/codedeploy-scripts/product1.zip",
    "/opt/patches/patch1.zip"
]

def lambda_handler(event, context):
    instance_id = event.get("InstanceId")
    just_cleanup = event.get("justCleanup", False)

    if not instance_id:
        raise ValueError("InstanceId is required")

    print(f"Checking required files on instance: {instance_id}")
    print(f"justCleanup flag: {just_cleanup}")

    # Bash command to check both files
    shell_command = """
    missing=0
    for file in {files}; do
        if [ ! -f "$file" ]; then
            echo "MISSING:$file"
            missing=1
        else
            echo "FOUND:$file"
        fi
    done
    exit $missing
    """.format(files=" ".join(REQUIRED_FILES))

    # Send SSM command
    response = ssm.send_command(
        InstanceIds=[instance_id],
        DocumentName="AWS-RunShellScript",
        Parameters={"commands": [shell_command]},
    )

    command_id = response["Command"]["CommandId"]

    # Wait for command completion
    while True:
        time.sleep(3)
        output = ssm.get_command_invocation(
            CommandId=command_id,
            InstanceId=instance_id
        )

        status = output["Status"]

        if status in ["Success", "Failed", "Cancelled", "TimedOut"]:
            break

    stdout = output.get("StandardOutputContent", "")
    stderr = output.get("StandardErrorContent", "")

    print("STDOUT:", stdout)
    print("STDERR:", stderr)

    if status != "Success":
        raise Exception(f"File check failed:\n{stdout}\n{stderr}")

    return {
        "InstanceId": instance_id,
        "justCleanup": just_cleanup,
        "status": "FILES_VERIFIED",
        "details": stdout
    }