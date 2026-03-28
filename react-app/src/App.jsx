import { useState } from "react";
import Builds from "./pages/Builds";
import Deploy from "./pages/Deploy";
import Stacks from "./pages/Stacks";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("stacks");
  const [selectedBuild, setSelectedBuild] = useState(null);
  const [recentStack, setRecentStack] = useState(null);

  function handleDeploy(build) {
    setSelectedBuild(build);
    setPage("deploy");
  }

  function handleDeployed(stackName) {
    setRecentStack(stackName);
    setPage("stacks");
  }

  function handleCancel() {
    setSelectedBuild(null);
    setPage("builds");
  }

  function navigate(p) {
    setPage(p);
    if (p !== "stacks") setRecentStack(null);
  }

  return (
    <div className="app">
      <nav className="nav">
        <div className="nav-brand">CloudShowcase</div>
        <div className="nav-links">
          <button
            className={`nav-link ${page === "stacks" ? "active" : ""}`}
            onClick={() => navigate("stacks")}
          >
            Environments
          </button>
          <button
            className={`nav-link ${page === "builds" || page === "deploy" ? "active" : ""}`}
            onClick={() => navigate("builds")}
          >
            Create New Environment
          </button>
        </div>
      </nav>

      <main className="main">
        {page === "builds" && <Builds onDeploy={handleDeploy} />}
        {page === "deploy" && selectedBuild && (
          <Deploy
            build={selectedBuild}
            onCancel={handleCancel}
            onDeployed={handleDeployed}
          />
        )}
        {page === "stacks" && <Stacks highlightStack={recentStack} />}
      </main>
    </div>
  );
}
