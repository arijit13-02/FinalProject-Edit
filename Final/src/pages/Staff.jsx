import React, { useState, useEffect } from "react";
import axios from "axios";
import { Home, MapPin, Building2 } from "lucide-react";

export default function DataPanel() {
  // State for button selections
  const [location, setLocation] = useState("Inhouse"); // default
  const [category, setCategory] = useState("WB"); // default
  const [data, setData] = useState([]);

  // Function to build API URL depending on selection
  const getApiUrl = () => {
    if (location === "Inhouse" && category === "WB")
      return "/api/inhouse/wb";
    if (location === "Inhouse" && category === "Private")
      return "/api/inhouse/private";
    if (location === "Inhouse" && category === "Public")
      return "/api/inhouse/public";

    if (location === "Site" && category === "WB")
      return "/api/site/wb";
    if (location === "Site" && category === "Private")
      return "/api/site/private";
    if (location === "Site" && category === "Public")
      return "/api/site/public";

    return null;
  };

  // Fetch data function
  const fetchData = async () => {
    try {
      const url = getApiUrl();
      if (!url) return;
      const res = await axios.get(url);
      setData(res.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  // Polling with useEffect
  useEffect(() => {
    fetchData(); // first fetch immediately

    const interval = setInterval(() => {
      fetchData();
    }, 5000); // repeat every 5 seconds

    return () => clearInterval(interval); // cleanup
  }, [location, category]); // re-run when selection changes

  return (
    <div className="p-6 space-y-6">
      {/* Location buttons */}
      <div className="flex space-x-4">
        <button
          className={`px-5 py-2 rounded-lg font-medium flex items-center space-x-2 shadow-lg transition-all ${
            location === "Inhouse"
              ? "bg-blue-600 text-white"
              : "bg-white/90 text-blue-600 hover:bg-white"
          }`}
          onClick={() => setLocation("Inhouse")}
        >
          <Home className="w-5 h-5" />
          <span>In house</span>
        </button>

        <button
          className={`px-5 py-2 rounded-lg font-medium flex items-center space-x-2 shadow-lg transition-all ${
            location === "Site"
              ? "bg-blue-600 text-white"
              : "bg-white/90 text-blue-600 hover:bg-white"
          }`}
          onClick={() => setLocation("Site")}
        >
          <MapPin className="w-5 h-5" />
          <span>Site</span>
        </button>
      </div>

      {/* Category buttons */}
      <div className="flex space-x-4">
        {[
          { key: "WB", label: "WB", icon: <Building2 className="w-5 h-5" /> },
          { key: "Private", label: "Private", icon: <Home className="w-5 h-5" /> },
          { key: "Public", label: "Public", icon: <MapPin className="w-5 h-5" /> },
        ].map((cat) => (
          <button
            key={cat.key}
            className={`px-5 py-2 rounded-lg font-medium flex items-center space-x-2 shadow-lg transition-all ${
              category === cat.key
                ? "bg-green-600 text-white"
                : "bg-white/90 text-green-600 hover:bg-white"
            }`}
            onClick={() => setCategory(cat.key)}
          >
            {cat.icon}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Data panel */}
      <div className="border p-4 rounded-xl bg-white shadow-lg">
        <h2 className="font-bold mb-2 text-lg">
          Showing Data for: {location} - {category}
        </h2>
        <pre className="text-sm overflow-x-auto bg-gray-50 p-3 rounded">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
