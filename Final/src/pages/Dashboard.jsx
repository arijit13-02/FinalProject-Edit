import React, { useState, useEffect } from "react";
import { useRef } from "react";

import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  User,
  Settings,
  CalendarClock,
  Building2,
  Users,
  Boxes,
  FileText,
  BarChart3,
  BadgeCheck,
  TrendingUp,
  PieChart,
  Activity,
} from "lucide-react";
import logo from "../assets/logo.png";
import axios from "axios";


function AutoScrollingPanel({ apiUrl, title, className = "" }) {
  const [data, setData] = useState([]);
  const [hovered, setHovered] = useState(false);
  const scrollRef = useRef(null);

  const scrollSpeed = 0.5; // pixels per tick

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!apiUrl) return;
        const response = await axios.get(apiUrl, {
          headers: { "x-user-role": "admin" },
        });

        const filteredData = response.data.map(
          ({ id, createdAt, updatedAt, ...rest }) => rest
        );
        setData(filteredData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [apiUrl]);

  // Infinite smooth scrolling
  useEffect(() => {
    const interval = setInterval(() => {
      if (!hovered && scrollRef.current) {
        scrollRef.current.scrollTop += scrollSpeed;
        if (scrollRef.current.scrollTop >= scrollRef.current.scrollHeight / 2) {
          scrollRef.current.scrollTop = 0; // reset for infinite loop
        }
      }
    }, 25);

    return () => clearInterval(interval);
  }, [hovered]);

  return (
    <div
      className={`flex flex-col rounded-xl overflow-hidden ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Panel Header */}
      <div className="bg-blue-600 text-white p-4 font-semibold text-lg flex-shrink-0">
        {title}
      </div>

      {/* Scrolling Content */}
      <div className="flex-1 relative overflow-hidden p-2" ref={scrollRef}>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-green-600 font-semibold text-lg border border-white rounded-lg px-4 py-2 bg-white">
              NO UPCOMING JOBS
            </span>
          </div>
        ) : (
          <div>
            {[...data, ...data,...data, ...data,...data, ...data,...data, ...data,...data, ...data, ...data].map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-5 mb-4 transform transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-blue-800 text-lg font-semibold">
                      Site Location:
                    </span>
                    <span className="text-blue-600 font-medium break-all text-right">
                      {item.SiteLocation}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-700 text-sm font-semibold">
                      Expected Date:
                    </span>
                    <span className="text-gray-900 font-medium text-right">
                      {item.ExpectedDate}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-700 text-sm font-semibold">
                      Items Availability:
                    </span>
                    <span className="text-gray-900 font-medium text-right break-all">
                      {item.ItemsAvailability}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-700 text-sm font-semibold">
                      Staff Allocated:
                    </span>
                    <span className="text-gray-900 font-medium text-right break-all">
                      {item.StaffAllocated}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



function AutoScrollingPanelcert({ apiUrl, title, className = "" }) {
  const [data, setData] = useState([]);
  const [hovered, setHovered] = useState(false);
  const scrollRef = useRef(null);
  const itemHeight = 140; // card height
  const scrollSpeed = 0.5; // slower, smooth scroll

  // Fetch and filter data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!apiUrl) return;

        const response = await axios.get(apiUrl, {
          headers: { "x-user-role": "admin" },
        });

        // Remove id, createdAt, updatedAt
        const cleanedData = response.data.map(
          ({ id, createdAt, updatedAt, ...rest }) => rest
        );

        // Filter certificates expiring in next 7 days
        const today = new Date();
        const next7Days = new Date();
        next7Days.setDate(today.getDate() + 30);

        const filteredData = cleanedData.filter((item) => {
          const dueDate = new Date(item.CertificateDuedate);
          return dueDate >= today && dueDate <= next7Days;
        });

        setData(filteredData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [apiUrl]);

  // Infinite smooth scrolling
  useEffect(() => {
    const interval = setInterval(() => {
      if (!hovered && scrollRef.current) {
        scrollRef.current.scrollTop += scrollSpeed;
        if (scrollRef.current.scrollTop >= scrollRef.current.scrollHeight / 2) {
          scrollRef.current.scrollTop = 0;
        }
      }
    }, 25);

    return () => clearInterval(interval);
  }, [hovered]);

  return (
    <div
      className={`flex flex-col rounded-xl overflow-hidden ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Panel Header */}
      <div className="bg-blue-600 text-white p-4 font-semibold text-lg flex-shrink-0">
        {title}
      </div>

      {/* Scrolling Content */}
      {/* Scrolling Content */}
      <div className="flex-1 relative overflow-hidden p-2" ref={scrollRef}>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-green-600 font-semibold text-lg border border-white rounded-lg px-4 py-2 bg-white">
              NO CERTIFICATIONS <br></br>CLOSE TO EXPIRY
            </span>
          </div>
        ) : (
          <div>
            {[...data, ...data,...data, ...data,...data, ...data,...data, ...data,...data, ...data, ...data].map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-5 mb-4 transform transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
                style={{ height: `${itemHeight}px` }}
              >
                <div className="space-y-2 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-1 border-b border-gray-200">
                    <span className="text-gray-700 text-base font-semibold">
                      Details:
                    </span>
                    <span className="text-blue-600 font-semibold">
                      {item.CertificateDetails}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-1 border-b border-gray-200">
                    <span className="text-gray-700 text-sm font-xs">
                      Certificate No:
                    </span>
                    <span className="text-gray-900 font-xs">
                      {item.CertificateNo}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 text-sm font-xs">
                      Due Date:
                    </span>
                    <span className="text-gray-900 font-xs">
                      {item.CertificateDuedate}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

function AutoScrollingPanelinventory({ apiUrl, title, className = "" }) {
  const [data, setData] = useState([]);
  const [hovered, setHovered] = useState(false);
  const scrollRef = useRef(null);

  const itemHeight = 240; // card height
  const scrollSpeed = 1; // slower, smooth scroll

  // Fetch and filter data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!apiUrl) return;

        const response = await axios.get(apiUrl, {
          headers: { "x-user-role": "admin" },
        });

        // Remove id, createdAt, updatedAt
        const cleanedData = response.data.map(
          ({ id, createdAt, updatedAt, ...rest }) => rest
        );

        // Filter items where StockAvailable < Limit
        const filteredData = cleanedData.filter((item) => {
          return Number(item.StockAvailable) < Number(item.Limit);
        });

        setData(filteredData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [apiUrl]);

  // Infinite smooth scrolling
  useEffect(() => {
    const interval = setInterval(() => {
      if (!hovered && scrollRef.current) {
        scrollRef.current.scrollTop += scrollSpeed;
        if (scrollRef.current.scrollTop >= scrollRef.current.scrollHeight / 2) {
          scrollRef.current.scrollTop = 0;
        }
      }
    }, 25);

    return () => clearInterval(interval);
  }, [hovered]);

  return (
    <div
      className={`flex flex-col rounded-xl overflow-hidden ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Panel Header */}
      <div className="bg-blue-600 text-white p-4 font-semibold text-lg flex-shrink-0">
        {title}
      </div>

      {/* Scrolling Content */}
      <div className="flex-1 relative overflow-hidden p-2" ref={scrollRef}>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-green-600 font-semibold text-lg border border-white rounded-lg px-4 py-2 bg-white">
              NO ITEMS QTY LESS THAN LIMIT!
            </span>
          </div>
        ) : (
          <div>
            {[...data, ...data,...data, ...data,...data, ...data,...data, ...data,...data, ...data, ...data].map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-5 mb-4 transform transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
                style={{ height: `${itemHeight}px` }}
              >
                <div className="space-y-2 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-1 border-b border-gray-200">
                    <span className="text-gray-800 text-base font-semibold">Item Details:</span>
                    <span className="text-blue-600 font-medium">{item.ItemDetails}</span>
                  </div>

                  <div className="flex items-center justify-between pb-1 border-b border-gray-200">
                    <span className="text-gray-700 text-sm font-semibold">Stock In Date:</span>
                    <span className="text-gray-900 font-medium">{item.StockInDate}</span>
                  </div>

                  <div className="flex items-center justify-between pb-1 border-b border-gray-200">
                    <span className="text-gray-700 text-sm font-semibold">Stock Out Date:</span>
                    <span className="text-gray-900 font-medium">{item.StockOutDate}</span>
                  </div>

                  <div className="flex items-center justify-between pb-1 border-b border-gray-200">
                    <span className="text-gray-700 text-sm font-semibold">Stock Available:</span>
                    <span className="text-gray-900 font-medium">{item.StockAvailable}</span>
                  </div>

                  <div className="flex items-center justify-between pb-1 border-b border-gray-200">
                    <span className="text-gray-700 text-sm font-semibold">HSN Code:</span>
                    <span className="text-gray-900 font-medium">{item.HSNCode}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 text-sm font-semibold">Limit:</span>
                    <span className="text-gray-900 font-medium">{item.Limit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}


function GraphPlaceholder({ title, icon: Icon }) {
  const handleIconClick = () => {
    if (localStorage.getItem("userRole") === "admin") {
      window.location.href = "/data"; // redirect for admin
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
      {/* Header with clickable icon */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div
          className={`cursor-pointer ${localStorage.getItem("userRole") === "admin" ? "hover:text-blue-800" : ""}`}
          onClick={handleIconClick}
        >
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
      </div>

      {/* Chart placeholder */}
      <div className="h-40 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Icon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Chart visualization</p>
        </div>
      </div>
    </div>
  );
}


function Dashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  //checks authentication
  const [role, setRole] = useState(() => {
    return localStorage.getItem("userRole") || "staff";
  });
  localStorage.setItem("userRole", role);

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
  /*useEffect(() => {
    // Disable right-click - ***and aadd to all the pages***
    document.addEventListener("contextmenu", (e) => e.preventDefault());

    // Disable certain keyboard shortcuts
    const disableShortcuts = (e) => {
      const forbiddenCombos = [
        (e.ctrlKey && e.shiftKey && e.key === "I"), // Ctrl+Shift+I
        (e.ctrlKey && e.shiftKey && e.key === "J"), // Ctrl+Shift+J
        (e.ctrlKey && e.key === "U"),              // Ctrl+U
        (e.key === "F12"),                         // F12
        (e.ctrlKey && e.shiftKey && e.key === "C") // Ctrl+Shift+C
      ];

      if (forbiddenCombos.some(Boolean)) {
        e.preventDefault();
        alert("Developer tools are disabled.");
      }
    };

    document.addEventListener("keydown", disableShortcuts);

    return () => {
      document.removeEventListener("contextmenu", (e) => e.preventDefault());
      document.removeEventListener("keydown", disableShortcuts);
    };
  }, []);*/
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/20 text-center">
              <div className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                <img
                  className="w-full h-full object-contain"
                  src={logo}
                  alt="company logo"
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">MBS</h2>
              <p className="text-gray-600">Enterprise Solutions</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 h-64">
              <AutoScrollingPanelcert
                apiUrl="http://172.20.10.11:5050/api/cert"
                title="Certification Expiry"
                className="h-full"
              />
            </div>

          </div>

          {/* Middle */}
          <div className="lg:col-span-4 space-y-8">
            <div
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20"
              style={{ height: "calc(100vh - 14rem)" }}
            >
              <AutoScrollingPanel
                apiUrl="http://172.20.10.11:5050/api/upcomingjobs"
                title="Upcoming Jobs"
                className="h-full"
              />
            </div>
          </div>


          {/* Right */}
          <div className="lg:col-span-5 space-y-6">
  <GraphPlaceholder title="Revenue Analytics" icon={BarChart3} />
  <GraphPlaceholder title="Market Analysis" icon={BarChart3} />
</div>


        </div>

        {/* Bottom */}
        <div className="mt-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 h-64">
            <AutoScrollingPanelinventory
              apiUrl="http://localhost:5050/api/inventory"
              title="Inventory Stock Limits"
              className="h-full"
            />
          </div>
        </div>

      </main>
    </div>
  );
}

export default Dashboard;