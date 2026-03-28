import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { CloudFormationClient } from "@aws-sdk/client-cloudformation";

const config = {
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
};

export const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient(config));
export const cfnClient = new CloudFormationClient(config);
