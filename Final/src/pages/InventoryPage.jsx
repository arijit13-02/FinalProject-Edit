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

function Inventory() {
  //checks authentication
  const [role, setRole] = useState(() => {
    return localStorage.getItem("userRole") || "staff";
  });
  localStorage.setItem("userRole", role);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
const [lowStockItems, setLowStockItems] = useState([]);

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
    ItemDetails: "",
    StockInDate: "",
    StockOutDate: "",
    StockAvailable: "",
    HSNCode: "",
    Limit: ""
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
        "http://192.168.0.104:5050/api/inventory/pending"
      );
      setHasPendingChanges(res.data.length > 0);
    } catch (err) {
      console.error("Failed to load pending changes:", err);
    }
  };

  const loadRecords = async () => {
    try {
      const res = await axios.get("http://192.168.0.104:5050/api/inventory", {
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

    // Read workbook with preserved formatting
    const workbook = XLSX.read(dataArray, { type: "array" });

    const firstSheet = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheet];

    // Convert sheet → JSON (raw: false keeps decimals as text first)
    const importedData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

    // Clean floating-point issues
    const cleanedData = importedData.map((row) => {
      const newRow = {};
      for (let key in row) {
        let value = row[key];

        // If numeric, round to 2 decimals
        if (!isNaN(value) && value !== null && value !== "") {
          value = parseFloat(Number(value).toFixed(2));
        }

        newRow[key] = value;
      }
      return newRow;
    });

    // Insert each record
    for (const record of cleanedData) {
      const newRec = {
        ItemDetails: record.ItemDetails || "",
        StockInDate: record.StockInDate || "",
        StockOutDate: record.StockOutDate || "",
        StockAvailable: record.StockAvailable || "",
        HSNCode: record.HSNCode || "",
        Limit: record.Limit || "",
      };

      try {
        const response = await axios.post(
          `http://192.168.0.104:5050/api/inventory?role=${role}`,
          newRec,
          {
            headers: { "x-user-role": localStorage.getItem("userRole") },
          }
        );

        if (response.data.success) {
          setRecords((prevData) => [...prevData, response.data.item || newRec]);
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
    if (!records || records.length === 0) return;

    // 1. Prepare data: only pick relevant stock fields
    const processedData = records.map((record) => ({
      ItemDetails: record.ItemDetails || "",
      StockInDate: record.StockInDate || "",
      StockOutDate: record.StockOutDate || "",
      StockAvailable: record.StockAvailable || "",
      HSNCode: record.HSNCode || "",
      Limit: record.Limit || "",
    }));

    // 2. Convert processed data to worksheet
    const ws = XLSX.utils.json_to_sheet(processedData);

    // 3. Create workbook and append worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "InventoryData");

    // 4. Generate Excel file buffer
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    // 5. Save as file
    const exportFileName = "Inventory.xlsx";
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

      // Example: if you want to reset dependent fields in future,
      // you can add conditions here based on `name`

      return newData;
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingRecord) {
      try {
        const response = await axios.put(
          `http://192.168.0.104:5050/api/inventory/${editingRecord.id}?role=${role}`, // update by ID
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
          `http://192.168.0.104:5050/api/inventory?role=${role}`, // role: 'admin' or 'staff'
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
      ItemDetails: "",
      StockInDate: "",
      StockOutDate: "",
      StockAvailable: "",
      HSNCode: "",
      Limit: ""
    });
    setIsFormOpen(false);
    setEditingRecord(null);
  };

  const handleEdit = (record) => {
    setFormData({
      ItemDetails: record.ItemDetails,
      StockInDate: record.StockInDate,
      StockOutDate: record.StockOutDate,
      StockAvailable: record.StockAvailable,
      HSNCode: record.HSNCode,
      Limit: record.Limit,
    });
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleView = (record) => {
    setViewingRecord(record);
    setIsDetailOpen(true);
  };

  
  const [isAlertOpen, setisAlertOpen] = useState(true);
  const closeAlert = () => {
    setisAlertOpen(false);
  };
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://192.168.0.104:5050/api/inventory/${id}?role=${role}`
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
    let filtered = records.filter((record) =>
      (record.ItemDetails || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.StockInDate || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.StockOutDate || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.StockAvailable || "").toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.HSNCode || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.Limit || "").toString().toLowerCase().includes(searchTerm.toLowerCase())
    );


    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === "StockInDate" || sortConfig.key === "StockOutDate") {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [records, searchTerm, sortConfig]);

  useEffect(() => {
  const belowLimit = records.filter((record) => {
    const stock = parseInt(record.StockAvailable);
    const limit = parseInt(record.Limit);
    return !isNaN(stock) && !isNaN(limit) && stock < limit;
  });
  setLowStockItems(belowLimit);
}, [records]);

const getLimitColor = (a,b) => {
  var aa= parseInt(a);
  var bb= parseInt(b);
  
    if (aa>bb)
      return "bg-green-100 text-green-800";
    else
    {

      return "bg-red-100 text-red-800";
    }
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
                  Inventory Management
                </h1>
                <p className="text-blue-100">
                  Manage your inventory. Pop Up occurs when quantity is less than the minimum limit.
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              {role === "admin" && (
                <button
                  onClick={() =>
                    (window.location.href = "/pendingchangesinventory ")
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
                <Download className="w-4 h-4" />
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
                <Upload className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                </div>
              )}


              <button
                onClick={() => setIsFormOpen(true)}
                className="bg-white/90 hover:bg-white text-blue-600 px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Add Inventory Record</span>
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
{/* Low Stock Alert */}
{lowStockItems.length > 0 && isAlertOpen && (
  <div
    className={`fixed top-20 right-40 w-96 bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg z-50
      transform transition-all duration-300
      ${isAlertOpen ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"}`}
  >
    {/* Close button */}
    <button
      onClick={() => closeAlert()}
      className="absolute top-2 right-2 text-red-600 hover:text-red-800 hover:bg-red-100 p-1 rounded-full transition-colors duration-200"
      title="Close"
    >
      ✕
    </button>

    {/* Header */}
    <h3 className="text-lg font-bold text-red-700 mb-3 flex items-center space-x-2">
      <span>⚠️</span>
      <span>Items Below Limit</span>
    </h3>

    {/* List of items */}
    <ul className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-red-50">
      {lowStockItems.map((item, index) => (
        <li
          key={index}
          className={`flex justify-between items-center px-3 py-2 rounded-md shadow-sm bg-white hover:bg-red-50 transition-colors duration-200 ${getLimitColor(
            item.StockAvailable,
            item.Limit
          )}`}
        >
          <span className="font-medium">{item.ItemDetails}</span>
          <span className="font-medium">
            Stock: {item.StockAvailable} / Limit: {item.Limit}
          </span>
        </li>
      ))}
    </ul>
  </div>
)}




        {/* Inventory Records Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
          <div className="bg-blue-600 text-white p-4 font-semibold text-lg">
            Inventory ({records.length})
          </div>

          {filteredAndSortedRecords.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm
                  ? "No records match your search."
                  : "No records found. Add your inventory record!"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[90vh] overflow-y-auto">
              <table className="w-full">
<thead className="bg-gray-50 sticky top-0 z-10 shadow">
                  <tr>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("ItemDetails")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Item Details</span>
                        {getSortIcon("ItemDetails")}
                      </div>
                    </th>

                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("StockInDate")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Stock In Date</span>
                        {getSortIcon("StockInDate")}
                      </div>
                    </th>

                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("StockOutDate")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Stock Out Date</span>
                        {getSortIcon("StockOutDate")}
                      </div>
                    </th>

                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("StockAvailable")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Stock Available</span>
                        {getSortIcon("StockAvailable")}
                      </div>
                    </th>

                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("HSNCode")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>HSN Code</span>
                        {getSortIcon("HSNCode")}
                      </div>
                    </th>

                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("Limit")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Limit</span>
                        {getSortIcon("Limit")}
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
                          {record.ItemDetails}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-600">
                          {record.StockInDate}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-600">
                          {record.StockOutDate}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-2 rounded-full  font-semibold ${getLimitColor(
                            record.StockAvailable, record.Limit
                          )}`}
                        >
                          {record.StockAvailable}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">
                          {record.HSNCode}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">
                          {record.Limit}
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
                  {editingRecord ? "Edit Vendor Record" : "Add New Vendor Record"}
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
                    Inventory Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Item Details</label>
                      <input type="text" name="ItemDetails" value={formData.ItemDetails} onChange={handleInputChange} 
                        placeholder="Enter Item Details"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>


                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock In Date</label>
                      <input type="text" name="StockInDate" value={formData.StockInDate} onChange={handleInputChange} 
                        placeholder="Enter Stock In Date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock Out Date</label>
                      <input type="text" name="StockOutDate" value={formData.StockOutDate} onChange={handleInputChange} 
                        placeholder="Enter Stock Out Date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock Available</label>
                      <input type="text" name="StockAvailable" value={formData.StockAvailable} onChange={handleInputChange} 
                        placeholder="Enter Stock Available"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">HSN Code</label>
                      <input type="text" name="HSNCode" value={formData.HSNCode} onChange={handleInputChange} 
                        placeholder="Enter HSN Code"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>


                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Limit</label>
                      <input type="text" name="Limit" value={formData.Limit} onChange={handleInputChange} 
                        placeholder="Enter Limit"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>

                  </div>
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
                <h2 className="text-xl font-semibold">Vendor Record Details</h2>
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
                    {viewingRecord.ItemDetails}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Stock In Date
                    </label>
                    <p className="text-lg font-semibold text-gray-800">
                      {viewingRecord.StockInDate}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Stock Out Date
                    </label>
                    <p className="text-lg font-semibold text-gray-800">
                      {viewingRecord.StockOutDate}
                    </p>
                  </div>
                  <div>
  <label className="block text-sm font-medium text-gray-500">
    Stock Available
  </label>
  <span className={`inline-block px-3 py-1 rounded-full font-medium ${getLimitColor( viewingRecord.StockAvailable, viewingRecord.Limit
    )}`}>
    {viewingRecord.StockAvailable}
  </span>
</div>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      HSN Code
                    </label>
                    <p className="text-lg font-semibold text-gray-800">
                      {viewingRecord.HSNCode}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Limit
                    </label>
                    <p className="text-lg font-semibold text-gray-800">
                      {viewingRecord.Limit}
                    </p>
                  </div>
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

export default Inventory;
