import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, Plus, Save, Edit3, Trash2, Search, ChevronUp, ChevronDown, Building2, Eye, X, Hourglass, Download, Upload, Menu, User, Settings, CalendarClock, Users, Boxes, FileText, BarChart3, BadgeCheck, PieChart, MapPin, Activity, Home, Briefcase, Lock, Globe
} from "lucide-react";

import logo from "../assets/logo.png";
import axios from "axios";
import { data } from "autoprefixer";

function Operations() {
  //checks authentication
  const navigate = useNavigate();
  const [role, setRole] = useState(() => {
    return localStorage.getItem("userRole") || "staff";
  });
  // keep role in localStorage in sync
  useEffect(() => {
    localStorage.setItem("userRole", role);
  }, [role]);
  // check role once on mount
  useEffect(() => {
    if (role !== "admin") {
      alert("Admin Privileges Required!\nLogin to proceed");
      navigate("/login");
    }
  }, [role, navigate]);


  const [isMenuOpen, setIsMenuOpen] = useState(false);

  //Ribbon at top

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
      onClick: () => navigate("/realtimejobs"),
    },
    {
      name: "Operations",
      icon: Settings,
      onClick: () => handleProtectedNav("/operations"),
    },
    {
      name: "Upcoming Jobs",
      icon: CalendarClock,
      onClick: () => handleProtectedNav("/upcoming-jobs"),
    },
    {
      name: "Vendors",
      icon: Building2,
      onClick: () => handleProtectedNav("/vendors"),
    },
    { name: "Staff", icon: Users, onClick: () => handleProtectedNav("/staff") },
    { name: "Inventory", icon: Boxes, onClick: () => navigate("/inventory") },
    {
      name: "Billing",
      icon: FileText,
      onClick: () => handleProtectedNav("/billing"),
    },
    {
      name: "Certifications",
      icon: BadgeCheck,
      onClick: () => handleProtectedNav("/certifications"),
    },
  ];


  //checkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
  const [records, setRecords] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [location, setLocation] = useState("inhouse");
  const [category, setCategory] = useState("wb");
  const [data, setData] = useState([]);

  const formTemplates = {
    "inhouse-wb": {
      "LOINo": "",
      "LOIDate": "",
      "Division": "",
      "Location": "",
      "Tender": "",
      "FileNo": "",
      "WorkOrder": "",
      "PrelimarySurvey": "",
      "SIRNofTransformer": "",
      "FinalSurvey": "",
      "SRNofDrainoutOil": "",
      "StageInspection": "",
      "OilStatement": "",
      "SIRNofOil": "",
      "TransfomerTesting": "",
      "Materialdeliveredon": "",
      "SRNofTransformer": "",
      "Estimate": "",
      "FormalOrderPlaced": "",
      "OrderReferanceno": "",
      "OrderDate": "",
      "Billsubmission": "",
      "Payment": "",
      "NetAmount": "",
      "SecurityDepositesubmitted": "",
      "SecurityDepositeReceived": ""
    },
    "site-wb": {
      "LOINo": "",
      "LOIDate": "",
      "Division": "",
      "Location": "",
      "Tender": "",
      "FileNo": "",
      "WorkOrder": "",
      "PrelimarySurvey": "",
      "SIRNofTransformer": "",
      "FinalSurvey": "",
      "SRNofDrainoutOil": "",
      "StageInspection": "",
      "OilStatement": "",
      "SIRNofOil": "",
      "TransfomerTesting": "",
      "Materialdeliveredon": "",
      "SRNofTransformer": "",
      "Estimate": "",
      "FormalOrderPlaced": "",
      "OrderReferanceno": "",
      "OrderDate": "",
      "Billsubmission": "",
      "Payment": "",
      "NetAmount": "",
      "SecurityDepositesubmitted": "",
      "SecurityDepositeReceived": ""
    },
    "inhouse-private": {
      "Client": "",
      "WorkOrder": "",
      "Date": "",
      "Category": "",
      "FileNo": "",
      "Dismetalling": "",
      "Inspection": "",
      "InformToClient": "",
      "Approval": "",
      "Winding": "",
      "Assembly": "",
      "HeatChamber": "",
      "Testing": "",
      "ClientInspection": "",
      "Delivery": "",
      "TestReportAttachment": "",
      "BillSubmission": "",
      "Payment": "",
      "Amount": "",
      "SecurityDeposited": ""
    },
    "inhouse-public": {
      "Client": "",
      "WorkOrder": "",
      "Date": "",
      "Category": "",
      "FileNo": "",
      "Dismetalling": "",
      "Inspection": "",
      "InformToClient": "",
      "Approval": "",
      "Winding": "",
      "Assembly": "",
      "HeatChamber": "",
      "Testing": "",
      "ClientInspection": "",
      "Delivery": "",
      "TestReportAttachment": "",
      "BillSubmission": "",
      "Payment": "",
      "Amount": "",
      "SecurityDeposited": ""
    },
    "site-private": {
      "Client": "",
      "WorkOrder": "",
      "Date": "",
      "Category": "",
      "SiteLocation": "",
      "TypeOfJob": "",
      "TransformerDetails": [
        {
          "KVA": "",
          "SrNo": "",
          "Rating": "",
          "Note": ""
        }
      ],
      "FileNo": "",
      "Make": "",
      "OilQty": "",
      "TestReportAttachment": "",
      "BillSubmission": "",
      "Payment": "",
      "Amount": "",
      "SecurityDeposited": ""
    },
    "site-public": {
      "Client": "",
      "WorkOrder": "",
      "Date": "",
      "Category": "",
      "SiteLocation": "",
      "TypeOfJob": "",
      "TransformerDetails": [
        {
          "KVA": "",
          "SrNo": "",
          "Rating": "",
          "Note": ""
        }
      ],
      "FileNo": "",
      "Make": "",
      "OilQty": "",
      "TestReportAttachment": "",
      "BillSubmission": "",
      "Payment": "",
      "Amount": "",
      "SecurityDeposited": ""
    },
  };
  const [formData, setFormData] = useState(formTemplates["inhouse-wb"]);
  // When location or category changes, reset formData based on template
  useEffect(() => {
    if (formData.location && formData.category) {
      const key = `${formData.location}-${formData.category}`;
      if (formTemplates[key]) {
        setFormData(formTemplates[key]);
      }
    }
  }, [location, category]);


  const getApiUrl = () => {
    if (location === "inhouse" && category === "wb")
      return "http://localhost:5050/api/operations/inhousewb";

    if (location === "inhouse" && category === "private")
      return "http://localhost:5050/api/operations/inhousepvt";

    if (location === "inhouse" && category === "public")
      return "http://localhost:5050/api/operations/inhousepub";

    if (location === "site" && category === "wb")
      return "http://localhost:5050/api/operations/sitewb";
    if (location === "site" && category === "private")
      return "http://localhost:5050/api/operations/sitepvt";
    if (location === "site" && category === "public")
      return "http://localhost:5050/api/operations/sitepub";

    return null;
  };

  const fetchData = async () => {
    try {
      const url = getApiUrl();
      if (!url) return;
      const res = await axios.get(url, {
        headers: { "x-user-role": localStorage.getItem("userRole") }
      });
      setData(res.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData(); // first fetch immediately

    const interval = setInterval(() => {
      fetchData();
    }, 2000); // 

    return () => clearInterval(interval); // cleanup
  }, [location, category]); // re-run when selection changes

  const exportToJSON = () => {
    const dataStr = JSON.stringify(records, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "job_tracking_records.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };



  //checkehckehekcheckehcekcheckehcekcheck
  const filteredAndSortedRecords = React.useMemo(() => {
    let filtered = data.filter((row) => {
      // Normalize search term once
      const search = searchTerm.toLowerCase();

      // Collect all possible searchable fields safely
      let searchableFields = [
        row.Client,
        row.WorkOrder,
        row.Date,
        row.Category,
        row.FileNo,
        row.Dismetalling,
        row.Inspection,
        row.InformToClient,
        row.Approval,
        row.Winding,
        row.Assembly,
        row.HeatChamber,
        row.Testing,
        row.ClientInspection,
        row.Delivery,
        row.BillSubmission,
        row.Payment,
        row.Amount,
        row.SecurityDeposited,
        row.SiteLocation,
        row.TypeOfJob,
        row.LOINo,
        row.LOIDate,
        row.Division,
        row.Location,
        row.Tender,
        row.PrelimarySurvey,
        row.SIRNofTransformer,
        row.FinalSurvey,
        row.SRNofDrainoutOil,
        row.StageInspection,
        row.OilStatement,
        row.SIRNofOil,
        row.TransfomerTesting,
        row.Materialdeliveredon,
        row.SRNofTransformer,
        row.Estimate,
        row.FormalOrderPlaced,
        row.OrderReferanceno,
        row.OrderDate,
        row.Billsubmission,
        row.NetAmount,
        row.SecurityDepositesubmitted,
        row.SecurityDepositeReceived,
        row.Make,
        row.OilQty,
      ];

      // Add transformer details if they exist
      if (Array.isArray(row.TransformerDetails)) {
        row.TransformerDetails.forEach((t) => {
          searchableFields.push(t.KVA, t.SrNo, t.Rating, t.Note);
        });
      }

      // Check if ANY field contains the search term
      return searchableFields.some(
        (field) => typeof field === "string" && field.toLowerCase().includes(search)
      );
    });
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
  }, [data, searchTerm, sortConfig]);


  const getCategoryColor = (category) => {
    const colors = {
      WB: "bg-blue-100 text-blue-800",
      Private: "bg-green-100 text-green-800",
      Public: "bg-purple-100 text-purple-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };
  const getExecutionColor = (execution) => {
    const colors = {
      Started: "bg-yellow-100 text-yellow-800",
      Completed: "bg-green-100 text-green-800",
    };
    return colors[execution] || "bg-gray-100 text-gray-800";
  };
  const getLocationColor = (location) => {
    const colors = {
      "In House": "bg-indigo-100 text-indigo-800",
      Site: "bg-orange-100 text-orange-800",
    };
    return colors[location] || "bg-gray-100 text-gray-800";
  };
  const getDeliveryColor = (delivery) => {
    return delivery ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
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

  const getTableHeaders = (location, category) => {
    let headers = [];
    if (location === "inhouse" && category === "wb")
      headers = [
        { key: "Tender", label: "Tender", sortable: true },
        { key: "Division", label: "Division", sortable: true },
        { key: "FileNo", label: "File No", sortable: true },
        { key: "WorkOrder", label: "Work Order", sortable: true },
        { key: "LOINo", label: "LOI NO", sortable: true },
        { key: "LOIDate", label: "LOI Date", sortable: true },
        { key: "PrelimarySurvey", label: "Prelimary Survey", sortable: true },
        { key: "SIRNofTransformer", label: "SIRN of Transformer", sortable: true },
        { key: "FinalSurvey", label: "Final Survey", sortable: true },
        { key: "SRNofDrainoutOil", label: "SRN of Drainout Oil", sortable: true },
        { key: "StageInspection", label: "Stage Inspection", sortable: true },
        { key: "OilStatement", label: "Oil Statement", sortable: true },
        { key: "SIRNofOil", label: "SIRN of Oil", sortable: true },
        { key: "TransfomerTesting", label: "Transfomer Testing", sortable: true },
        { key: "Materialdeliveredon", label: "Material delivered on", sortable: true },
        { key: "SRNofTransformer", label: "SRN of Transformer", sortable: true },
        { key: "Estimate", label: "Estimate", sortable: true },
        { key: "FormalOrderPlaced", label: "Formal Order Placed", sortable: true },
        { key: "OrderReferanceno", label: "Order Referance no", sortable: true },
        { key: "OrderDate", label: "Order Date", sortable: true },
        { key: "Billsubmission", label: "Bill submission", sortable: true },
        { key: "Payment", label: "Payement", sortable: true },
        { key: "NetAmount", label: "Net Amount", sortable: true },
        { key: "SecurityDepositesubmitted", label: "Security Deposite submitted", sortable: true },
        { key: "SecurityDepositeReceived", label: "Security Deposite Received", sortable: true }
      ];
    if (location === "site" && category === "wb")
      headers = [
        { key: "Tender", label: "Tender", sortable: true },
        { key: "Division", label: "Division", sortable: true },
        { key: "FileNo", label: "File No", sortable: true },
        { key: "WorkOrder", label: "Work Order", sortable: true },
        { key: "LOINo", label: "LOI NO", sortable: true },
        { key: "LOIDate", label: "LOI Date", sortable: true },
        { key: "PrelimarySurvey", label: "Prelimary Survey", sortable: true },
        { key: "SIRNofTransformer", label: "SIRN of Transformer", sortable: true },
        { key: "FinalSurvey", label: "Final Survey", sortable: true },
        { key: "SRNofDrainoutOil", label: "SRN of Drainout Oil", sortable: true },
        { key: "StageInspection", label: "Stage Inspection", sortable: true },
        { key: "OilStatement", label: "Oil Statement", sortable: true },
        { key: "SIRNofOil", label: "SIRN of Oil", sortable: true },
        { key: "TransfomerTesting", label: "Transfomer Testing", sortable: true },
        { key: "Materialdeliveredon", label: "Material delivered on", sortable: true },
        { key: "SRNofTransformer", label: "SRN of Transformer", sortable: true },
        { key: "Estimate", label: "Estimate", sortable: true },
        { key: "FormalOrderPlaced", label: "Formal Order Placed", sortable: true },
        { key: "OrderReferanceno", label: "Order Referance no", sortable: true },
        { key: "OrderDate", label: "Order Date", sortable: true },
        { key: "Billsubmission", label: "Bill submission", sortable: true },
        { key: "Payment", label: "Payement", sortable: true },
        { key: "NetAmount", label: "Net Amount", sortable: true },
        { key: "SecurityDepositesubmitted", label: "Security Deposite submitted", sortable: true },
        { key: "SecurityDepositeReceived", label: "Security Deposite Received", sortable: true }
      ];
    if (location === "site" && category === "public")
      headers = [
        { key: "Client", label: "Client", sortable: true },
        { key: "WorkOrder", label: "Work Order", sortable: true },
        { key: "Date", label: "Date", sortable: true },
        { key: "Category", label: "Category", sortable: true },
        { key: "SiteLocation", label: "Site Location", sortable: true },
        { key: "TypeOfJob", label: "Type of Job", sortable: true },


        { key: "FileNo", label: "File No", sortable: true },
        { key: "Make", label: "Make", sortable: true },
        { key: "OilQty", label: "Oil Qty", sortable: true },
        { key: "BillSubmission", label: "Bill Submission", sortable: true },
        { key: "Payment", label: "Payment", sortable: true },
        { key: "Amount", label: "Amount", sortable: true },
        { key: "SecurityDeposited", label: "Security Deposited", sortable: true }
      ];
    if (location === "site" && category === "private")
      headers = [
        { key: "Client", label: "Client", sortable: true },
        { key: "WorkOrder", label: "Work Order", sortable: true },
        { key: "Date", label: "Date", sortable: true },
        { key: "Category", label: "Category", sortable: true },
        { key: "SiteLocation", label: "Site Location", sortable: true },
        { key: "TypeOfJob", label: "Type of Job", sortable: true },


        { key: "FileNo", label: "File No", sortable: true },
        { key: "Make", label: "Make", sortable: true },
        { key: "OilQty", label: "Oil Qty", sortable: true },
        { key: "BillSubmission", label: "Bill Submission", sortable: true },
        { key: "Payment", label: "Payment", sortable: true },
        { key: "Amount", label: "Amount", sortable: true },
        { key: "SecurityDeposited", label: "Security Deposited", sortable: true }
      ];
    if (location === "inhouse" && category === "public")
      headers = [
        { key: "Client", label: "Client", sortable: true },
        { key: "WorkOrder", label: "Work Order", sortable: true },
        { key: "Date", label: "Date", sortable: true },
        { key: "Category", label: "Category", sortable: true },
        { key: "FileNo", label: "File No", sortable: true },
        { key: "Dismetalling", label: "Dismetalling", sortable: true },
        { key: "Inspection", label: "Inspection", sortable: true },
        { key: "InformToClient", label: "Inform To Client", sortable: true },
        { key: "Approval", label: "Approval", sortable: true },
        { key: "Winding", label: "Winding", sortable: true },
        { key: "Assembly", label: "Assembly", sortable: true },
        { key: "HeatChamber", label: "Heat Chamber", sortable: true },
        { key: "Testing", label: "Testing", sortable: true },
        { key: "ClientInspection", label: "Client Inspection", sortable: true },
        { key: "Delivery", label: "Delivery", sortable: true },
        { key: "BillSubmission", label: "Bill Submission", sortable: true },
        { key: "Payment", label: "Payment", sortable: true },
        { key: "Amount", label: "Amount", sortable: true },
        { key: "SecurityDeposited", label: "Security Deposited", sortable: true }
      ];
    if (location === "inhouse" && category === "private")
      headers = [
        { key: "Client", label: "Client", sortable: true },
        { key: "WorkOrder", label: "Work Order", sortable: true },
        { key: "Date", label: "Date", sortable: true },
        { key: "Category", label: "Category", sortable: true },
        { key: "FileNo", label: "File No", sortable: true },
        { key: "Dismetalling", label: "Dismetalling", sortable: true },
        { key: "Inspection", label: "Inspection", sortable: true },
        { key: "InformToClient", label: "Inform To Client", sortable: true },
        { key: "Approval", label: "Approval", sortable: true },
        { key: "Winding", label: "Winding", sortable: true },
        { key: "Assembly", label: "Assembly", sortable: true },
        { key: "HeatChamber", label: "Heat Chamber", sortable: true },
        { key: "Testing", label: "Testing", sortable: true },
        { key: "ClientInspection", label: "Client Inspection", sortable: true },
        { key: "Delivery", label: "Delivery", sortable: true },
        { key: "BillSubmission", label: "Bill Submission", sortable: true },
        { key: "Payment", label: "Payment", sortable: true },
        { key: "Amount", label: "Amount", sortable: true },
        { key: "SecurityDeposited", label: "Security Deposited", sortable: true }
      ];
    // Always add actions at the end
    headers.push({ key: "actions", label: "Actions", sortable: false });
    return headers;
  };
  const getTableRowValues = (record, location, category) => {
    if (location === "inhouse" && category === "wb") {
      return {
        Tender: record.Tender,
        Division: record.Division,
        FileNo: record.FileNo,
        WorkOrder: record.WorkOrder,
        LOINo: record.LOINo,
        LOIDate: record.LOIDate,
        PrelimarySurvey: record.PrelimarySurvey,
        SIRNofTransformer: record.SIRNofTransformer,
        FinalSurvey: record.FinalSurvey,
        SRNofDrainoutOil: record.SRNofDrainoutOil,
        StageInspection: record.StageInspection,
        OilStatement: record.OilStatement,
        SIRNofOil: record.SIRNofOil,
        TransfomerTesting: record.TransfomerTesting,
        Materialdeliveredon: record.Materialdeliveredon,
        SRNofTransformer: record.SRNofTransformer,
        Estimate: record.Estimate,
        FormalOrderPlaced: record.FormalOrderPlaced,
        OrderReferanceno: record.OrderReferanceno,
        OrderDate: record.OrderDate,
        Billsubmission: record.Billsubmission,
        Payment: record.Payment,
        NetAmount: record.NetAmount,
        SecurityDepositesubmitted: record.SecurityDepositesubmitted,
        SecurityDepositeReceived: record.SecurityDepositeReceived,
      };
    }
    if (location === "site" && category === "wb") {
      return {
        Tender: record.Tender,
        Division: record.Division,
        FileNo: record.FileNo,
        WorkOrder: record.WorkOrder,
        LOINo: record.LOINo,
        LOIDate: record.LOIDate,
        PrelimarySurvey: record.PrelimarySurvey,
        SIRNofTransformer: record.SIRNofTransformer,
        FinalSurvey: record.FinalSurvey,
        SRNofDrainoutOil: record.SRNofDrainoutOil,
        StageInspection: record.StageInspection,
        OilStatement: record.OilStatement,
        SIRNofOil: record.SIRNofOil,
        TransfomerTesting: record.TransfomerTesting,
        Materialdeliveredon: record.Materialdeliveredon,
        SRNofTransformer: record.SRNofTransformer,
        Estimate: record.Estimate,
        FormalOrderPlaced: record.FormalOrderPlaced,
        OrderReferanceno: record.OrderReferanceno,
        OrderDate: record.OrderDate,
        Billsubmission: record.Billsubmission,
        Payment: record.Payment,
        NetAmount: record.NetAmount,
        SecurityDepositesubmitted: record.SecurityDepositesubmitted,
        SecurityDepositeReceived: record.SecurityDepositeReceived,
      };
    }
    if (location === "site" && category === "public") {
      return {
        Client: record.Client,
        WorkOrder: record.WorkOrder,
        Date: record.Date,
        Category: record.Category,
        SiteLocation: record.SiteLocation,
        TypeOfJob: record.TypeOfJob,
        FileNo: record.FileNo,
        Make: record.Make,
        OilQty: record.OilQty,
        BillSubmission: record.BillSubmission,
        Payment: record.Payment,
        Amount: record.Amount,
        SecurityDeposited: record.SecurityDeposited,
      };
    }
    if (location === "site" && category === "private") {
      return {
        Client: record.Client,
        WorkOrder: record.WorkOrder,
        Date: record.Date,
        Category: record.Category,
        SiteLocation: record.SiteLocation,
        TypeOfJob: record.TypeOfJob,
        FileNo: record.FileNo,
        Make: record.Make,
        OilQty: record.OilQty,
        BillSubmission: record.BillSubmission,
        Payment: record.Payment,
        Amount: record.Amount,
        SecurityDeposited: record.SecurityDeposited,
      };
    }
    if (location === "inhouse" && category === "public") {
      return {
        Client: record.Client,
        WorkOrder: record.WorkOrder,
        Date: record.Date,
        Category: record.Category,
        FileNo: record.FileNo,
        Dismetalling: record.Dismetalling,
        Inspection: record.Inspection,
        InformToClient: record.InformToClient,
        Approval: record.Approval,
        Winding: record.Winding,
        Assembly: record.Assembly,
        HeatChamber: record.HeatChamber,
        Testing: record.Testing,
        ClientInspection: record.ClientInspection,
        Delivery: record.Delivery,
        BillSubmission: record.BillSubmission,
        Payment: record.Payment,
        Amount: record.Amount,
        SecurityDeposited: record.SecurityDeposited,
      };
    }
    if (location === "inhouse" && category === "private") {
      return {
        Client: record.Client,
        WorkOrder: record.WorkOrder,
        Date: record.Date,
        Category: record.Category,
        FileNo: record.FileNo,
        Dismetalling: record.Dismetalling,
        Inspection: record.Inspection,
        InformToClient: record.InformToClient,
        Approval: record.Approval,
        Winding: record.Winding,
        Assembly: record.Assembly,
        HeatChamber: record.HeatChamber,
        Testing: record.Testing,
        ClientInspection: record.ClientInspection,
        Delivery: record.Delivery,
        BillSubmission: record.BillSubmission,
        Payment: record.Payment,
        Amount: record.Amount,
        SecurityDeposited: record.SecurityDeposited,
      };
    }
    // fallback for unknown case
    return record;
  };
const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };
  
  const headers = getTableHeaders(location, category);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingRecord) {
      try {
        console.log(editingRecord.id);
        console.log(editingRecord.createdAt);
        console.log(new Date().toISOString());

      } catch (error) {
        console.log("cannot update");
      }
    } else {
      try {

        console.log(formData);
      } catch (error) {
        console.log("cannot add");
      }
    }
  };

  const resetForm = (location = "", category = "") => {
    if (location && category) {
      const key = `${location}-${category}`;
      if (formTemplates[key]) {
        setFormData({ location, category, ...formTemplates[key] });
      } else {
        setFormData({ location, category });
      }
    } else {
      // No location/category chosen → completely blank
      setFormData({
        location: "",
        category: "",
      });
    }

    setIsFormOpen(false);
    setEditingRecord(null);
  };

  const handleView = (data) => {
    setViewingRecord(data);
    setIsDetailOpen(true);
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
                  Operations
                </h1>
                <p className="text-blue-100">
                  Automated Record entry in accordance with Real Time Jobs
                </p>
              </div>
            </div>
            <div className="flex space-x-3">



              <div className="flex flex-col space-y-6 w-full items-center">
                {/* First Group: In House / Site */}
                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                  <button
                    onClick={() => setLocation("inhouse")}
                    className={`${location === "inhouse"
                      ? "bg-white text-blue-600"
                      : "bg-[rgba(255,255,255,0.6)] text-black"
                      } hover:bg-white hover:text-blue-600 w-full px-6 py-4 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center space-x-2 shadow-lg`}
                  >
                    <Home className="w-5 h-5" />
                    <span>In House</span>
                  </button>
                  <button
                    onClick={() => setLocation("site")}
                    className={`${location === "site"
                      ? "bg-white text-blue-600"
                      : "bg-[rgba(255,255,255,0.6)] text-black"
                      } hover:bg-white hover:text-blue-600 w-full px-6 py-4 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center space-x-2 shadow-lg`}
                  >
                    <MapPin className="w-5 h-5" />
                    <span>Site</span>
                  </button>
                </div>

                {/* Second Group: WB / Private / Public */}
                <div className="grid grid-cols-3 gap-4 w-full max-w-xl">
                  <button
                    onClick={() => setCategory("wb")}
                    className={`${category === "wb"
                      ? "bg-white text-blue-600"
                      : "bg-[rgba(255,255,255,0.6)] text-black"
                      } hover:bg-white hover:text-blue-600 w-full px-6 py-4 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center space-x-2 shadow-lg`}
                  >
                    <Briefcase className="w-5 h-5" />
                    <span>WB</span>
                  </button>
                  <button
                    onClick={() => setCategory("private")}
                    className={`${category === "private"
                      ? "bg-white text-blue-600"
                      : "bg-[rgba(255,255,255,0.6)] text-black"
                      } hover:bg-white hover:text-blue-600 w-full px-6 py-4 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center space-x-2 shadow-lg`}
                  >
                    <Lock className="w-5 h-5" />
                    <span>Private</span>
                  </button>
                  <button
                    onClick={() => setCategory("public")}
                    className={`${category === "public"
                      ? "bg-white text-blue-600"
                      : "bg-[rgba(255,255,255,0.6)] text-black"
                      } hover:bg-white hover:text-blue-600 w-full px-6 py-4 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center space-x-2 shadow-lg`}
                  >
                    <Globe className="w-5 h-5" />
                    <span>Public</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar, export, add new record*/}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search Input */}
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/90 backdrop-blur-sm border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 max-w-md">
            <button
              onClick={exportToJSON}
              className="bg-white/90 hover:bg-white text-blue-600 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 shadow-lg"
            >
              <Download className="w-5 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-white/90 hover:bg-white text-blue-600 px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Add Operation Record</span>
            </button>
          </div>
        </div>

      </main>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">

        {/* Operations Records Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
          <div className="bg-blue-600 text-white p-4 font-semibold text-lg">
            Operations Records ({data.length})
          </div>

          {filteredAndSortedRecords.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm
                  ? "No records match your search."
                  : "No records found. Add your operations record!"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {headers.map((header) => (
                      <th
                        key={header.key}
                        className="px-6 py-4 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                        onClick={header.sortable ? () => handleSort(header.key) : undefined}
                      >
                        <div className="flex items-center space-x-1">
                          <span>{header.label}</span>
                          {header.sortable && getSortIcon(header.key)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAndSortedRecords.map((record, index) => {
                    const rowValues = getTableRowValues(record, location, category);

                    return (
                      <tr key={record.id || index} className="hover:bg-gray-50 transition-colors duration-200">
                        {headers.map((header) => {
                          if (header.key === "actions") {
                            return (
                              <td key={header.key} className="px-6 py-4">
                                <div className="flex space-x-2">
                                  <button onClick={() => handleView(record)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleEdit(record)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDelete(record.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            );
                          }

                          return (
                            <td key={header.key} className="px-6 py-4">
                              <div className="text-sm text-gray-800">
                                {rowValues[header.key] || "N/A"}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>


              </table>
            </div>
          )}
        </div>

        {/* Form Modal */}{" "}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-blue-600 text-white p-4 rounded-t-xl">
                <h2 className="text-xl font-semibold">
                  {editingRecord ? "Edit Job Record" : "Add New Job Record"}
                </h2>
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
                        Category
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Category</option>
                        <option value="WB">WB</option>
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
                          Wind
                        </label>
                        <select
                          name="wind"
                          value={formData.wind}
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
                          Assemble
                        </label>
                        <select
                          name="assemble"
                          value={formData.assemble}
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
            <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-blue-600 text-white p-4 rounded-t-xl flex items-center justify-between">
                <h2 className="text-xl font-semibold">Job Record Details</h2>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="text-white hover:bg-blue-700 p-1 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Record Title */}


                {/* All Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(viewingRecord).map(([key, value]) => {
                    // Handle array of objects (like fieldJobDetails, TransformerDetails)
                    if (Array.isArray(value)) {
                      return (
                        <div key={key} className="col-span-3">
                          <h4 className="text-lg font-semibold text-gray-800 mb-2">
                            {key}
                          </h4>
                          {value.length > 0 ? (
                            value.map((item, idx) => (
                              <div
                                key={idx}
                                className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-3 border border-gray-200 rounded-lg"
                              >
                                {Object.entries(item).map(([subKey, subValue]) => (
                                  <div key={subKey}>
                                    <label className="block text-sm font-medium text-gray-500">
                                      {subKey}
                                    </label>
                                    <p className="text-lg font-semibold text-gray-800">
                                      {subValue || "N/A"}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-600 italic">No {key} data</p>
                          )}
                        </div>
                      );
                    }

                    // Handle normal fields
                    return (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-500">
                          {key}
                        </label>
                        <p className="text-lg font-semibold text-gray-800">
                          {value ? value.toString() : "N/A"}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-6">
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


        {/* temp*/}
        <div className="border p-4 rounded-xl bg-white shadow-lg">
          <h2 className="font-bold mb-2 text-lg">
            Showing Data for: {location} - {category}
          </h2>
          <pre className="text-sm overflow-x-auto bg-gray-50 p-3 rounded">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>

      </div>
    </div>
  );
}

export default Operations;
