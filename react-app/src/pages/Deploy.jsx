import { useState } from "react";
import { CreateStackCommand } from "@aws-sdk/client-cloudformation";
import { cfnClient } from "../aws";
import templateBody from "../../../cloudformation/provision.yml?raw";

const STORAGE_KEY = "cloudshowcase_network_defaults";

function loadDefaults() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveNetworkDefaults(params) {
  const { vpcId, publicSubnet1, publicSubnet2, privateSubnet1, privateSubnet2 } = params;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ vpcId, publicSubnet1, publicSubnet2, privateSubnet1, privateSubnet2 }));
}

export default function Deploy({ build, onCancel, onDeployed }) {
  const [params, setParams] = useState(() => ({ stackName: "", ...loadDefaults() }));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function set(field) {
    return (e) => setParams((p) => ({ ...p, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await cfnClient.send(
        new CreateStackCommand({
          StackName: params.stackName,
          TemplateBody: templateBody,
          Parameters: [
            { ParameterKey: "AmiId", ParameterValue: build.ID },
            { ParameterKey: "VpcId", ParameterValue: params.vpcId },
            { ParameterKey: "PublicSubnet1", ParameterValue: params.publicSubnet1 },
            { ParameterKey: "PublicSubnet2", ParameterValue: params.publicSubnet2 },
            { ParameterKey: "PrivateSubnet1", ParameterValue: params.privateSubnet1 },
            { ParameterKey: "PrivateSubnet2", ParameterValue: params.privateSubnet2 },
          ],
          Capabilities: ["CAPABILITY_IAM"],
        })
      );
      onDeployed(params.stackName);
    } catch (e) {
      setError(e.message);
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Deploy Environment</h2>
        <button className="btn btn-ghost" onClick={onCancel}>
          ← Back to Builds
        </button>
      </div>

      <div className="deploy-card">
        <div className="deploy-ami-info">
          <span className="label">AMI</span>
          <span className="mono">{build.ID}</span>
          <span className="label">Name</span>
          <span>{build.AmiName}</span>
        </div>

        {error && <div className="error-banner">Error: {error}</div>}

        <form onSubmit={handleSubmit} className="deploy-form">
          <div className="form-group">
            <label>Stack Name</label>
            <input
              type="text"
              value={params.stackName}
              onChange={set("stackName")}
              placeholder="my-qa-env"
              required
              pattern="[a-zA-Z][a-zA-Z0-9\-]*"
              title="Must start with a letter and contain only letters, numbers, and hyphens"
            />
          </div>

          <div className="form-group">
            <label>VPC ID</label>
            <input
              type="text"
              value={params.vpcId}
              onChange={set("vpcId")}
              placeholder="vpc-0abc123"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Public Subnet 1</label>
              <input
                type="text"
                value={params.publicSubnet1}
                onChange={set("publicSubnet1")}
                placeholder="subnet-0abc123"
                required
              />
            </div>
            <div className="form-group">
              <label>Public Subnet 2</label>
              <input
                type="text"
                value={params.publicSubnet2}
                onChange={set("publicSubnet2")}
                placeholder="subnet-0def456"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Private Subnet 1</label>
              <input
                type="text"
                value={params.privateSubnet1}
                onChange={set("privateSubnet1")}
                placeholder="subnet-0ghi789"
                required
              />
            </div>
            <div className="form-group">
              <label>Private Subnet 2</label>
              <input
                type="text"
                value={params.privateSubnet2}
                onChange={set("privateSubnet2")}
                placeholder="subnet-0jkl012"
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Deploying..." : "Deploy Stack"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
