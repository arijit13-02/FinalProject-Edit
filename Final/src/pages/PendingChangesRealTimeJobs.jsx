import React, { useEffect, useState } from "react";
import axios from "axios";

const PendingJobs = () => {
  const [pendingJobs, setPendingJobs] = useState([]);
  const [decisions, setDecisions] = useState({});
  const role = localStorage.getItem("userRole");

  useEffect(() => {
    if (role === "admin") fetchPendingJobs();
  }, []);

  const fetchPendingJobs = async () => {
    try {
      const res = await axios.get("http://localhost:5050/api/realtimejobs/pending");
      setPendingJobs(res.data);
    } catch (err) {
      console.error("Failed to load pending jobs:", err);
    }
  };

  const handleDecision = (id, approved) => {
    setDecisions((prev) => ({ ...prev, [id]: approved }));
  };

  const selectAll = (approved) => {
    const all = {};
    pendingJobs.forEach((change) => { all[change.item.id] = approved; });
    setDecisions(all);
  };

  const applyChanges = async () => {
    const actions = Object.keys(decisions).map((id) => ({ id, approved: decisions[id] }));
    if (actions.length === 0) return alert("Please approve/reject at least one job.");

    if (!window.confirm("Apply all selected decisions?")) return;

    try {
      await axios.post("http://localhost:5050/api/realtimejobs/pending/apply", { actions });
      alert("Changes applied successfully.");
      fetchPendingJobs();
      setDecisions({});
    } catch (err) {
      console.error(err);
      alert("Failed to apply changes.");
    }
  };

  const renderDifferences = (item, original) => {
  if (!original) return null;

  const changedFields = Object.keys(item).filter(
    (key) => key !== "id" && JSON.stringify(item[key]) !== JSON.stringify(original[key])
  );

  if (!changedFields.length) return null;

  return (
    <div className="mt-2 text-sm text-gray-700">
      <p className="font-semibold">Changed Fields:</p>
      <ul className="list-disc list-inside space-y-1">
        {changedFields.map((field) => {
          // Handle nested array (like fieldJobDetails)
          if (Array.isArray(item[field]) || Array.isArray(original[field])) {
  const newArray = item[field] || [];
  const origArray = original[field] || [];

  // Build a lookup by a unique key (e.g., kva)
  const origLookup = Object.fromEntries(origArray.map((obj) => [obj.kva, obj]));

  return (
    <li key={field}>
      <span className="text-gray-500">{field}:</span>
      <ul className="list-decimal list-inside ml-4">
        {newArray.map((obj, idx) => {
          const origObj = origLookup[obj.kva];
          if (!origObj) {
            // New row
            return (
              <li key={idx}>
                <span className="text-green-700 font-medium">Added Row:</span>
                {Object.keys(obj).map((subField) => (
                  <div key={subField}>
                    <span className="text-gray-500">{subField}:</span>{" "}
                    <span className="text-green-700 font-medium">{obj[subField]}</span>
                  </div>
                ))}
              </li>
            );
          }

          // Existing row, check differences
          const subFields = Object.keys(obj).filter(
            (k) => JSON.stringify(obj[k]) !== JSON.stringify(origObj[k])
          );
          if (subFields.length === 0) return null;
          return (
            <li key={idx}>
              {subFields.map((subField) => (
                <div key={subField}>
                  <span className="text-gray-500">{subField}:</span>{" "}
                  <span className="line-through text-red-600">{origObj[subField]}</span>{" "}
                  ➡{" "}
                  <span className="text-green-700 font-medium">{obj[subField]}</span>
                </div>
              ))}
            </li>
          );
        })}

        {/* Removed rows */}
        {origArray
          .filter((obj) => !newArray.find((n) => n.kva === obj.kva))
          .map((removedObj, idx) => (
            <li key={`removed-${idx}`}>
              <span className="text-red-600 font-medium">Removed Row:</span>
              {Object.keys(removedObj).map((subField) => (
                <div key={subField}>
                  <span className="text-gray-500">{subField}:</span>{" "}
                  <span className="text-red-600 font-medium">{removedObj[subField]}</span>
                </div>
              ))}
            </li>
          ))}
      </ul>
    </li>
  );
}
 else {
            // Top-level simple fields
            return (
              <li key={field}>
                <span className="text-gray-500">{field}:</span>{" "}
                <span className="line-through text-red-600">{original[field]}</span>{" "}
                ➡{" "}
                <span className="text-green-700 font-medium">{item[field]}</span>
              </li>
            );
          }
        })}
      </ul>
    </div>
  );
};



  const summary = (() => {
    let approved = 0, rejected = 0;
    Object.values(decisions).forEach(v => v === true ? approved++ : v === false ? rejected++ : null);
    const total = pendingJobs.length;
    return { approved, rejected, undecided: total - approved - rejected, total };
  })();

  if (role !== "admin") return (
    <div className="p-6 text-center text-red-500 font-semibold">Access Denied: Only admins can view this page.</div>
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Pending Real-Time Jobs</h2>

      {pendingJobs.length === 0 ? (
        <div className="text-gray-500">No pending jobs.</div>
      ) : (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-white p-4 rounded shadow border flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm sm:text-base">
            <div>📝 Total Pending: <strong>{summary.total}</strong></div>
            <div>✅ Approved: <strong>{summary.approved}</strong></div>
            <div>❌ Rejected: <strong>{summary.rejected}</strong></div>
            <div>❓ No Action: <strong>{summary.undecided}</strong></div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button onClick={() => selectAll(true)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">✅ Select All Approve</button>
            <button onClick={() => selectAll(false)} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">❌ Select All Reject</button>
          </div>

          {/* Job List */}
          {pendingJobs.map((change) => (
            <div key={change.item.id} className="p-4 border rounded bg-gray-50 flex flex-col gap-2">
              <div>
                <strong className="capitalize">{change.type}</strong> – {change.item.orderNo || "Unnamed Job"}
              </div>
              {change.type === "edit" && renderDifferences(change.item, change.original)}
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => handleDecision(change.item.id, true)}
                  className={`px-3 py-1 rounded ${decisions[change.item.id] === true ? "bg-green-600 text-white" : "bg-green-100 text-green-800 hover:bg-green-200"}`}
                >✅ Approve</button>
                <button
                  onClick={() => handleDecision(change.item.id, false)}
                  className={`px-3 py-1 rounded ${decisions[change.item.id] === false ? "bg-red-600 text-white" : "bg-red-100 text-red-800 hover:bg-red-200"}`}
                >❌ Reject</button>
              </div>
            </div>
          ))}

          <div className="mt-4 text-right">
            <button onClick={applyChanges} className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700">Apply All Decisions</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingJobs;
