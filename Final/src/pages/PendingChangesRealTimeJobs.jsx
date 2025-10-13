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

const PendingJobs = () => {
  const [pendingJobs, setPendingJobs] = useState([]);
  const [decisions, setDecisions] = useState({});
  const role = localStorage.getItem("userRole");
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

  useEffect(() => {
    if (role === "admin") fetchPendingJobs();
  }, []);

  const fetchPendingJobs = async () => {
    try {
      const res = await axios.get(
        "http://192.168.0.105:5050/api/realtimejobs/pending"
      );
      setPendingJobs(res.data);
    } catch (err) {
      console.error("Failed to load pending jobs:", err);
    }
  };

  const handleDecision = (id, approved) => {
    setDecisions((prev) => ({ ...prev, [id]: approved }));
  };

  const selectAll = (approved) => {
    const all = {};
    pendingJobs.forEach((change) => {
      all[change.item.id] = approved;
    });
    setDecisions(all);
  };

  const applyChanges = async () => {
    const actions = Object.keys(decisions).map((id) => ({
      id,
      approved: decisions[id]
    }));
    if (actions.length === 0)
      return alert("Please approve/reject at least one job.");

    if (!window.confirm("Apply all selected decisions?")) return;

    try {
      await axios.post(
        "http://192.168.0.105:5050/api/realtimejobs/pending/apply",
        { actions }
      );
      alert("Changes applied successfully.");
      fetchPendingJobs();
      setDecisions({});
    } catch (err) {
      console.error(err);
      alert("Failed to apply changes.");
    }
  };

  const renderDifferences = (item, original) => {
    if (!original) return null;

    const changedFields = Object.keys(item).filter(
      (key) =>
        key !== "id" &&
        JSON.stringify(item[key]) !== JSON.stringify(original[key])
    );

    if (!changedFields.length) return null;

    // Helper: Format values for display
    const formatValue = (val) => {
      if (typeof val === "boolean") return val ? "Yes" : "No";
      if (val === null || val === undefined || val === "") return "N/A";
      return val;
    };

    return (
      <div className="mt-2 text-sm text-gray-700">
        <p className="font-semibold">Changed Fields:</p>
        <ul className="list-disc list-inside space-y-1">
          {changedFields.map((field) => {
            // Handle nested array (like fieldJobDetails)
            if (Array.isArray(item[field]) || Array.isArray(original[field])) {
              const newArray = item[field] || [];
              const origArray = original[field] || [];

              return (
                <li key={field}>
                  <span className="text-gray-500">{field}:</span>
                  <ul className="list-decimal list-inside ml-4">
                    {/* Additions + Modifications */}
                    {newArray.map((obj, idx) => {
                      const origObj = origArray[idx];

                      // New row added
                      if (!origObj) {
                        return (
                          <li key={idx}>
                            <span className="text-green-700 font-medium">
                              Added Row:
                            </span>
                            {Object.keys(obj).map((subField) => (
                              <div key={subField}>
                                <span className="text-gray-500">
                                  {subField}:
                                </span>{" "}
                                <span className="text-green-700 font-medium">
                                  {formatValue(obj[subField])}
                                </span>
                              </div>
                            ))}
                          </li>
                        );
                      }

                      // Existing row — check if there are any differences
                      const subFieldsChanged = Object.keys(obj).filter(
                        (k) =>
                          JSON.stringify(obj[k]) !== JSON.stringify(origObj[k])
                      );

                      if (subFieldsChanged.length === 0) return null;

                      // Show entire row: changed fields highlighted, unchanged in green
                      return (
                        <li key={idx}>
                          <span className="text-blue-600 font-medium">
                            Modified Row:
                          </span>
                          {Object.keys(obj).map((subField) => {
                            const oldVal = formatValue(origObj[subField]);
                            const newVal = formatValue(obj[subField]);

                            if (oldVal !== newVal) {
                              return (
                                <div key={subField}>
                                  <span className="text-gray-500">
                                    {subField}:
                                  </span>{" "}
                                  <span className="line-through text-red-600">
                                    {oldVal}
                                  </span>{" "}
                                  ➡{" "}
                                  <span className="text-green-700 font-medium">
                                    {newVal}
                                  </span>
                                </div>
                              );
                            } else {
                              return (
                                <div key={subField}>
                                  <span className="text-gray-500">
                                    {subField}:
                                  </span>{" "}
                                  <span className="text-green-700 font-medium">
                                    {newVal}
                                  </span>
                                </div>
                              );
                            }
                          })}
                        </li>
                      );
                    })}

                    {/* Deletions */}
                    {origArray.map((origObj, idx) => {
                      const newObj = newArray[idx];
                      if (!newObj) {
                        return (
                          <li key={`removed-${idx}`}>
                            <span className="text-red-600 font-medium">
                              Removed Row:
                            </span>
                            {Object.keys(origObj).map((subField) => (
                              <div key={subField}>
                                <span className="text-gray-500">
                                  {subField}:
                                </span>{" "}
                                <span className="text-red-600 font-medium">
                                  {formatValue(origObj[subField])}
                                </span>
                              </div>
                            ))}
                          </li>
                        );
                      }
                      return null;
                    })}
                  </ul>
                </li>
              );
            } else {
              // Top-level simple fields (like delivery, category, etc.)
              return (
                <li key={field}>
                  <span className="text-gray-500">{field}:</span>{" "}
                  <span className="line-through text-red-600">
                    {formatValue(original[field])}
                  </span>{" "}
                  ➡{" "}
                  <span className="text-green-700 font-medium">
                    {formatValue(item[field])}
                  </span>
                </li>
              );
            }
          })}
        </ul>
      </div>
    );
  };

  const summary = (() => {
    let approved = 0,
      rejected = 0;
    Object.values(decisions).forEach((v) =>
      v === true ? approved++ : v === false ? rejected++ : null
    );
    const total = pendingJobs.length;
    return {
      approved,
      rejected,
      undecided: total - approved - rejected,
      total
    };
  })();

  if (role !== "admin")
    return (
      <div className="p-6 text-center text-red-500 font-semibold">
        Access Denied: Only admins can view this page.
      </div>
    );

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
                  Pending Changes Approval for Real Time Jobs
                </h1>
                <p className="text-blue-100">
                  Admin Approval for changes in RealTimeJobs
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* THE CONTENT*/}
        {pendingJobs.length === 0 ? (
          <div className="bg-white p-6 rounded shadow border flex items-center justify-center text-center">
            <div>
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-base sm:text-lg">
                No Pending Changes!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-white p-4 rounded shadow border flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm sm:text-base">
              <div>
                📝 Total Pending: <strong>{summary.total}</strong>
              </div>
              <div>
                ✅ Approved: <strong>{summary.approved}</strong>
              </div>
              <div>
                ❌ Rejected: <strong>{summary.rejected}</strong>
              </div>
              <div>
                ❓ No Action: <strong>{summary.undecided}</strong>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => selectAll(true)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                ✅ Select All Approve
              </button>
              <button
                onClick={() => selectAll(false)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                ❌ Select All Reject
              </button>
            </div>

            {/* Job List */}
            {pendingJobs.map((change) => (
              <div
                key={change.item.id}
                className="p-4 border rounded bg-gray-50 flex flex-col gap-2"
              >
                <div>
                  <strong className="capitalize">{change.type}</strong> –{" "}
                  {change.item.orderNo || "Unnamed Job"}
                </div>
                {change.type === "edit" &&
                  renderDifferences(change.item, change.original)}
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => handleDecision(change.item.id, true)}
                    className={`px-3 py-1 rounded ${
                      decisions[change.item.id] === true
                        ? "bg-green-600 text-white"
                        : "bg-green-100 text-green-800 hover:bg-green-200"
                    }`}
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => handleDecision(change.item.id, false)}
                    className={`px-3 py-1 rounded ${
                      decisions[change.item.id] === false
                        ? "bg-red-600 text-white"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    }`}
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            ))}

            <div className="mt-4 text-right">
              <button
                onClick={applyChanges}
                className="bg-yellow-600 text-black px-5 py-2 rounded hover:bg-white-700"
              >
                Apply All Decisions
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PendingJobs;
