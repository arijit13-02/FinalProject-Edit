// src/pages/PendingChangesRealTimeJobs.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";

const PendingChanges = () => {
  const [pendingChanges, setPendingChanges] = useState([]);
  const [selected, setSelected] = useState({}); // {id: 'approve' | 'reject'}
  const [summary, setSummary] = useState({ total: 0, approved: 0, rejected: 0 });

  // Fetch pending changes from backend
  const fetchPendingChanges = async () => {
    try {
      const res = await axios.get("http://localhost:5050/api/realtimejobs/pending");
      setPendingChanges(res.data);
      setSummary({ total: res.data.length, approved: 0, rejected: 0 });
    } catch (err) {
      console.error("Failed to load pending changes:", err);
    }
  };

  useEffect(() => {
    fetchPendingChanges();
  }, []);

  const handleDecision = (id, decision) => {
    setSelected(prev => ({ ...prev, [id]: decision }));
    const approvedCount = Object.values({ ...selected, [id]: decision }).filter(v => v === "approve").length;
    const rejectedCount = Object.values({ ...selected, [id]: decision }).filter(v => v === "reject").length;
    setSummary(prev => ({ ...prev, approved: approvedCount, rejected: rejectedCount }));
  };

  const handleSelectAll = (decision) => {
    const newSelected = {};
    pendingChanges.forEach(item => {
      newSelected[item.item.id] = decision;
    });
    setSelected(newSelected);
    setSummary({
      total: pendingChanges.length,
      approved: decision === "approve" ? pendingChanges.length : 0,
      rejected: decision === "reject" ? pendingChanges.length : 0,
    });
  };

  const applyChanges = async () => {
  const actions = Object.keys(selected).map(id => ({
    id,
    approved: selected[id] === "approve",
  }));

  if (actions.length === 0) {
    alert("No decisions selected.");
    return;
  }

  try {
    await axios.post("http://localhost:5050/api/realtimejobs/pending/apply", { actions });
    alert("Decisions applied successfully!");
    fetchPendingChanges();
    setSelected({});
  } catch (err) {
    console.error("Failed to apply changes:", err);
    alert("Failed to apply changes.");
  }
};

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pending Changes</h1>

      <div className="mb-4 flex space-x-2">
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          onClick={() => handleSelectAll("approve")}
        >
          Approve All
        </button>
        <button
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          onClick={() => handleSelectAll("reject")}
        >
          Reject All
        </button>
      </div>

      <div className="mb-4">
        <strong>Total:</strong> {summary.total} | <strong>Approved:</strong> {summary.approved} |{" "}
        <strong>Rejected:</strong> {summary.rejected}
      </div>

      <div className="space-y-4">
        {pendingChanges.map((change) => (
          <div
            key={change.item.id}
            className="border p-4 rounded-lg shadow-sm flex justify-between items-start"
          >
            <div>
              <div>
                <strong>Type:</strong> {change.type}
              </div>

              {Array.isArray(change.item.fieldJobDetails) && change.item.fieldJobDetails.length > 0 ? (
                change.item.fieldJobDetails.map((field, idx) => (
                  <div key={idx} className="ml-2">
                    KVA: {field.kva}, SR No: {field.srNo}, Rating: {field.rating}, Note: {field.note}
                  </div>
                ))
              ) : (
                <div>Unnamed Item</div>
              )}
            </div>

            <div className="space-x-2">
              <button
                className={`px-3 py-1 rounded ${selected[change.item.id] === "approve" ? "bg-green-600 text-white" : "bg-gray-200"}`}
                onClick={() => handleDecision(change.item.id, "approve")}
              >
                Approve
              </button>
              <button
                className={`px-3 py-1 rounded ${selected[change.item.id] === "reject" ? "bg-red-600 text-white" : "bg-gray-200"}`}
                onClick={() => handleDecision(change.item.id, "reject")}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {pendingChanges.length > 0 && (
        <button
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          onClick={applyChanges}
        >
          Apply Decisions
        </button>
      )}
    </div>
  );
};

export default PendingChanges;