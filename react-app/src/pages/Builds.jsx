import { useEffect, useState } from "react";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoClient } from "../aws";

export default function Builds({ onDeploy }) {
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBuilds();
  }, []);

  async function fetchBuilds() {
    setLoading(true);
    setError(null);
    try {
      const result = await dynamoClient.send(
        new ScanCommand({ TableName: "AmiRegistry" })
      );
      const sorted = (result.Items || []).sort(
        (a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt)
      );
      setBuilds(sorted);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function statusClass(status) {
    if (status === "ACTIVE") return "badge badge-active";
    if (status === "QA_PASSED") return "badge badge-passed";
    if (status === "QA_FAILED") return "badge badge-failed";
    return "badge";
  }

  return (
    <div>
      <div className="page-header">
        <h2>Builds</h2>
        <button className="btn" onClick={fetchBuilds} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && <div className="error-banner">Error: {error}</div>}

      {!loading && builds.length === 0 && !error && (
        <p className="empty-state">No builds found in AmiRegistry.</p>
      )}

      {builds.length > 0 && (
        <table className="builds-table">
          <thead>
            <tr>
              <th>AMI ID</th>
              <th>Name</th>
              <th>Base AMI</th>
              <th>Created At</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {builds.map((build) => (
              <tr key={build.ID}>
                <td className="mono">{build.ID}</td>
                <td>{build.AmiName}</td>
                <td className="mono">{build.BaseAmi}</td>
                <td>{new Date(build.CreatedAt).toLocaleString()}</td>
                <td>
                  <span className={statusClass(build.Status)}>{build.Status}</span>
                </td>
                <td>
                  <button className="btn btn-small" onClick={() => onDeploy(build)}>
                    Deploy
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
