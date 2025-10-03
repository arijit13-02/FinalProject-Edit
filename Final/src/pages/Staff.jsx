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

function Staff() {
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
    StaffID: "",
    StaffName: "",
    AADHAR: "",
    Address: "",
    PhoneNumber: "",
    DOB: "",
    Age: "",
    Blood: "",
    BankName: "",
    Branch: "",
    AccountNo: "",
    IFSCCode: "",
    ESICNo: "",
    PFNO: ""
  });
  // Load records from localStorage (simulating JSON file)

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval); // cleanup
  }, []); // empty dependency array

  const fetchData = async () => {
    try {
      const url = "http://192.168.0.102:5050/api/staff";
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
          `http://192.168.0.102:5050/api/staff/${editingRecord.id}`, // update by ID
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
          "http://192.168.0.102:5050/api/staff",
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
      StaffID: "",
      StaffName: "",
      AADHAR: "",
      Address: "",
      PhoneNumber: "",
      DOB: "",
      Age: "",
      Blood: "",
      BankName: "",
      Branch: "",
      AccountNo: "",
      IFSCCode: "",
      ESICNo: "",
      PFNO: ""
    });
    setIsFormOpen(false);
    setEditingRecord(null);
  };

  const handleEdit = (record) => {
    setFormData({
      StaffID: record.StaffID,
      StaffName: record.StaffName,
      AADHAR: record.AADHAR,
      Address: record.Address,
      PhoneNumber: record.PhoneNumber,
      DOB: record.DOB,
      Age: record.Age,
      Blood: record.Blood,
      BankName: record.BankName,
      Branch: record.Branch,
      AccountNo: record.AccountNo,
      IFSCCode: record.IFSCCode,
      ESICNo: record.ESICNo,
      PFNO: record.PFNO

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
        `http://192.168.0.102:5050/api/staff/${id}`,
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
        record.StaffID.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.StaffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.AADHAR.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.Address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.PhoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.DOB.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.Age.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.Blood.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.BankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.Branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.AccountNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.IFSCCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.ESICNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.PFNO.toLowerCase().includes(searchTerm.toLowerCase())
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
                  Staff Data
                </h1>
                <p className="text-blue-100">
                  Manage and track Data for all your staff.
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsFormOpen(true)}
                className="bg-white/90 hover:bg-white text-blue-600 px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Add Staff Record</span>
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
            Staff Records ({records.length})
          </div>

          {filteredAndSortedRecords.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm
                  ? "No records match your search."
                  : "No records found. Add your first staff record!"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("StaffID")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Staff ID</span>
                        {getSortIcon("StaffID")}
                      </div>
                    </th>

                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("StaffName")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Staff Name</span>
                        {getSortIcon("StaffName")}
                      </div>
                    </th>

                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("AADHAR")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>AADHAR</span>
                        {getSortIcon("AADHAR")}
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
                      onClick={() => handleSort("PhoneNumber")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Phone Number</span>
                        {getSortIcon("PhoneNumber")}
                      </div>
                    </th>

                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("DOB")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Date of Birth</span>
                        {getSortIcon("DOB")}
                      </div>
                    </th>

                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("Age")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Age</span>
                        {getSortIcon("Age")}
                      </div>
                    </th>

                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("Blood")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Blood Group</span>
                        {getSortIcon("Blood")}
                      </div>
                    </th>

                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("BankName")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Bank Name</span>
                        {getSortIcon("BankName")}
                      </div>
                    </th>

                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("Branch")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Branch</span>
                        {getSortIcon("Branch")}
                      </div>
                    </th>

                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("AccountNo")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Account No</span>
                        {getSortIcon("AccountNo")}
                      </div>
                    </th>

                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("IFSCCode")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>IFSC Code</span>
                        {getSortIcon("IFSCCode")}
                      </div>
                    </th>

                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("ESICNo")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>ESIC No</span>
                        {getSortIcon("ESICNo")}
                      </div>
                    </th>

                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => handleSort("PFNO")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>PF No</span>
                        {getSortIcon("PFNO")}
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
                        <div className="text-sm font-semibold text-gray-800">
                          {record.StaffID}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">
                          {record.StaffName}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">
                          {record.AADHAR}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">
                          {record.Address}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">
                          {record.PhoneNumber}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">
                          {record.DOB}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">
                          {record.Age}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">
                          {record.Blood}
                        </div>
                      </td>


                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">
                          {record.BankName}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">
                          {record.Branch}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">
                          {record.AccountNo}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">
                          {record.IFSCCode}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">
                          {record.ESICNo}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-800">
                          {record.PFNO}
                        </div>
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
                  {editingRecord ? "Edit Staff Record" : "Add New Staff Record"}
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
                    Staff Info
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Staff ID
                      </label>
                      <input
                        type="text"
                        name="StaffID"
                        value={formData.StaffID}
                        onChange={handleInputChange}
                        placeholder="Enter Staff ID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Staff Name
                      </label>
                      <input
                        type="text"
                        name="StaffName"
                        value={formData.StaffName}
                        onChange={handleInputChange}
                        placeholder="Enter Staff Name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        AADHAR
                      </label>
                      <input
                        type="text"
                        name="AADHAR"
                        value={formData.AADHAR}
                        onChange={handleInputChange}
                        placeholder="Enter AADHAR"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        name="Address"
                        value={formData.Address}
                        onChange={handleInputChange}
                        placeholder="Enter Address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        name="PhoneNumber"
                        value={formData.PhoneNumber}
                        onChange={handleInputChange}
                        placeholder="Enter Phone Number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="DOB"
                        value={formData.DOB}
                        onChange={handleInputChange}
                        placeholder="Enter Date of Birth"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Age
                      </label>
                      <input
                        type="number"
                        name="Age"
                        value={formData.Age}
                        onChange={handleInputChange}
                        placeholder="Enter Age"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Blood Group
                      </label>
                      <input
                        type="text"
                        name="Blood"
                        value={formData.Blood}
                        onChange={handleInputChange}
                        placeholder="Enter Blood Group"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>


                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        name="BankName"
                        value={formData.BankName}
                        onChange={handleInputChange}
                        placeholder="Enter Bank Name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Branch
                      </label>
                      <input
                        type="text"
                        name="Branch"
                        value={formData.Branch}
                        onChange={handleInputChange}
                        placeholder="Enter Branch"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Number
                      </label>
                      <input
                        type="text"
                        name="AccountNo"
                        value={formData.AccountNo}
                        onChange={handleInputChange}
                        placeholder="Enter Account Number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        name="IFSCCode"
                        value={formData.IFSCCode}
                        onChange={handleInputChange}
                        placeholder="Enter IFSC Code"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ESIC Number
                      </label>
                      <input
                        type="text"
                        name="ESICNo"
                        value={formData.ESICNo}
                        onChange={handleInputChange}
                        placeholder="Enter ESIC Number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PF Number
                      </label>
                      <input
                        type="text"
                        name="PFNO"
                        value={formData.PFNO}
                        onChange={handleInputChange}
                        placeholder="Enter PF Number"
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
              <div className="bg-blue-600 text-white p-4 rounded-t-xl flex items-center justify-between">
                <h2 className="text-xl font-semibold">Staff Record Details</h2>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="text-white hover:bg-blue-700 p-1 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Staff ID</label>
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium">{viewingRecord.StaffID}</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Staff Name</label>
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium">{viewingRecord.StaffName}</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">AADHAR</label>
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium">{viewingRecord.AADHAR}</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Address</label>
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium">{viewingRecord.Address}</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium">{viewingRecord.PhoneNumber}</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
                    <p className="text-lg font-semibold text-gray-800">{new Date(viewingRecord.DOB).toLocaleDateString()}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Age</label>
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium">{viewingRecord.Age}</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Blood Group</label>
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium">{viewingRecord.Blood}</span>
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-500">Bank Name</label>
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium">{viewingRecord.BankName}</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Branch</label>
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium">{viewingRecord.Branch}</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Account Number</label>
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium">{viewingRecord.AccountNo}</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">IFSC Code</label>
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium">{viewingRecord.IFSCCode}</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">ESIC Number</label>
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium">{viewingRecord.ESICNo}</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">PF Number</label>
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium">{viewingRecord.PFNO}</span>
                  </div>







                </div>

                <div className="flex space-x-3 pt-4">
                  <button onClick={() => { setIsDetailOpen(false); handleEdit(viewingRecord); }} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2" >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Record</span>
                  </button>
                  <button onClick={() => setIsDetailOpen(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors duration-200" > {" "} Close </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>



    </div>
  );
}

export default Staff;
