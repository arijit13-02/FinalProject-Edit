// src/pages/PendingChangesRealTimeJobs.jsx



import React, { useEffect, useState } from "react";
import axios from "axios";

const PendingChangesRealTimeJobs = () => {
  const [pendingChanges, setPendingChanges] = useState([]);
  const [decisions, setDecisions] = useState({});
  const role = localStorage.getItem("userRole");

  useEffect(() => {
    if (role === "admin") {
      fetchPendingChanges();
    }
  }, []);

  const fetchPendingChanges = async () => {
    try {
      const res = await axios.get("http://localhost:5050/api/realtimejobs/pending");
      setPendingChanges(res.data);
    } catch (err) {
      console.error("Failed to load pending changes:", err);
    }
  };

  const handleDecision = (id, approved) => {
    setDecisions((prev) => ({
      ...prev,
      [id]: approved,
    }));
  };

  const selectAll = (approved) => {
    const all = {};
    pendingChanges.forEach((change) => {
      all[change.item.id] = approved;
    });
    setDecisions(all);
  };

 const applyChanges = async () => {
  const actions = Object.keys(decisions).map((id) => ({
    id,
    approved: decisions[id],
  }));

  if (actions.length === 0) {
    alert("Please approve or reject at least one item.");
    return;
  }

  const confirmed = window.confirm("Are you sure you want to apply all selected decisions? This action cannot be undone.");
  if (!confirmed) return;

  try {
    await axios.post("http://localhost:5050/api/realtimejobs/pending/apply", { actions });
    alert("Changes applied successfully.");
    fetchPendingChanges();
    setDecisions({});
  } catch (err) {
    console.error("Failed to apply changes:", err);
    alert("Failed to apply changes.");
  }
};

  const renderDifferences = (item, original) => {
    if (!original) return null;

    const changedFields = Object.keys(item).filter(
      (key) => item[key] !== original[key] && key !== "id"
    );

    return (
      <div className="mt-2 text-sm text-gray-700">
        <p className="font-semibold">Changed Fields:</p>
        <ul className="list-disc list-inside">
          {changedFields.map((field) => (
            <li key={field}>
              <span className="text-gray-500">{field}:</span>{" "}
              <span className="line-through text-red-600">{original[field] || "N/A"}</span>{" "}
              ➡ <span className="text-green-700 font-medium">{item[field]}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const countSummary = () => {
    let approved = 0,
      rejected = 0;

    for (const id in decisions) {
      if (decisions[id] === true) approved++;
      else if (decisions[id] === false) rejected++;
    }

    const total = pendingChanges.length;
    const undecided = total - approved - rejected;

    return { approved, rejected, undecided, total };
  };

  const summary = countSummary();

  if (role !== "admin") {
    return (
      <div className="p-6 text-center text-red-500 font-semibold">
        Access Denied: Only admins can view this page.
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Pending RealTimeJobs Changes</h2>

      {pendingChanges.length === 0 ? (
        <div className="text-gray-500">No pending changes.</div>
      ) : (
        <div className="space-y-4">
          {/* Summary Box */}
          <div className="bg-white p-4 rounded shadow border flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm sm:text-base">
            <div>📝 Total Pending: <strong>{summary.total}</strong></div>
            <div>✅ Approved: <strong>{summary.approved}</strong></div>
            <div>❌ Rejected: <strong>{summary.rejected}</strong></div>
            <div>❓ No Action: <strong>{summary.undecided}</strong></div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => selectAll(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              ✅ Select All Approve
            </button>
            <button
              onClick={() => selectAll(false)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              ❌ Select All Reject
            </button>
          </div>

          {/* Pending Changes List */}
          {pendingChanges.map((change) => (
            <div
              key={change.item.id}
              className="p-4 border rounded bg-gray-50 flex flex-col gap-2"
            >
              <div>
                <strong className="capitalize">{change.type}</strong> –{" "}
                {change.item.itemDetails || "Unnamed Item"}
              </div>

              {change.type === "edit" && change.original && renderDifferences(change.item, change.original)}

              <div className="mt-2 space-x-2">
                <button
                  onClick={() => handleDecision(change.item.id, true)}
                  className={`px-3 py-1 rounded ${
                    decisions[change.item.id] === true
                      ? "bg-green-600 text-white"
                      : "bg-green-100 text-green-800 hover:bg-green-200"
                  }`}
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => handleDecision(change.item.id, false)}
                  className={`px-3 py-1 rounded ${
                    decisions[change.item.id] === false
                      ? "bg-red-600 text-white"
                      : "bg-red-100 text-red-800 hover:bg-red-200"
                  }`}
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ))}

          <div className="mt-4 text-right">
            <button
              onClick={applyChanges}
              className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
            >
              Apply All Decisions
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingChangesRealTimeJobs;