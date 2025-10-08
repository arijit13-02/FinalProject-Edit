import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function DataPage() {
  const navigate = useNavigate();

  const defaultLabels = ["April","May","June","July","Aug","Sep","Oct","Nov","Dec","Jan","Feb","March"];
  const defaultDatasets = [
    { label: "FY 22-23", data: Array(12).fill(0) },
    { label: "FY 23-24", data: Array(12).fill(0) },
    { label: "FY 24-25", data: Array(12).fill(0) },
    { label: "FY 25-26", data: Array(12).fill(0) },
  ];

  const savedData = JSON.parse(localStorage.getItem("revenueData")) || {};

  const [labels, setLabels] = useState(savedData.labels || defaultLabels);
  const [datasets, setDatasets] = useState(savedData.datasets || defaultDatasets);

  const handleChange = (datasetIndex, monthIndex, value) => {
    const newDatasets = [...datasets];
    newDatasets[datasetIndex].data[monthIndex] = Number(value);
    setDatasets(newDatasets);
  };

  const handleSave = () => {
    localStorage.setItem("revenueData", JSON.stringify({ labels, datasets }));
    alert("Data saved successfully!");
    navigate("/"); // optional: go back to dashboard
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold">Edit Revenue Data</h2>
      {datasets.map((dataset, i) => (
        <div key={i}>
          <h3 className="font-semibold">{dataset.label}</h3>
          <div className="grid grid-cols-13 gap-2 mt-2">
            <div className="font-semibold">Month</div>
            {labels.map((label, j) => (
              <div key={j} className="font-semibold">{label}</div>
            ))}

            <div className="font-semibold">Value</div>
            {dataset.data.map((value, j) => (
              <input
                key={j}
                type="number"
                className="border rounded p-1 w-full"
                value={value}
                onChange={(e) => handleChange(i, j, e.target.value)}
              />
            ))}
          </div>
        </div>
      ))}
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
        onClick={handleSave}
      >
        Save Changes
      </button>
    </div>
  );
}
