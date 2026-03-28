import { useEffect, useState } from "react";
import {
  DescribeStacksCommand,
  DeleteStackCommand,
} from "@aws-sdk/client-cloudformation";
import { cfnClient } from "../aws";

const POLL_INTERVAL = 10000;

const IN_PROGRESS_STATUSES = [
  "CREATE_IN_PROGRESS",
  "UPDATE_IN_PROGRESS",
  "DELETE_IN_PROGRESS",
  "ROLLBACK_IN_PROGRESS",
];

export default function Stacks({ highlightStack }) {
  const [stacks, setStacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchStacks();
  }, []);

  useEffect(() => {
    const hasInProgress = stacks.some((s) =>
      IN_PROGRESS_STATUSES.includes(s.StackStatus)
    );
    if (!hasInProgress) return;
    const id = setInterval(fetchStacks, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [stacks]);

  async function fetchStacks() {
    setError(null);
    try {
      const result = await cfnClient.send(new DescribeStacksCommand({}));
      setStacks(result.Stacks || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(stackName) {
    if (!confirm(`Delete stack "${stackName}"? This cannot be undone.`)) return;
    setDeleting(stackName);
    try {
      await cfnClient.send(new DeleteStackCommand({ StackName: stackName }));
      await fetchStacks();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(null);
    }
  }

  function statusClass(status) {
    if (status.includes("COMPLETE") && !status.includes("DELETE")) return "badge badge-active";
    if (status.includes("IN_PROGRESS")) return "badge badge-pending";
    if (status.includes("FAILED") || status.includes("ROLLBACK")) return "badge badge-failed";
    if (status === "DELETE_COMPLETE") return "badge";
    return "badge";
  }

  function getOutput(stack, key) {
    const out = (stack.Outputs || []).find((o) => o.OutputKey === key);
    return out ? out.OutputValue : "—";
  }

  return (
    <div>
      <div className="page-header">
        <h2>Stacks</h2>
        <button className="btn" onClick={fetchStacks} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && <div className="error-banner">Error: {error}</div>}

      {!loading && stacks.length === 0 && !error && (
        <p className="empty-state">No CloudFormation stacks found.</p>
      )}

      {stacks.length > 0 && (
        <table className="builds-table">
          <thead>
            <tr>
              <th>Stack Name</th>
              <th>Status</th>
              <th>Created</th>
              <th>Load Balancer DNS</th>
              <th>RDS Endpoint</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {stacks.map((stack) => (
              <tr
                key={stack.StackId}
                className={
                  highlightStack === stack.StackName ? "row-highlight" : ""
                }
              >
                <td>{stack.StackName}</td>
                <td>
                  <span className={statusClass(stack.StackStatus)}>
                    {stack.StackStatus}
                  </span>
                </td>
                <td>{new Date(stack.CreationTime).toLocaleString()}</td>
                <td className="mono small">{getOutput(stack, "LoadBalancerDNS")}</td>
                <td className="mono small">{getOutput(stack, "RdsEndpoint")}</td>
                <td>
                  {stack.StackStatus !== "DELETE_COMPLETE" && (
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDelete(stack.StackName)}
                      disabled={
                        deleting === stack.StackName ||
                        IN_PROGRESS_STATUSES.includes(stack.StackStatus)
                      }
                    >
                      {deleting === stack.StackName ? "Deleting..." : "Delete"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
