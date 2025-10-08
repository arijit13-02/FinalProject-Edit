import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Plus,
  Save,
  Edit3,
  Trash2,
  Search,
  ChevronUp,
  ChevronDown,
  Building2,
  Eye,
  X,
  Hourglass,
  Download,
  Upload,
  Menu,
  User,
  Settings,
  CalendarClock,
  Users,
  Boxes,
  FileText,
  BarChart3,
  BadgeCheck,
  PieChart,
  Activity
} from "lucide-react";
import logo from "../assets/logo.png";
import axios from "axios";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
function RealTimeJobs() {
  //checks authentication
  const [role, setRole] = useState(() => {
    return localStorage.getItem("userRole") || "staff";
  });
  localStorage.setItem("userRole", role);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  //Ribbon at top
  const navigate = useNavigate();
  const handleProtectedNav = (path) => {
    const role = localStorage.getItem("userRole");
    if (role === "admin") {
      navigate(path);
    } else {
      alert("Admin Privileges Required!\nLogin to proceed");
      navigate("/login");
    }
  };
  const navigationItems = [
    { name: "Dashboard", icon: BarChart3, onClick: () => navigate("/") },
    {
      name: "RealTime Jobs",
      icon: Activity,
      onClick: () => navigate("/realtimejobs")
    },
    {
      name: "Operations",
      icon: Settings,
      onClick: () => handleProtectedNav("/operations")
    },
    {
      name: "Upcoming Jobs",
      icon: CalendarClock,
      onClick: () => handleProtectedNav("/upcoming-jobs")
    },
    {
      name: "Vendors",
      icon: Building2,
      onClick: () => handleProtectedNav("/vendors")
    },
    { name: "Staff", icon: Users, onClick: () => handleProtectedNav("/staff") },
    { name: "Inventory", icon: Boxes, onClick: () => navigate("/inventory") },
    {
      name: "Billing",
      icon: FileText,
      onClick: () => handleProtectedNav("/billing")
    },
    {
      name: "Certifications",
      icon: BadgeCheck,
      onClick: () => handleProtectedNav("/certifications")
    }
  ];
  const [records, setRecords] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [formData, setFormData] = useState({
    location: "",
    category: "",
    orderNo: "",
    date: "",
    type: "",
    // In House specific fields
    dismental: "",
    Winding: "",
    Assembley: "",
    testing: "",
    // Site specific fields
    siteLocation: "",
    typeOfJob: "",
    otherJobType: "",
    fieldJobDetails: [{ kva: "", srNo: "", rating: "", note: "" }],
    execution: "",
    // Common field
    delivery: false
  });
  // Load records from localStorage (simulating JSON file)

  useEffect(() => {
    loadRecords();
    const interval = setInterval(loadRecords, 2000);
    return () => clearInterval(interval); // cleanup
  }, []); // empty dependency array

  useEffect(() => {
    if (role === "admin") {
      fetchPendingChanges();
      const interval = setInterval(fetchPendingChanges, 2000);
      return () => clearInterval(interval); // cleanup
    }
  }, [role]);

  const fetchPendingChanges = async () => {
    try {
      const res = await axios.get(
        "http://192.168.0.106:5050/api/realtimejobs/pending"
      );
      setHasPendingChanges(res.data.length > 0);
    } catch (err) {
      console.error("Failed to load pending changes:", err);
    }
  };

  const loadRecords = async () => {
    try {
      const res = await axios.get("http://192.168.0.106:5050/api/realtimejobs", {
        params: { role }
      });
      setRecords(res.data);
    } catch (error) {
      console.error("Failed to fetch records:", error);
    }
  };

const importFromXls = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = async (e) => {
    const dataArray = new Uint8Array(e.target.result);
    const workbook = XLSX.read(dataArray, { type: "array" });

    const firstSheet = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheet];

    // Convert sheet to JSON
    const importedData = XLSX.utils.sheet_to_json(worksheet);

    // Process and send each record
    for (const row of importedData) {
      // Rebuild fieldJobDetails
      const newRec = { ...row, fieldJobDetails: [] };

      let index = 1;
      while (
        row.hasOwnProperty(`kva_${index}`) ||
        row.hasOwnProperty(`srNo_${index}`) ||
        row.hasOwnProperty(`rating_${index}`) ||
        row.hasOwnProperty(`note_${index}`)
      ) {
        const kva = row[`kva_${index}`] || "";
        const srNo = row[`srNo_${index}`] || "";
        const rating = row[`rating_${index}`] || "";
        const note = row[`note_${index}`] || "";

        if (kva || srNo || rating || note) {
          newRec.fieldJobDetails.push({ kva, srNo, rating, note });
        }

        // Clean up flat keys
        delete newRec[`kva_${index}`];
        delete newRec[`srNo_${index}`];
        delete newRec[`rating_${index}`];
        delete newRec[`note_${index}`];

        index++;
      }

      try {
        const response = await axios.post(
          `http://192.168.0.106:5050/api/realtimejobs?role=${role}`, // role: 'admin' or 'staff'
          newRec,
          {
            headers: { "x-user-role": localStorage.getItem("userRole") },
          }
        );

        if (response.data.success) {
          setRecords((prevData) => [
            ...prevData,
            response.data.item || newRec,
          ]);
        } else {
          console.error("Failed to insert record:", response.data.message, newRec);
        }
      } catch (err) {
        console.error("Error inserting record:", err, newRec);
      }
    }
  };

  reader.readAsArrayBuffer(file);
};


  const exportToXls = () => {
  // 1. Process records to flatten fieldJobDetails
  
  const processedRecords = records.map((rec) => {
  // Destructure to remove unwanted keys (id, updatedAt, fieldJobDetails)
  const { id, ID, updatedAt, fieldJobDetails, ...newRec } = rec;

  if (Array.isArray(fieldJobDetails)) {
    fieldJobDetails.forEach((fj, index) => {
      const idx = index + 1;
      newRec[`kva_${idx}`] = fj.kva || "";
      newRec[`srNo_${idx}`] = fj.srNo || "";
      newRec[`rating_${idx}`] = fj.rating || "";
      newRec[`note_${idx}`] = fj.note || "";
    });
  }

  return newRec;
});


  // 2. Convert processed records JSON to a worksheet
  const ws = XLSX.utils.json_to_sheet(processedRecords);

  // 3. Create a new workbook and append the worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "JobTrackingRecords");

  // 4. Generate Excel file buffer
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

  // 5. Save as .xlsx file
  const exportFileName = "job_tracking_records.xlsx";
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  saveAs(blob, exportFileName);
};




  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const newData = { ...prev };

      if (type === "checkbox") {
        newData[name] = checked;
      } else {
        newData[name] = value;
      }

      // Reset dependent fields when location changes
      if (name === "location") {
        if (value === "In House") {
          // Clear Site specific fields
          newData.siteLocation = "";
          newData.typeOfJob = "";
          newData.otherJobType = "";
          newData.fieldJobDetails = [
            { kva: "", srNo: "", rating: "", note: "" }
          ];
          newData.execution = "";
        } else if (value === "Site") {
          // Clear In House specific fields
          newData.dismental = "";
          newData.Winding = "";
          newData.Assembley = "";
          newData.testing = "";
        }
      }

      return newData;
    });
  };

  const handleFieldJobDetailChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.fieldJobDetails];
      updated[index][field] = value;
      return { ...prev, fieldJobDetails: updated };
    });
  };
  const addFieldJobDetail = () => {
    setFormData((prev) => ({
      ...prev,
      fieldJobDetails: [
        ...prev.fieldJobDetails,
        { kva: "", srNo: "", rating: "", note: "" }
      ]
    }));
  };
  const removeFieldJobDetail = (index) => {
    setFormData((prev) => {
      if (prev.fieldJobDetails.length === 1) return prev; // Don't remove if only one left
      const updated = prev.fieldJobDetails.filter((_, i) => i !== index);
      return { ...prev, fieldJobDetails: updated };
    });
  };

  /*//pdf and to check
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setFormData((prev) => ({
        ...prev,
        jobCompletionCertificate: file.name, // In real app, you'd upload the file
      }));
    } else {
      alert("Please select a PDF file");
    }
  };*/

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingRecord) {
      /*
    // Editing existing record locally
    const newRecords = records.map((record) =>
      record.id === editingRecord.id
        ? {
            ...formData,
            id: editingRecord.id,
            createdAt: editingRecord.createdAt,
            updatedAt: new Date().toISOString(),
          }
        : record
    );
    setRecords(newRecords);
    resetForm();*/
      try {
        const response = await axios.put(
          `http://192.168.0.106:5050/api/realtimejobs/${editingRecord.id}?role=${role}`, // update by ID
          {
            ...formData,
            id: editingRecord.id,
            createdAt: editingRecord.createdAt,
            updatedAt: new Date().toISOString()
          }
        );

        if (response.data.success) {
          // Update UI with the edited record
          const updatedRecords = records.map((record) =>
            record.id === editingRecord.id ? response.data.item : record
          );
          setRecords(updatedRecords);
          resetForm();
        } else {
          console.error("Failed to update:", response.data.message);
        }
      } catch (error) {
        console.error("API error:", error);
      }
    } else {
      // Adding new record
      try {
        const response = await axios.post(
          `http://192.168.0.106:5050/api/realtimejobs?role=${role}`, // role: 'admin' or 'staff'
          formData
        );

        if (response.data.success) {
          setRecords([...records, response.data.item]); // update UI with the added record
          resetForm();
        } else {
          console.error("Failed to add:", response.data.message);
        }
      } catch (error) {
        console.error("API error:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      location: "",
      category: "",
      orderNo: "",
      date: "",
      type: "",
      dismental: "",
      Winding: "",
      Assembley: "",
      testing: "",
      siteLocation: "",
      typeOfJob: "",
      otherJobType: "",
      fieldJobDetails: [{ kva: "", srNo: "", rating: "", note: "" }],
      execution: "",
      delivery: false
    });
    setIsFormOpen(false);
    setEditingRecord(null);
  };

  const handleEdit = (record) => {
    setFormData({
      location: record.location,
      category: record.category,
      orderNo: record.orderNo,
      date: record.date,
      type: record.type,
      dismental: record.dismental || "",
      Winding: record.Winding || "",
      Assembley: record.Assembley || "",
      testing: record.testing || "",
      siteLocation: record.siteLocation || "",
      typeOfJob: record.typeOfJob || "",
      otherJobType: record.otherJobType || "",
      fieldJobDetails:
        record.fieldJobDetails && record.fieldJobDetails.length > 0
          ? record.fieldJobDetails
          : [{ kva: "", srNo: "", rating: "", note: "" }],

      execution: record.execution || "",
      delivery: record.delivery || false
    });
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleView = (record) => {
    setViewingRecord(record);
    setIsDetailOpen(true);
  };
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://192.168.0.106:5050/api/realtimejobs/${id}?role=${role}`
      );
      loadRecords();
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-600" />
    );
  };
  // Filter and sort records

  const filteredAndSortedRecords = React.useMemo(() => {
    let filtered = records.filter(
      (record) =>
        record.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.typeOfJob &&
          record.typeOfJob.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (record.execution &&
          record.execution.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (record.siteLocation &&
          record.siteLocation.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        if (sortConfig.key === "date" || sortConfig.key === "createdAt") {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }
        if (sortConfig.key === "delivery") {
          aValue = aValue ? "Delivered" : "Pending";
          bValue = bValue ? "Delivered" : "Pending";
        }
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return filtered;
  }, [records, searchTerm, sortConfig]);

  const getCategoryColor = (category) => {
    const colors = {
      WBSEDCL: "bg-blue-100 text-blue-800",
      Private: "bg-green-100 text-green-800",
      Public: "bg-purple-100 text-purple-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };
  const getExecutionColor = (execution) => {
    const colors = {
      Started: "bg-yellow-100 text-yellow-800",
      Completed: "bg-green-100 text-green-800"
    };
    return colors[execution] || "bg-gray-100 text-gray-800";
  };
  const getLocationColor = (location) => {
    const colors = {
      "In House": "bg-indigo-100 text-indigo-800",
      Site: "bg-orange-100 text-orange-800"
    };
    return colors[location] || "bg-gray-100 text-gray-800";
  };
  const getDeliveryColor = (delivery) => {
    return delivery ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-3">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={item.onClick}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition px-3 py-2 rounded-lg hover:bg-blue-50"
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium">{item.name}</span>
                </button>
              ))}
            </nav>

            {/* Login Button */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/login")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={item.onClick}
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50"
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium">{item.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header with Logo */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Company Logo */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 text-center">
                <div className="w-16 h-12 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                  <img
                    className="w-full h-full object-contain"
                    src={logo}
                    alt="company logo"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Real Time Jobs
                </h1>
                <p className="text-blue-100">
                  Manage and track your job records
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              {role === "admin" && (
                <button
                  onClick={() =>
                    (window.location.href = "/pendingchangesrealtimejobs")
                  }
                  className={`${hasPendingChanges
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                    } text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 shadow-lg`}
                >
                  <Hourglass className="w-4 h-4" />
                  <span>
                    {hasPendingChanges
                      ? "Pending Changes"
                      : "No Pending Changes"}
                  </span>
                </button>
              )}
              
              {role === "admin" && (
  <div className="flex items-center space-x-3">
    <button
      onClick={() => document.getElementById("importFileInput").click()}
      className="bg-white/90 hover:bg-white text-blue-600 px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center space-x-1"
    >
      <Upload className="w-4 h-4" />
      <span>Import</span>
    </button>

    <input
      type="file"
      id="importFileInput"
      accept=".xlsx,.xls"
      onChange={importFromXls}
      style={{ display: "none" }}
    />

    <button
      onClick={exportToXls}
      className="bg-white/90 hover:bg-white text-blue-600 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 shadow-lg"
    >
      <Download className="w-4 h-4" />
      <span>Export</span>
    </button>
  </div>
)}


              <button
                onClick={() => setIsFormOpen(true)}
                className="bg-white/90 hover:bg-white text-blue-600 px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Add Job Record</span>
              </button>
            </div>
          </div>
        </div>
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/90 backdrop-blur-sm border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
            />
          </div>
        </div>
        {/* Job Records Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
          <div className="bg-blue-600 text-white p-4 font-semibold text-lg">
            Job Records ({records.length})
          </div>

          {filteredAndSortedRecords.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm
                  ? "No records match your search."
                  : "No records found. Add your first job record!"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("orderNo")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Order No</span>
                        {getSortIcon("orderNo")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("location")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Location</span>
                        {getSortIcon("location")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("category")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Sector</span>
                        {getSortIcon("category")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("typeOfJob")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Job Type</span>
                        {getSortIcon("typeOfJob")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("execution")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Execution</span>
                        {getSortIcon("execution")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("delivery")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Delivery</span>
                        {getSortIcon("delivery")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("date")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Date</span>
                        {getSortIcon("date")}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAndSortedRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">
                          {record.orderNo}
                        </div>
                        <div className="text-xs text-gray-500">
                          {record.type}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getLocationColor(
                            record.location
                          )}`}
                        >
                          {record.location}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                            record.category
                          )}`}
                        >
                          {record.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-800">
                          {record.typeOfJob || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {record.execution ? (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getExecutionColor(
                              record.execution
                            )}`}
                          >
                            {record.execution}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getDeliveryColor(
                            record.delivery
                          )}`}
                        >
                          {record.delivery ? "Delivered" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {new Date(record.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleView(record)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(record)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="Edit record"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Delete record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Form Modal */}{" "}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-blue-600 text-white p-4 rounded-t-xl flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {editingRecord ? "Edit Job Record" : "Add New Job Record"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-white hover:bg-blue-700 p-1 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Common Fields */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <select
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Location</option>
                        <option value="In House">In House</option>
                        <option value="Site">Site</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sector
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Sector</option>
                        <option value="WBSEDCL">WBSEDCL</option>
                        <option value="Private">Private</option>
                        <option value="Public">Public</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order No / LOI No
                      </label>
                      <input
                        type="text"
                        name="orderNo"
                        value={formData.orderNo}
                        onChange={handleInputChange}
                        required
                        placeholder="Order No/ LOI No"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client/Division
                      </label>
                      <input
                        type="text"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                        placeholder="Client/Division"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                {/* Location Specific Fields */}{" "}
                {formData.location === "In House" && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">
                      In House Operations
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dismental
                        </label>
                        <select
                          name="dismental"
                          value={formData.dismental}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Status</option>
                          <option value="Started">Started</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Winding
                        </label>
                        <select
                          name="Winding"
                          value={formData.Winding}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Status</option>
                          <option value="Started">Started</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Assembley
                        </label>
                        <select
                          name="Assembley"
                          value={formData.Assembley}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Status</option>
                          <option value="Started">Started</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Testing
                        </label>
                        <select
                          name="testing"
                          value={formData.testing}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Status</option>
                          <option value="Started">Started</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}{" "}
                {formData.location === "Site" && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">
                      Site Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Site Location
                        </label>
                        <input
                          type="text"
                          name="siteLocation"
                          value={formData.siteLocation}
                          onChange={handleInputChange}
                          placeholder="Enter site location"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type of Job
                        </label>
                        <select
                          name="typeOfJob"
                          value={formData.typeOfJob}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Job Type</option>
                          <option value="Testing">Testing</option>
                          <option value="Maintain">Maintain</option>
                          <option value="Filter">Filter</option>
                          <option value="Others">Others</option>
                        </select>
                      </div>
                      {formData.typeOfJob === "Others" && (
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Specify Job Type
                          </label>
                          <input
                            type="text"
                            name="otherJobType"
                            value={formData.otherJobType || ""}
                            onChange={handleInputChange}
                            placeholder="Enter job type"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Execution
                        </label>
                        <select
                          name="execution"
                          value={formData.execution}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Execution Status</option>
                          <option value="Started">Started</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>

                    {/* Field Job Details */}
                    <div>
                      <h4 className="text-md font-medium text-gray-800 mb-3">
                        Field Job Details
                      </h4>

                      {formData.fieldJobDetails.map((detail, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 items-center"
                        >
                          {/* KVA */}
                          <div className="flex flex-col">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              KVA
                            </label>
                            <input
                              type="text"
                              value={detail.kva}
                              onChange={(e) =>
                                handleFieldJobDetailChange(
                                  index,
                                  "kva",
                                  e.target.value
                                )
                              }
                              placeholder="Enter KVA"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          {/* Sr No */}
                          <div className="flex flex-col">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Sr No
                            </label>
                            <input
                              type="text"
                              value={detail.srNo}
                              onChange={(e) =>
                                handleFieldJobDetailChange(
                                  index,
                                  "srNo",
                                  e.target.value
                                )
                              }
                              placeholder="Enter Serial Number"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          {/* Rating */}
                          <div className="flex flex-col">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Rating
                            </label>
                            <input
                              type="text"
                              value={detail.rating}
                              onChange={(e) =>
                                handleFieldJobDetailChange(
                                  index,
                                  "rating",
                                  e.target.value
                                )
                              }
                              placeholder="Enter Rating"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          {/* Note */}
                          <div className="flex flex-col">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Note
                            </label>
                            <input
                              type="text"
                              value={detail.note}
                              onChange={(e) =>
                                handleFieldJobDetailChange(
                                  index,
                                  "note",
                                  e.target.value
                                )
                              }
                              placeholder="Enter Note"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          {/* Remove Button */}
                          {/* Remove Button */}
                          <div className="flex items-center justify-center mt-5 -ml-20">
                            <button
                              type="button"
                              onClick={() => removeFieldJobDetail(index)}
                              className="bg-red-500 hover:bg-red-300 text-white px-3 py-3 rounded-lg text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addFieldJobDetail}
                        className="mt-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        + Add Another Row
                      </button>
                    </div>

                    <div className="mt-4 mb-4"></div>
                  </div>
                )}{" "}
                {/* Common Delivery Checkbox */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="delivery"
                      checked={formData.delivery}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Delivery
                    </span>
                  </label>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingRecord ? "Update" : "Save"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Detail View Modal */}{" "}
        {isDetailOpen && viewingRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-blue-600 text-white p-4 rounded-t-xl flex items-center justify-between">
                <h2 className="text-xl font-semibold">Job Record Details</h2>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="text-white hover:bg-blue-700 p-1 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {viewingRecord.orderNo}
                  </h3>
                  <p className="text-gray-600">{viewingRecord.type}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Location
                    </label>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getLocationColor(
                        viewingRecord.location
                      )}`}
                    >
                      {viewingRecord.location}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Sector
                    </label>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(
                        viewingRecord.category
                      )}`}
                    >
                      {viewingRecord.category}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Date
                    </label>
                    <p className="text-lg font-semibold text-gray-800">
                      {new Date(viewingRecord.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {/* Location Specific Details */}{" "}
                {viewingRecord.location === "In House" && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">
                      In House Operations
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {viewingRecord.dismental && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500">
                            Dismental
                          </label>
                          <p className="text-lg font-semibold text-gray-800">
                            {viewingRecord.dismental}
                          </p>
                        </div>
                      )}{" "}
                      {viewingRecord.Winding && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500">
                            Winding
                          </label>
                          <p className="text-lg font-semibold text-gray-800">
                            {viewingRecord.Winding}
                          </p>
                        </div>
                      )}{" "}
                      {viewingRecord.Assembley && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500">
                            Assembley
                          </label>
                          <p className="text-lg font-semibold text-gray-800">
                            {viewingRecord.Assembley}
                          </p>
                        </div>
                      )}{" "}
                      {viewingRecord.testing && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500">
                            Testing
                          </label>
                          <p className="text-lg font-semibold text-gray-800">
                            {viewingRecord.testing}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}{" "}
                {viewingRecord.location === "Site" && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">
                      Site Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {viewingRecord.siteLocation && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500">
                            Site Location
                          </label>
                          <p className="text-lg font-semibold text-gray-800">
                            {viewingRecord.siteLocation}
                          </p>
                        </div>
                      )}{" "}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {viewingRecord.typeOfJob && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500">
                            Type of Job
                          </label>
                          <p className="text-lg font-semibold text-gray-800">
                            {viewingRecord.typeOfJob}
                          </p>
                        </div>
                      )}{" "}
                      {viewingRecord.execution && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500">
                            Execution
                          </label>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getExecutionColor(
                              viewingRecord.execution
                            )}`}
                          >
                            {viewingRecord.execution}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Field Job Details */}{" "}
                    {viewingRecord.fieldJobDetails &&
                      viewingRecord.fieldJobDetails.length > 0 && (
                        <div>
                          <h5 className="text-md font-semibold text-gray-800 mb-3">
                            Field Job Details
                          </h5>
                          {viewingRecord.fieldJobDetails.map(
                            (detail, index) => (
                              <div
                                key={index}
                                className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-3 border border-gray-200 rounded-lg"
                              >
                                {detail.kva && (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-500">
                                      KVA
                                    </label>
                                    <p className="text-lg font-semibold text-gray-800">
                                      {detail.kva}
                                    </p>
                                  </div>
                                )}
                                {detail.srNo && (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-500">
                                      Sr No
                                    </label>
                                    <p className="text-lg font-semibold text-gray-800">
                                      {detail.srNo}
                                    </p>
                                  </div>
                                )}
                                {detail.rating && (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-500">
                                      Rating
                                    </label>
                                    <p className="text-lg font-semibold text-gray-800">
                                      {detail.rating}
                                    </p>
                                  </div>
                                )}
                                {detail.note && (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-500">
                                      Note
                                    </label>
                                    <p className="text-lg font-semibold text-gray-800">
                                      {detail.note}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      )}{" "}
                  </div>
                )}{" "}
                {/* Delivery Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Delivery Status
                  </label>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getDeliveryColor(
                      viewingRecord.delivery
                    )}`}
                  >
                    {viewingRecord.delivery ? "Delivered" : "Pending"}
                  </span>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setIsDetailOpen(false);
                      handleEdit(viewingRecord);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Record</span>
                  </button>
                  <button
                    onClick={() => setIsDetailOpen(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    {" "}
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default RealTimeJobs;
