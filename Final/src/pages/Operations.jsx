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

  // Tracks which fields are in date mode
  const [dateMode, setDateMode] = useState({});

  // Function to toggle text/date mode
  const toggleDateMode = (key) => {
    setDateMode(prev => ({ ...prev, [key]: !prev[key] }));
  };

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
      "Location": "Inhouse",
      "Category": "WB",
      "LOINo": "",
      "LOIDate": "",
      "Division": "",
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
      "Location": "Site",
      "Category": "WB",
      "LOINo": "",
      "LOIDate": "",
      "Division": "",
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
      "Location": "Inhouse",
      "Category": "Private",
      "Client": "",
      "WorkOrder": "",
      "Date": "",
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
      "BillSubmission": "",
      "Payment": "",
      "Amount": "",
      "SecurityDeposited": ""
    },
    "inhouse-public": {
      "Location": "Inhouse",
      "Category": "Public",
      "Client": "",
      "WorkOrder": "",
      "Date": "",
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
      "BillSubmission": "",
      "Payment": "",
      "Amount": "",
      "SecurityDeposited": ""
    },
    "site-private": {
      "Location": "Site",
      "Category": "Private",
      "Client": "",
      "WorkOrder": "",
      "Date": "",
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
      "BillSubmission": "",
      "Payment": "",
      "Amount": "",
      "SecurityDeposited": ""
    },
    "site-public": {
      "Location": "Site",
      "Category": "Public",
      "Client": "",
      "WorkOrder": "",
      "Date": "",
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
      "BillSubmission": "",
      "Payment": "",
      "Amount": "",
      "SecurityDeposited": ""
    },
  };
  const [formData, setFormData] = useState(formTemplates["inhouse-wb"]);
  // When location or category changes, reset formData based on template
  useEffect(() => {
    if (location && category) {
      const key = `${location}-${category}`;
      if (formTemplates[key]) {
        setFormData(formTemplates[key]);
        console.log(location, category, formData);
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
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "Operations"+location+category+".json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleDelete = async (ID) => {
    try {
      const url = getApiUrl(); // pick API based on location + category
      if (!url) {
        console.error("Invalid location/category combination.");
        return;
      }
      await axios.delete(
        `${url}/${ID}`,
        {
          headers: { "x-user-role": localStorage.getItem("userRole") },
        }
      );
      fetchData();
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
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
  const handleFieldJobDetailChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.TransformerDetails];
      updated[index][field] = value;
      return { ...prev, TransformerDetails: updated };
    });
  };

  const removeFieldJobDetail = (index) => {
    setFormData((prev) => {
      if (prev.TransformerDetails.length === 1) return prev; // Don't remove if only one left
      const updated = prev.TransformerDetails.filter((_, i) => i !== index);
      return { ...prev, TransformerDetails: updated };
    });
  };
  const addFieldJobDetail = () => {
    setFormData((prev) => ({
      ...prev,
      TransformerDetails: [
        ...prev.TransformerDetails,
        { kva: "", srNo: "", rating: "", note: "" },
      ],
    }));
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
  const handleEdit = (record) => {
    // build a key like "inhouse-wb", "site-public", etc.
    const templateKey = `${record.location}-${record.category}`.toLowerCase();

    // get the matching template, fallback to empty object if not found
    const template = formTemplates[templateKey] || {};

    // merge template with record (record values take priority)
    const filledData = {
      ...template,
      ...record,
    };

    // if the template has TransformerDetails but record doesn’t, ensure default
    if (template.TransformerDetails && (!record.TransformerDetails || record.TransformerDetails.length === 0)) {
      filledData.TransformerDetails = [
        { KVA: "", SrNo: "", Rating: "", Note: "" }
      ];
    }

    setFormData(filledData);        // put merged data into state
    setEditingRecord(record);       // remember which record is being edited
    setIsFormOpen(true);            // open the modal
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
    try {
      const url = getApiUrl(); // pick API based on location + category
      if (!url) {
        console.error("Invalid location/category combination.");
        return;
      }

      if (editingRecord) {
        // 🔹 UPDATE existing record
        const response = await axios.put(
          `${url}/${editingRecord.ID}`, // update by ID
          {
            ...formData,
            ID: editingRecord.ID,
            createdAt: editingRecord.createdAt,
            updatedAt: new Date().toISOString(),
          },
          {
            headers: { "x-user-role": localStorage.getItem("userRole") },
          }
        );

        if (response.data.success) {
          // Update UI with the edited record
          const updatedRecords = data.map((record) =>
            record.ID === editingRecord.ID ? response.data.item : record
          );
          setData(updatedRecords);
          resetForm();
        } else {
          console.error("Failed to update:", response.data.message);
        }
      } else {
        // 🔹 CREATE new record
        const response = await axios.post(
          url,
          formData,
          {
            headers: { "x-user-role": localStorage.getItem("userRole") },
          }
        );

        if (response.data.success) {
          setData([...data, response.data.item]); // update UI with the added record
          resetForm();
        } else {
          console.error("Failed to add:", response.data.message);
        }
      }
    } catch (error) {
      console.error("API error:", error);
    }
  };




  const resetForm = () => {
    if (location && category) {
      const key = `${location}-${category}`;
      if (formTemplates[key]) {
        setFormData({ ...formTemplates[key] });
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">

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
                      <tr key={record.ID || index} className="hover:bg-gray-50 transition-colors duration-200">
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
                                  <button onClick={() => handleDelete(record.ID)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
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
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-blue-600 text-white p-4 rounded-t-xl flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {editingRecord ? "Edit Operation Record" : "Add New Operation Record"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-white hover:bg-blue-700 p-1 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
  {formData &&
    Object.entries(formData).map(([key, value]) => {
      // --- Special handling for system fields ---
      if (key === "ID") {
        return (
          <div key={key} className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">{key}</label>
            <input
              type="text"
              value={value || ""}
              readOnly
              disabled
              className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-lg text-gray-500 cursor-not-allowed"
            />
          </div>
        );
      }

      if (key === "updatedAt") {
        // Option 1: completely hide
        return null;

        // Option 2: show as read-only (uncomment below if you want to display it)
        /*
        return (
          <div key={key} className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">{key}</label>
            <input
              type="text"
              value={value || ""}
              readOnly
              disabled
              className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-lg text-gray-500 cursor-not-allowed"
            />
          </div>
        );
        */
      }

      // --- Handle array fields ---
      if (Array.isArray(value)) {
        return (
          <div key={key}>
            <h3 className="text-lg font-medium text-gray-800 mb-2">{key}</h3>
            {value.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-center"
              >
                {Object.entries(item).map(([subKey, subValue]) => {
                  const fieldKey = `${subKey}_${index}`;
                  return (
                    <div key={subKey} className="flex flex-col">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {subKey}
                      </label>
                      <div className="flex">
                        <input
                          type={dateMode[fieldKey] ? "date" : "text"}
                          value={subValue || ""}
                          onChange={(e) =>
                            handleFieldJobDetailChange(index, subKey, e.target.value)
                          }
                          placeholder="Enter value"
                          className="w-full px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => toggleDateMode(fieldKey)}
                          className="px-3 bg-gray-200 border border-l-0 rounded-r-lg hover:bg-gray-300"
                        >
                          📅
                        </button>
                      </div>
                    </div>
                  );
                })}

                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    type="button"
                    onClick={addFieldJobDetail}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    + Add Another Row
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFieldJobDetail(index)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      }

      // --- Handle boolean fields (checkbox) ---
      if (typeof value === "boolean") {
        return (
          <div key={key} className="flex items-center">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) =>
                setFormData({ ...formData, [key]: e.target.checked })
              }
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <label className="ml-2 text-sm font-medium text-gray-700">{key}</label>
          </div>
        );
      }

      // --- Handle string/number/date fields ---
      return (
        <div key={key} className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-1">{key}</label>
          <div className="flex">
            <input
              type={dateMode[key] ? "date" : "text"}
              value={value || ""}
              onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
              placeholder="Enter value"
              className="w-full px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => toggleDateMode(key)}
              className="px-3 bg-gray-200 border border-l-0 rounded-r-lg hover:bg-gray-300"
            >
              📅
            </button>
          </div>
        </div>
      );
    })}

  {/* --- Footer buttons --- */}
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
                <h2 className="text-xl font-semibold">Operation Record Details</h2>
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
        {/* 
        <div className="border p-4 rounded-xl bg-white shadow-lg">
          <h2 className="font-bold mb-2 text-lg">
            Showing Data for: {location} - {category}
          </h2>
          <pre className="text-sm overflow-x-auto bg-gray-50 p-3 rounded">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>*/}

      </div>
    </div>
  );
}

export default Operations;
