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

function Billing() {
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
    Date: "",
    BillNo: "",
    Status: "",
    WorkDescrp: "",
    HSNSAC: "",
    PartyDetails: "",
    PartyGSTNo: "",
    JobCost: "",
    TaxRate: "",
    CGST: "",
    SGST: "",
    Total: "",
    Scrap: "",
    NetAmount: "",
    SD: "",
    TDS: "",
    TCS: "",
    ScrapTax: "",
    Others: "",
    NetPayble: "",
    AmountReceived: "",
    ChequeNEFTDetails: "",
    PaymentReceivedDate: "",
    BillTotal: ""
  });
  // Load records from localStorage (simulating JSON file)

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval); // cleanup
  }, []); // empty dependency array

  const fetchData = async () => {
    try {
      const url = "http://192.168.0.111:5050/api/billing";
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
          `http://192.168.0.111:5050/api/billing/${editingRecord.id}`, // update by ID
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
          "http://192.168.0.111:5050/api/billing",
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
      Date: "",
      BillNo: "",
      Status: "",
      WorkDescrp: "",
      HSNSAC: "",
      PartyDetails: "",
      PartyGSTNo: "",
      JobCost: "",
      TaxRate: "",
      CGST: "",
      SGST: "",
      Total: "",
      Scrap: "",
      NetAmount: "",
      SD: "",
      TDS: "",
      TCS: "",
      ScrapTax: "",
      Others: "",
      NetPayble: "",
      AmountReceived: "",
      ChequeNEFTDetails: "",
      PaymentReceivedDate: "",
      BillTotal: ""
    });
    setIsFormOpen(false);
    setEditingRecord(null);
  };

  const handleEdit = (record) => {
    setFormData({
      SrNo: record.SrNo,
      Date: record.Date,
      BillNo: record.BillNo,
      Status: record.Status,
      WorkDescrp: record.WorkDescrp,
      HSNSAC: record.HSNSAC,
      PartyDetails: record.PartyDetails,
      PartyGSTNo: record.PartyGSTNo,
      JobCost: record.JobCost,
      TaxRate: record.TaxRate,
      CGST: record.CGST,
      SGST: record.SGST,
      Total: record.Total,
      Scrap: record.Scrap,
      NetAmount: record.NetAmount,
      SD: record.SD,
      TDS: record.TDS,
      TCS: record.TCS,
      ScrapTax: record.ScrapTax,
      Others: record.Others,
      NetPayble: record.NetPayble,
      AmountReceived: record.AmountReceived,
      ChequeNEFTDetails: record.ChequeNEFTDetails,
      PaymentReceivedDate: record.PaymentReceivedDate,
      BillTotal: record.BillTotal

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
        `http://192.168.0.111:5050/api/billing/${id}`,
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
        String(record.SrNo).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(record.Date).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(record.BillNo).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(record.Status).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(record.WorkDescrp).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(record.HSNSAC).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(record.PartyDetails).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(record.PartyGSTNo).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(record.JobCost).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(record.TaxRate).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(record.CGST).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(record.SGST).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(record.Total).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(record.Scrap).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(record.NetAmount).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(record.SD).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(record.TDS).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(record.TCS).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(record.ScrapTax).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(record.Others).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(record.NetPayble).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(record.AmountReceived).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(record.ChequeNEFTDetails).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(record.PaymentReceivedDate).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(record.BillTotal).toLowerCase().includes(searchTerm.toLowerCase())


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
    const processedData = records.map(record => ({ ...record }));

    // 2. Convert processed data to worksheet
    const ws = XLSX.utils.json_to_sheet(processedData);

    // 3. Create workbook and append worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Billing Data");

    // 4. Generate Excel file buffer
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    // 5. Save as file
    const exportFileName = `Billing.xlsx`;
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, exportFileName);
  };
  // Columns array
  const columns = [
    { key: "SrNo", label: "Sr No" },
    { key: "Date", label: "Date" },
    { key: "BillNo", label: "Bill No" },
    { key: "Status", label: "Status" },
    { key: "WorkDescrp", label: "Work Description" },
    { key: "JobCost", label: "Job Cost" },
    { key: "CGST", label: "CGST" },
    { key: "SGST", label: "SGST" },
    { key: "Total", label: "Total" },
    { key: "Scrap", label: "Scrap" },
    { key: "NetAmount", label: "Net Amount" },
    { key: "SD", label: "SD" },
    { key: "TDS", label: "TDS", group: "Tax Deduction" },
    { key: "TCS", label: "TCS", group: "Tax Deduction" },
    { key: "ScrapTax", label: "Scrap Tax", group: "Tax Deduction" },
    { key: "Others", label: "Others" },
    { key: "NetPayble", label: "Net Payable" },
    { key: "AmountReceived", label: "Amount Received" },
    { key: "ChequeNEFTDetails", label: "Cheque/NEFT Details" },
    { key: "PaymentReceivedDate", label: "Payment Received Date" },
    { key: "BillTotal", label: "Bill Total" },
  ];


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
        const url = "http://192.168.0.111:5050/api/billing";
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
                  Billing
                </h1>
                <p className="text-blue-100">
                  Manage your Billing Data
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
                <span>Add Billing Record</span>
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
            Billing Records ({records.length})
          </div>

          {filteredAndSortedRecords.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm
                  ? "No records match your search."
                  : "No records found. Add your first billing record!"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  {/* First row: Group headings */}
                  <tr>
                    {/* Sr No stays single */}
                    <th
                      rowSpan={2}
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("SrNo")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Sr No</span>
                        {getSortIcon("SrNo")}
                      </div>
                    </th>

                    <th
                      rowSpan={2}
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("Date")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Date</span>
                        {getSortIcon("Date")}
                      </div>
                    </th>
                    <th
                      rowSpan={2}
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("BillNo")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Bill No</span>
                        {getSortIcon("BillNo")}
                      </div>
                    </th>

                    <th
                      rowSpan={2}
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("Status")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Status</span>
                        {getSortIcon("Status")}
                      </div>
                    </th>


                    <th
                      rowSpan={2}
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("WorkDescrp")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Work Description</span>
                        {getSortIcon("WorkDescrp")}
                      </div>
                    </th>

                    <th
                      rowSpan={2}
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("HSNSAC")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>HSN/SAC</span>
                        {getSortIcon("HSNSAC")}
                      </div>
                    </th>

                    <th
                      rowSpan={2}
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("PartyDetails")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Party Details</span>
                        {getSortIcon("PartyDetails")}
                      </div>
                    </th>

                    <th
                      rowSpan={2}
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("PartyGSTNo")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Party GST No</span>
                        {getSortIcon("PartyGSTNo")}
                      </div>
                    </th>

                    <th
                      rowSpan={2}
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("JobCost")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Job Cost</span>
                        {getSortIcon("JobCost")}
                      </div>
                    </th>

                    <th
                      rowSpan={2}
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("TaxRate")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Tax Rate</span>
                        {getSortIcon("TaxRate")}
                      </div>
                    </th>

                    <th
                      rowSpan={2}
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("CGST")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>CGST</span>
                        {getSortIcon("CGST")}
                      </div>
                    </th>

                    <th
                      rowSpan={2}
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("SGST")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>SGST</span>
                        {getSortIcon("SGST")}
                      </div>
                    </th>

                    <th
                      rowSpan={2}
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("Total")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Total</span>
                        {getSortIcon("Total")}
                      </div>
                    </th>

                    <th
                      rowSpan={2}
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("Scrap")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Scrap</span>
                        {getSortIcon("Scrap")}
                      </div>
                    </th>

                    <th
                      rowSpan={2}
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("NetAmount")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Net Amount</span>
                        {getSortIcon("NetAmount")}
                      </div>
                    </th>

                    <th
                      rowSpan={2}
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("SD")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>SD</span>
                        {getSortIcon("SD")}
                      </div>
                    </th>

                    {/* Tax Deduction group */}
                    <th colSpan={3} className="px-6 py-4 text-center text-sm font-medium text-gray-700 bg-gray-100 border-b">
                      Tax Deduction
                    </th>
                    <th
                      rowSpan={2}
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("Others")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Others</span>
                        {getSortIcon("Others")}
                      </div>
                    </th>

                    <th
                      rowSpan={2}
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("NetPayble")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Net Payable</span>
                        {getSortIcon("NetPayble")}
                      </div>
                    </th>

                    <th
                      rowSpan={2}
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("AmountReceived")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Amount Received</span>
                        {getSortIcon("AmountReceived")}
                      </div>
                    </th>

                    <th
                      rowSpan={2}
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("ChequeNEFTDetails")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Cheque/NEFT Details</span>
                        {getSortIcon("ChequeNEFTDetails")}
                      </div>
                    </th>

                    <th
                      rowSpan={2}
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("PaymentReceivedDate")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Payment Received Date</span>
                        {getSortIcon("PaymentReceivedDate")}
                      </div>
                    </th>

                    <th
                      rowSpan={2}
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("BillTotal")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Bill Total</span>
                        {getSortIcon("BillTotal")}
                      </div>
                    </th>


                    {/* Actions stays single */}
                    <th rowSpan={2} className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>

                  {/* Second row: Sub-columns under Tax Deduction */}
                  <tr>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("TDS")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>TDS</span>
                        {getSortIcon("TDS")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("TCS")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>TCS</span>
                        {getSortIcon("TCS")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("ScrapTax")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Scrap Tax</span>
                        {getSortIcon("ScrapTax")}
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filteredAndSortedRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors duration-200">

                      <td className="px-6 py-4"><div className="text-sm font-semibold text-gray-800">{record.SrNo}</div></td>
                      <td className="px-6 py-4"><div className="text-sm font-semibold text-gray-800">{record.Date}</div></td>
                      <td className="px-6 py-4"><div className="text-sm font-semibold text-gray-800">{record.BillNo}</div></td>
                      <td className="px-6 py-4"><div className="text-sm font-semibold text-gray-800">{record.Status}</div></td>
                      <td className="px-6 py-4"><div className="text-sm font-semibold text-gray-800">{record.WorkDescrp}</div></td>
                      <td className="px-6 py-4"><div className="text-sm font-semibold text-gray-800">{record.HSNSAC}</div></td>
                      <td className="px-6 py-4"><div className="text-sm font-semibold text-gray-800">{record.PartyDetails}</div></td>
                      <td className="px-6 py-4"><div className="text-sm font-semibold text-gray-800">{record.PartyGSTNo}</div></td>
                      <td className="px-6 py-4"><div className="text-sm font-semibold text-gray-800">{record.JobCost}</div></td>
                      <td className="px-6 py-4"><div className="text-sm font-semibold text-gray-800">{record.TaxRate}</div></td>
                      <td className="px-6 py-4"><div className="text-sm font-semibold text-gray-800">{record.CGST}</div></td>
                      <td className="px-6 py-4"><div className="text-sm font-semibold text-gray-800">{record.SGST}</div></td>
                      <td className="px-6 py-4"><div className="text-sm font-semibold text-gray-800">{record.Total}</div></td>
                      <td className="px-6 py-4"><div className="text-sm font-semibold text-gray-800">{record.Scrap}</div></td>
                      <td className="px-6 py-4"><div className="text-sm font-semibold text-gray-800">{record.NetAmount}</div></td>
                      <td className="px-6 py-4"><div className="text-sm font-semibold text-gray-800">{record.SD}</div></td>
                      <td className="px-6 py-4"><div className="text-sm font-semibold text-gray-800">{record.TDS}</div></td>
                      <td className="px-6 py-4"><div className="text-sm font-semibold text-gray-800">{record.TCS}</div></td>
                      <td className="px-6 py-4"><div className="text-sm font-semibold text-gray-800">{record.ScrapTax}</div></td>
                      <td className="px-6 py-4"><div className="text-sm font-semibold text-gray-800">{record.Others}</div></td>
                      <td className="px-6 py-4"><div className="text-sm font-semibold text-gray-800">{record.NetPayble}</div></td>
                      <td className="px-6 py-4"><div className="text-sm font-semibold text-gray-800">{record.AmountReceived}</div></td>
                      <td className="px-6 py-4"><div className="text-sm font-semibold text-gray-800">{record.ChequeNEFTDetails}</div></td>
                      <td className="px-6 py-4"><div className="text-sm font-semibold text-gray-800">{record.PaymentReceivedDate}</div></td>
                      <td className="px-6 py-4"><div className="text-sm font-semibold text-gray-800">{record.BillTotal}</div></td>

                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button onClick={() => handleView(record)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200" title="View details">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEdit(record)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200" title="Edit record">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(record.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200" title="Delete record">
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
    <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">

      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-xl flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {editingRecord ? "Edit Billing Record" : "Add New Billing Record"}
        </h2>
        <button
          onClick={resetForm}
          className="text-white hover:bg-blue-700 p-1 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">

        {/* Section: Basic Info */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-1">Billing Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="text"
                name="Date"
                value={formData.Date}
                onChange={handleInputChange}
                required
                placeholder="Enter Date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bill No</label>
              <input
                type="text"
                name="BillNo"
                value={formData.BillNo}
                onChange={handleInputChange}
                required
                placeholder="Enter Bill No"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <input
                type="text"
                name="Status"
                value={formData.Status}
                onChange={handleInputChange}
                required
                placeholder="Enter Status"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Description</label>
              <input
                type="text"
                name="WorkDescrp"
                value={formData.WorkDescrp}
                onChange={handleInputChange}
                required
                placeholder="Enter Work Description"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">HSN / SAC</label>
              <input
                type="text"
                name="HSNSAC"
                value={formData.HSNSAC}
                onChange={handleInputChange}
                required
                placeholder="Enter HSN/SAC"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Section: Party Info */}
      <div>
  <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-1">Party Information</h3>

  {/* Row 1: Party Details, Party GST No, Job Cost */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Party Details</label>
      <input
        type="text"
        name="PartyDetails"
        value={formData.PartyDetails}
        onChange={handleInputChange}
        required
        placeholder="Enter Party Details"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Party GST No</label>
      <input
        type="text"
        name="PartyGSTNo"
        value={formData.PartyGSTNo}
        onChange={handleInputChange}
        required
        placeholder="Enter Party GST No"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Job Cost</label>
      <input
        type="number"
        name="JobCost"
        value={formData.JobCost}
        onChange={handleInputChange}
        required
        placeholder="Enter Job Cost"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  </div>

  {/* Row 2: Tax Rate, CGST, SGST, SD */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate</label>
      <input
        type="number"
        name="TaxRate"
        value={formData.TaxRate}
        onChange={handleInputChange}
        required
        placeholder="Enter Tax Rate"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">CGST</label>
      <input
        type="number"
        name="CGST"
        value={formData.CGST}
        onChange={handleInputChange}
        required
        placeholder="Enter CGST"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">SGST</label>
      <input
        type="number"
        name="SGST"
        value={formData.SGST}
        onChange={handleInputChange}
        required
        placeholder="Enter SGST"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">SD</label>
      <input
        type="number"
        name="SD"
        value={formData.SD}
        onChange={handleInputChange}
        required
        placeholder="Enter SD"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  </div>
</div>



        {/* Section: Totals */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-1">Totals</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
              <input
                type="number"
                name="Total"
                value={formData.Total}
                onChange={handleInputChange}
                required
                placeholder="Enter Total"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scrap</label>
              <input
                type="number"
                name="Scrap"
                value={formData.Scrap}
                onChange={handleInputChange}
                required
                placeholder="Enter Scrap"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Net Amount</label>
              <input
                type="number"
                name="NetAmount"
                value={formData.NetAmount}
                onChange={handleInputChange}
                required
                placeholder="Enter Net Amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Section: Tax Deductions */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-1">Tax Deductions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">TDS</label>
              <input
                type="number"
                name="TDS"
                value={formData.TDS}
                onChange={handleInputChange}
                required
                placeholder="Enter TDS"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">TCS</label>
              <input
                type="number"
                name="TCS"
                value={formData.TCS}
                onChange={handleInputChange}
                required
                placeholder="Enter TCS"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scrap Tax</label>
              <input
                type="number"
                name="ScrapTax"
                value={formData.ScrapTax}
                onChange={handleInputChange}
                required
                placeholder="Enter Scrap Tax"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Section: Others & Payment */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-1">Other Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Others</label>
              <input
                type="number"
                name="Others"
                value={formData.Others}
                onChange={handleInputChange}
                required
                placeholder="Enter Others"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Net Payable</label>
              <input
                type="number"
                name="NetPayble"
                value={formData.NetPayble}
                onChange={handleInputChange}
                required
                placeholder="Enter Net Payable"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount Received</label>
              <input
                type="number"
                name="AmountReceived"
                value={formData.AmountReceived}
                onChange={handleInputChange}
                required
                placeholder="Enter Amount Received"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cheque / NEFT Details</label>
              <input
                type="text"
                name="ChequeNEFTDetails"
                value={formData.ChequeNEFTDetails}
                onChange={handleInputChange}
                required
                placeholder="Enter Cheque/NEFT Details"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Received Date</label>
              <input
                type="text"
                name="PaymentReceivedDate"
                value={formData.PaymentReceivedDate}
                onChange={handleInputChange}
                required
                placeholder="Enter Payment Received Date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bill Total</label>
              <input
                type="number"
                name="BillTotal"
                value={formData.BillTotal}
                onChange={handleInputChange}
                required
                placeholder="Enter Bill Total"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

          </div>
        </div>

        {/* Action Buttons */}
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
                <h2 className="text-xl font-semibold">Billing Record Details</h2>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="text-white hover:bg-blue-700 p-1 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">

                {/* Key : Value Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries({
                    "Sr No": viewingRecord.SrNo,
                    "Date": viewingRecord.Date,
                    "Bill No": viewingRecord.BillNo,
                    "Status": viewingRecord.Status,
                    "Work Description": viewingRecord.WorkDescrp,
                    "HSN/SAC": viewingRecord.HSNSAC,
                    "Party Details": viewingRecord.PartyDetails,
                    "Party GST No": viewingRecord.PartyGSTNo,
                    "Job Cost": viewingRecord.JobCost,
                    "Tax Rate": viewingRecord.TaxRate,
                    "CGST": viewingRecord.CGST,
                    "SGST": viewingRecord.SGST,
                    "Total": viewingRecord.Total,
                    "Scrap": viewingRecord.Scrap,
                    "Net Amount": viewingRecord.NetAmount,
                    "SD": viewingRecord.SD,
                    "TDS": viewingRecord.TDS,
                    "TCS": viewingRecord.TCS,
                    "Scrap Tax": viewingRecord.ScrapTax,
                    "Others": viewingRecord.Others,
                    "Net Payable": viewingRecord.NetPayble,
                    "Amount Received": viewingRecord.AmountReceived,
                    "Cheque / NEFT Details": viewingRecord.ChequeNEFTDetails,
                    "Payment Received Date": viewingRecord.PaymentReceivedDate,
                    "Bill Total": viewingRecord.BillTotal,
                  }).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between border-b border-gray-200 pb-1"
                    >
                      <span className="font-medium text-gray-700">{key}:</span>
                      <span className="text-gray-800">{value || "-"}</span>
                    </div>
                  ))}
                </div>

                {/* Buttons */}
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

export default Billing;
