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

function Vendors() {
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
    SrNo: "",
    ItemSpec: "",
    HSN: "",
    VendorName: "",
    GSTIN: "",
    Address: "",
    ContactNo: "",
    MailingID: "",
    ContactName: "",
    PurchaseDate: "",
    Qty: "",
    Rate: "",
    Unit: "",
    TaxPercent: "",
    TotalAmount: "",
    PaidOn: ""
  });
  // Load records from localStorage (simulating JSON file)

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval); // cleanup
  }, []); // empty dependency array

  const fetchData = async () => {
    try {
      const url = "http://192.168.0.105:5050/api/vendors";
      if (!url) return;
      const res = await axios.get(url, {
        headers: { "x-user-role": localStorage.getItem("userRole") }
      });
      setRecords(res.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingRecord) {
      try {
        const response = await axios.put(
          `http://192.168.0.105:5050/api/vendors/${editingRecord.id}`, // update by ID
          {
            ...formData,
            id: editingRecord.id,
            createdAt: editingRecord.createdAt,
            updatedAt: new Date().toISOString()
          },
          {
            headers: { "x-user-role": localStorage.getItem("userRole") }
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
          "http://192.168.0.105:5050/api/vendors",
          formData,
          {
            headers: {
              "x-user-role": role  // role should be "admin"
            }
          }
        );

        if (response.data.success) {
          setRecords([...records, response.data.item]);
          resetForm();
        } else {
          console.error("Failed to add:", response.data.message);
        }
      } catch (error) {
        console.error("API error:", error.response?.data || error.message);
      }
    }
  };




  const resetForm = () => {
    setFormData({
      SrNo: "",
      ItemSpec: "",
      HSN: "",
      VendorName: "",
      GSTIN: "",
      Address: "",
      ContactNo: "",
      MailingID: "",
      ContactName: "",
      PurchaseDate: "",
      Qty: "",
      Rate: "",
      Unit: "",
      TaxPercent: "",
      TotalAmount: "",
      PaidOn: ""
    });
    setIsFormOpen(false);
    setEditingRecord(null);
  };

  const handleEdit = (record) => {
    setFormData({
      SrNo: record.SrNo,
      ItemSpec: record.ItemSpec,
      HSN: record.HSN,
      VendorName: record.VendorName,
      GSTIN: record.GSTIN,
      Address: record.Address,
      ContactNo: record.ContactNo,
      MailingID: record.MailingID,
      ContactName: record.ContactName,
      PurchaseDate: record.PurchaseDate,
      Qty: record.Qty,
      Rate: record.Rate,
      Unit: record.Unit,
      TaxPercent: record.TaxPercent,
      TotalAmount: record.TotalAmount,
      PaidOn: record.PaidOn

    });
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleView = (record) => {
    setViewingRecord(record);
    setIsDetailOpen(true);
  };


  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://192.168.0.105:5050/api/vendors/${id}`,
        {
          headers: { "x-user-role": localStorage.getItem("userRole") }
        }
      );
      fetchData();
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
        record.SrNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.ItemSpec.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.HSN.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.VendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.GSTIN.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.Address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.ContactNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.MailingID.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.ContactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.PurchaseDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.Qty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.Rate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.Unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.TaxPercent.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.TotalAmount.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.PaidOn.toLowerCase().includes(searchTerm.toLowerCase())

    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        if (sortConfig.key === "date" || sortConfig.key === "createdAt") {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
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

  // Export to XLSX
  const exportToXls = () => {
    if (!records || records.length === 0) return;

    // 1. Prepare data (no nested TransformerDetails processing needed)
      const processedData = records.map(record => {
    const { id, ID, updatedAt,createdAt, ...flatRecord } = record;
    return flatRecord;
  });

    // 2. Convert processed data to worksheet
    const ws = XLSX.utils.json_to_sheet(processedData);

    // 3. Create workbook and append worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vendors");

    // 4. Generate Excel file buffer
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    // 5. Save as file
    const exportFileName = `Vendors.xlsx`;
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, exportFileName);
  };

  // Import from XLSX
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

      // Insert each record individually
      for (const record of importedData) {
        const url = "http://192.168.0.105:5050/api/vendors";
        if (!url) {
          console.error("Invalid location/category combination for record:", record);
          continue;
        }

        try {
          const response = await axios.post(url, record, {
            headers: { "x-user-role": localStorage.getItem("userRole") },
          });

          if (response.data.success) {
            setRecords((prevData) => [...prevData, response.data.item || record]);
          } else {
            console.error("Failed to insert record:", response.data.message, record);
          }
        } catch (err) {
          console.error("Error inserting record:", err, record);
        }
      }
    };

    reader.readAsArrayBuffer(file);
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
      <main className="max-w-20xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  Vendors
                </h1>
                <p className="text-blue-100">
                  Manage and track all your vendor records.
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => document.getElementById("importFileInput").click()}
                className="bg-white/90 hover:bg-white text-blue-600 px-3 py-1.5 rounded-md font-medium transition-colors duration-200 flex items-center space-x-1"
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
                className="bg-white/90 hover:bg-white text-blue-600 px-3 py-1.5 rounded-md font-medium transition-colors duration-200 flex items-center space-x-1"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={() => setIsFormOpen(true)}
                className="bg-white/90 hover:bg-white text-blue-600 px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Add Vendor Record</span>
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
            Vendor Records ({records.length})
          </div>

          {filteredAndSortedRecords.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm
                  ? "No records match your search."
                  : "No records found. Add your first vendor record!"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("SrNo")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Sr No</span>
                        {getSortIcon("SrNo")}
                      </div>
                    </th>

                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("ItemSpec")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Item Spec</span>
                        {getSortIcon("ItemSpec")}
                      </div>
                    </th>

                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("HSN")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>HSN</span>
                        {getSortIcon("HSN")}
                      </div>
                    </th>

                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("VendorName")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Vendor Name</span>
                        {getSortIcon("VendorName")}
                      </div>
                    </th>

                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("GSTIN")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>GSTIN</span>
                        {getSortIcon("GSTIN")}
                      </div>
                    </th>

                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("Address")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Address</span>
                        {getSortIcon("Address")}
                      </div>
                    </th>

                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("ContactNo")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Contact No</span>
                        {getSortIcon("ContactNo")}
                      </div>
                    </th>

                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("MailingID")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Mailing ID</span>
                        {getSortIcon("MailingID")}
                      </div>
                    </th>

                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("ContactName")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Contact Name</span>
                        {getSortIcon("ContactName")}
                      </div>
                    </th>

                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("PurchaseDate")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Purchase Date</span>
                        {getSortIcon("PurchaseDate")}
                      </div>
                    </th>

                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("Qty")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Qty</span>
                        {getSortIcon("Qty")}
                      </div>
                    </th>

                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("Rate")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Rate (Rs)</span>
                        {getSortIcon("Rate")}
                      </div>
                    </th>

                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("Unit")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Unit</span>
                        {getSortIcon("Unit")}
                      </div>
                    </th>

                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("TaxPercent")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Tax %</span>
                        {getSortIcon("TaxPercent")}
                      </div>
                    </th>

                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("TotalAmount")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Total Amount</span>
                        {getSortIcon("TotalAmount")}
                      </div>
                    </th>

                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("PaidOn")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Paid On</span>
                        {getSortIcon("PaidOn")}
                      </div>
                    </th>


                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAndSortedRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">{record.SrNo}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">{record.ItemSpec}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">{record.HSN}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">{record.VendorName}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">{record.GSTIN}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">{record.Address}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">{record.ContactNo}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">{record.MailingID}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">{record.ContactName}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">{record.PurchaseDate}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">{record.Qty}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">{record.Rate}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">{record.Unit}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">{record.TaxPercent}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">{record.TotalAmount}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">{record.PaidOn}</div>
                      </td>



                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button onClick={() => handleView(record)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEdit(record)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="Edit record"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(record.id)}
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
                  {editingRecord ? "Edit Job Record" : "Add New Vendor Record"}
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
                    Vendor Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* SrNo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SrNo</label>
                      <input
                        type="text"
                        name="SrNo"
                        value={formData.SrNo}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter SrNo"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Item Spec */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Item Spec</label>
                      <input
                        type="text"
                        name="ItemSpec"
                        value={formData.ItemSpec}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter Item Spec"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* HSN */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">HSN</label>
                      <input
                        type="text"
                        name="HSN"
                        value={formData.HSN}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter HSN"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Vendor Info Heading */}
                    <div className="col-span-3 mt-4 mb-2">
                      <h2 className="text-sm font-semibold text-gray-700 border-b pb-1">Vendor Info</h2>
                    </div>

                    {/* Vendor Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                      <input
                        type="text"
                        name="VendorName"
                        value={formData.VendorName}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter Vendor Name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* GSTIN */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                      <input
                        type="text"
                        name="GSTIN"
                        value={formData.GSTIN}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter GSTIN"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        name="Address"
                        value={formData.Address}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter Address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Contact Info Heading */}
                    <div className="col-span-3 mt-4 mb-2">
                      <h2 className="text-sm font-semibold text-gray-700 border-b pb-1">Contact Info</h2>
                    </div>

                    {/* Contact No */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact No</label>
                      <input
                        type="text"
                        name="ContactNo"
                        value={formData.ContactNo}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter Contact No"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Mailing ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mailing ID</label>
                      <input
                        type="text"
                        name="MailingID"
                        value={formData.MailingID}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter Mailing ID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Contact Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                      <input
                        type="text"
                        name="ContactName"
                        value={formData.ContactName}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter Contact Name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Purchase Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                      <input
                        type="text"
                        name="PurchaseDate"
                        value={formData.PurchaseDate}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter Purchase Date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Qty */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Qty</label>
                      <input
                        type="number"
                        name="Qty"
                        value={formData.Qty}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter Qty"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Rate */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
                      <input
                        type="number"
                        name="Rate"
                        value={formData.Rate}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter Rate"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Unit */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                      <input
                        type="text"
                        name="Unit"
                        value={formData.Unit}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter Unit"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Tax & Payment Heading */}
                    <div className="col-span-3 mt-4 mb-2">
                      <h2 className="text-sm font-semibold text-gray-700 border-b pb-1">Tax & Payment</h2>
                    </div>

                    {/* Tax Percent */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tax Percent</label>
                      <input
                        type="number"
                        name="TaxPercent"
                        value={formData.TaxPercent}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter Tax Percent"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Total Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                      <input
                        type="number"
                        name="TotalAmount"
                        value={formData.TotalAmount}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter Total Amount"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Paid On */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Paid On</label>
                      <input
                        type="text"
                        name="PaidOn"
                        value={formData.PaidOn}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter Paid On"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
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
      
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-xl flex items-center justify-between">
        <h2 className="text-xl font-semibold">Vendor Record Details</h2>
        <button
          onClick={() => setIsDetailOpen(false)}
          className="text-white hover:bg-blue-700 p-1 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">

        {/* Vendor Information Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Vendor Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* SrNo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SrNo</label>
              <p className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50">
                {viewingRecord.SrNo}
              </p>
            </div>

            {/* Item Spec */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Spec</label>
              <p className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50">
                {viewingRecord.ItemSpec}
              </p>
            </div>

            {/* HSN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">HSN</label>
              <p className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50">
                {viewingRecord.HSN}
              </p>
            </div>

            {/* Section Header: Vendor Info */}
            <div className="col-span-3 mt-4 mb-2">
              <h2 className="text-sm font-semibold text-gray-700 border-b pb-1">Vendor Info</h2>
            </div>

            {/* Vendor Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
              <p className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50">
                {viewingRecord.VendorName}
              </p>
            </div>

            {/* GSTIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
              <p className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50">
                {viewingRecord.GSTIN}
              </p>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <p className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50">
                {viewingRecord.Address}
              </p>
            </div>

            {/* Section Header: Contact Info */}
            <div className="col-span-3 mt-4 mb-2">
              <h2 className="text-sm font-semibold text-gray-700 border-b pb-1">Contact Info</h2>
            </div>

            {/* Contact No */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact No</label>
              <p className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50">
                {viewingRecord.ContactNo}
              </p>
            </div>

            {/* Mailing ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mailing ID</label>
              <p className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50">
                {viewingRecord.MailingID}
              </p>
            </div>

            {/* Contact Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
              <p className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50">
                {viewingRecord.ContactName}
              </p>
            </div>

            {/* Section Header: Purchase Details */}
            <div className="col-span-3 mt-4 mb-2">
              <h2 className="text-sm font-semibold text-gray-700 border-b pb-1">Purchase Details</h2>
            </div>

            {/* Purchase Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
              <p className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50">
                {viewingRecord.PurchaseDate}
              </p>
            </div>

            {/* Qty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Qty</label>
              <p className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50">
                {viewingRecord.Qty}
              </p>
            </div>

            {/* Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
              <p className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50">
                {viewingRecord.Rate}
              </p>
            </div>

            {/* Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <p className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50">
                {viewingRecord.Unit}
              </p>
            </div>

            {/* Section Header: Tax & Payment */}
            <div className="col-span-3 mt-4 mb-2">
              <h2 className="text-sm font-semibold text-gray-700 border-b pb-1">Tax & Payment</h2>
            </div>

            {/* Tax Percent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Percent</label>
              <p className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50">
                {viewingRecord.TaxPercent}
              </p>
            </div>

            {/* Total Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
              <p className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50">
                {viewingRecord.TotalAmount}
              </p>
            </div>

            {/* Paid On */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paid On</label>
              <p className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50">
                {viewingRecord.PaidOn}
              </p>
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            onClick={() => { setIsDetailOpen(false); handleEdit(viewingRecord); }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Record</span>
          </button>

          <button
            onClick={() => setIsDetailOpen(false)}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
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

export default Vendors;
