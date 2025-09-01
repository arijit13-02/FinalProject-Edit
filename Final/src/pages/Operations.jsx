// src/pages/Operations.jsx

import React, { useState, useEffect } from "react";
// import axios from "axios";

const Operations = () => {
  const [activeTab, setActiveTab] = useState("jobs");
  const [jobs, setJobs] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [billing, setBilling] = useState([]);

  useEffect(() => {
    // Example API calls (commented out)
    /*
    axios.get("http://localhost:5050/api/jobs").then((res) => {
      setJobs(res.data);
    });

    axios.get("http://localhost:5050/api/vendors").then((res) => {
      setVendors(res.data);
    });

    axios.get("http://localhost:5050/api/billing").then((res) => {
      setBilling(res.data);
    });
    */

    // ✅ Sample data instead of API calls
    setJobs([
      { id: 1, name: "Job A", status: "Completed" },
      { id: 2, name: "Job B", status: "Pending" },
    ]);

    setVendors([
      { id: 1, name: "Vendor X", location: "New York" },
      { id: 2, name: "Vendor Y", location: "Delhi" },
    ]);

    setBilling([
      { id: 1, invoice: "INV001", amount: 2000 },
      { id: 2, invoice: "INV002", amount: 3500 },
    ]);
  }, []);

  const renderTable = (data, columns) => (
    <table className="w-full border border-gray-300 rounded mt-4">
      <thead>
        <tr className="bg-gray-200">
          {columns.map((col) => (
            <th key={col} className="p-2 border">
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-100">
              {columns.map((col) => (
                <td key={col} className="p-2 border">
                  {item[col.toLowerCase()]}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length} className="p-2 text-center">
              No records found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Operations</h1>

      {/* Tabs */}
      <div className="flex space-x-4 border-b pb-2">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "jobs" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("jobs")}
        >
          Jobs
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "vendors" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("vendors")}
        >
          Vendors
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "billing" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("billing")}
        >
          Billing
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "jobs" &&
          renderTable(jobs, ["ID", "Name", "Status"])}

        {activeTab === "vendors" &&
          renderTable(vendors, ["ID", "Name", "Location"])}

        {activeTab === "billing" &&
          renderTable(billing, ["ID", "Invoice", "Amount"])}
      </div>
    </div>
  );
};

export default Operations;
