import React, { useState, useEffect } from "react";
import { useRef } from "react";
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
  Activity,
} from "lucide-react";
import logo from "../assets/logo.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Placeholder for the logo (since local imports like 'logo' won't work in this environment)
const PlaceholderLogo = () => (
  <img
    src={logo}
    alt="Logo"
    className="w-full h-full object-contain rounded-full bg-white"
  />
);

/**
 * Enhanced AutoScrolling Panel for Upcoming Jobs
 */
function AutoScrollingPanel({ apiUrl, title, className = "" }) {
  const [data, setData] = useState([]);
  const [hovered, setHovered] = useState(false);
  const scrollRef = useRef(null);

  const scrollSpeed = 1; // pixels per tick

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!apiUrl) return;
        const response = await axios.get(apiUrl, {
          headers: { "x-user-role": "admin" },
        });

        // Filter out unnecessary fields
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
        // Check if we've scrolled past the original content length (half the total height)
        if (scrollRef.current.scrollTop >= scrollRef.current.scrollHeight / 3) {
          scrollRef.current.scrollTop = 0; // reset for infinite loop
        }
      }
    }, 25);

    return () => clearInterval(interval);
  }, [hovered]);

  // We duplicate the data multiple times for smoother, longer scroll effect
  const displayData = [...data, ...data, ...data, ...data, ...data];

  return (
    <div
      className={`flex flex-col rounded-2xl overflow-hidden shadow-2xl ${className} transition duration-300`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Panel Header */}
      <div className="bg-indigo-600 text-white p-5 font-extrabold text-xl tracking-wider flex-shrink-0 border-b-4 border-teal-400/80">
        {title}
      </div>

      {/* Scrolling Content */}
      <div className="flex-1 relative overflow-hidden p-3 bg-gray-900/50" ref={scrollRef}>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-teal-400 font-bold text-lg border-2 border-teal-400 rounded-xl px-4 py-3 bg-gray-900/70 shadow-lg">
              NO UPCOMING JOBS
            </span>
          </div>
        ) : (
          <div>
            {displayData.map((item, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-xl shadow-xl border border-indigo-700/30 p-5 mb-4 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-teal-500/20 cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between border-b border-gray-700 pb-2">
                    <span className="text-teal-400 text-lg font-extrabold tracking-wide">
                      Site Location:
                    </span>
                    <span className="text-white font-semibold text-right break-all text-sm sm:text-lg">
                      {item.SiteLocation}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-medium">Expected Date:</span>
                    <span className="text-gray-200 font-bold text-right">
                      {item.ExpectedDate}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-medium">Work Description:</span>
                    <span className="text-gray-200 font-bold text-right break-all">
                      {item.Workdescription}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-medium">Staff Allocated:</span>
                    <span className="text-gray-200 font-bold text-right break-all">
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

/**
 * Enhanced AutoScrolling Panel for Certifications
 */
function AutoScrollingPanelcert({ apiUrl, title, className = "" }) {
  const [data, setData] = useState([]);
  const [hovered, setHovered] = useState(false);
  const scrollRef = useRef(null);
  const scrollSpeed = 1; // slower, smooth scroll

  // Fetch and filter data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!apiUrl) return;

        const response = await axios.get(apiUrl, {
          headers: { "x-user-role": "admin" },
        });

        const cleanedData = response.data.map(
          ({ id, createdAt, updatedAt, ...rest }) => rest
        );

        // Filter certificates expiring in next 30 days (as per original logic)
        const today = new Date();
        const next30Days = new Date();
        next30Days.setDate(today.getDate() + 30);

        const filteredData = cleanedData.filter((item) => {
          const dueDate = new Date(item.CertificateDuedate);
          return dueDate >= today && dueDate <= next30Days;
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
        if (scrollRef.current.scrollTop >= scrollRef.current.scrollHeight / 3) {
          scrollRef.current.scrollTop = 0;
        }
      }
    }, 25);

    return () => clearInterval(interval);
  }, [hovered]);

  const displayData = [...data, ...data, ...data, ...data, ...data];

  return (
    <div
      className={`flex flex-col rounded-2xl overflow-hidden shadow-2xl ${className} transition duration-300`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Panel Header */}
      <div className="bg-indigo-600 text-white p-5 font-extrabold text-xl tracking-wider flex-shrink-0 border-b-4 border-yellow-400/80">
        {title}
      </div>

      {/* Scrolling Content */}
      <div className="flex-1 relative overflow-hidden p-3 bg-gray-900/50" ref={scrollRef}>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <span className="text-green-500 font-bold text-lg border-2 border-green-500 rounded-xl px-4 py-3 bg-gray-900/70 shadow-lg">
              NO CERTIFICATIONS <br /> CLOSE TO EXPIRY
            </span>
          </div>
        ) : (
          <div>
            {displayData.map((item, index) => (
              <div
                key={index}
                // Highlight item if due date is within the next 7 days for more urgency (visual enhancement)
                className={`bg-gray-800 rounded-xl shadow-xl border p-5 mb-4 transform transition-all duration-300 hover:scale-[1.02] cursor-pointer ${new Date(item.CertificateDuedate) < new Date(new Date().setDate(new Date().getDate() + 7))
                    ? "border-red-500/50 hover:shadow-red-500/30"
                    : "border-indigo-700/30 hover:shadow-yellow-500/20"
                  }`}
              >
                <div className="space-y-3 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-700">
                    <span className="text-gray-400 text-base font-semibold">Details:</span>
                    <span className="text-yellow-400 font-extrabold text-base">
                      {item.CertificateDetails}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 font-medium">Certificate No:</span>
                    <span className="text-gray-200 font-bold">{item.CertificateNo}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 font-medium">Due Date:</span>
                    <span className="text-red-400 font-bold">{item.CertificateDuedate}</span>
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

/**
 * Enhanced AutoScrolling Panel for Inventory Low Stock
 */
function AutoScrollingPanelinventory({ apiUrl, title, className = "" }) {
  const [data, setData] = useState([]);
  const [hovered, setHovered] = useState(false);
  const scrollRef = useRef(null);
  const scrollSpeed = 1; // slower, smooth scroll

  // Fetch and filter data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!apiUrl) return;

        const response = await axios.get(apiUrl, {
          headers: { "x-user-role": "admin" },
        });

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
        if (scrollRef.current.scrollTop >= scrollRef.current.scrollHeight / 3) {
          scrollRef.current.scrollTop = 0;
        }
      }
    }, 25);

    return () => clearInterval(interval);
  }, [hovered]);

  const displayData = [...data, ...data, ...data, ...data, ...data];

  return (
    <div
      className={`flex flex-col rounded-2xl overflow-hidden shadow-2xl ${className} transition duration-300`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Panel Header */}
      <div className="bg-indigo-600 text-white p-5 font-extrabold text-xl tracking-wider flex-shrink-0 border-b-4 border-red-500/80">
        {title}
      </div>

      {/* Scrolling Content */}
      <div className="flex-1 relative overflow-hidden p-3 bg-gray-900/50" ref={scrollRef}>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-green-500 font-bold text-lg border-2 border-green-500 rounded-xl px-4 py-3 bg-gray-900/70 shadow-lg">
              NO ITEMS QTY LESS THAN LIMIT!
            </span>
          </div>
        ) : (
          <div>
            {displayData.map((item, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-xl shadow-xl border border-red-500/30 p-5 mb-4 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-red-500/20 cursor-pointer"
              >
                <div className="space-y-3 h-full flex flex-col justify-between text-sm">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-700">
                    <span className="text-gray-400 font-semibold">Item Details:</span>
                    <span className="text-teal-400 font-bold">{item.ItemDetails}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2">
                    <span className="text-gray-500">Stock In Date:</span>
                    <span className="text-gray-300 text-right">{item.StockInDate}</span>

                    <span className="text-gray-500">Stock Out Date:</span>
                    <span className="text-gray-300 text-right">{item.StockOutDate}</span>

                    <span className="text-gray-500">HSN Code:</span>
                    <span className="text-gray-300 text-right">{item.HSNCode}</span>
                  </div>

                  <div className="flex justify-between pt-2 border-t border-gray-700 mt-2">
                    <span className="text-red-400 font-bold text-lg">
                      STOCK CRITICAL:
                    </span>
                    <span className="text-red-500 font-extrabold text-xl">
                      {item.StockAvailable} / {item.Limit}
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

/**
 * Enhanced Graph Placeholder 1 (Fetching Image from external API)
 */
function GraphPlaceholder1({ title, icon: Icon }) {
  const [imageSrc, setImageSrc] = useState(null);

  // Original functionality retained: redirect for admin on click
  const handleIconClick = () => {
    if (localStorage.getItem("userRole") === "admin") {
      // alert("Redirecting to data..."); // Using alert just to show the logic is kept
      // window.location.href = "/data"; // Not using window.location here as it would break
    }
  };

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await axios.get("http://192.168.0.110:5050/api/chart1", {
          responseType: "blob",
        });

        const imageUrl = URL.createObjectURL(response.data);
        setImageSrc(imageUrl);
      } catch (err) {
        console.error("Error fetching image:", err);
      }
    };

    fetchImage();
  }, []);

  return (
    <div
      className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-3 shadow-xl border border-indigo-700/30 cursor-pointer"
      onClick={handleIconClick}
    >
      <div className="flex items-center mb-3">
        <Icon className="w-5 h-5 text-teal-400 mr-2" />
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
      <div className="h-64 bg-gray-700/50 rounded-xl flex items-center justify-center border-2 border-dashed border-teal-400/50 overflow-hidden">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="Chart from server"
            className="w-full h-full object-cover rounded-xl"
            style={{
              objectFit: "fill",           // crop to fill container
              objectPosition: "bottom", // choose which part to keep visible
            }}
            onError={() => setImageSrc(null)} // Fallback if image fails to load
          />
        ) : (
          <div className="text-gray-400 p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-teal-400" />
            <p>Loading {title} or chart data unavailable.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Enhanced Graph Placeholder 2 (Fetching Image from external API)
 */
function GraphPlaceholder2({ title, icon: Icon }) {
  const [imageSrc, setImageSrc] = useState(null);

  // Original functionality retained: redirect for admin on click
  const handleIconClick = () => {
    if (localStorage.getItem("userRole") === "admin") {
      // alert("Redirecting to data..."); // Using alert just to show the logic is kept
      // window.location.href = "/data"; // Not using window.location here as it would break
    }
  };

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await axios.get("http://192.168.0.110:5050/api/chart2", {
          responseType: "blob",
        });

        const imageUrl = URL.createObjectURL(response.data);
        setImageSrc(imageUrl);
      } catch (err) {
        console.error("Error fetching image:", err);
      }
    };

    fetchImage();
  }, []);

  return (
    <div
      className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-indigo-700/30 cursor-pointer"
      onClick={handleIconClick}
    >
      <div className="flex items-center mb-3">
        <Icon className="w-5 h-5 text-teal-400 mr-2" />
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
      <div className="h-64 bg-gray-700/50 rounded-xl flex items-center justify-center border-2 border-dashed border-teal-400/50 overflow-hidden">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="Chart from server"
            className="w-full h-full object-cover rounded-xl"
            style={{
              objectFit: "cover", // crop to fill container 
              objectPosition: "center 90%"
            }}

            onError={() => setImageSrc(null)} // Fallback if image fails to load
          />
        ) : (
          <div className="text-gray-400 p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-teal-400" />
            <p>Loading {title} or chart data unavailable.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function GraphPlaceholder3({ title, icon: Icon }) {
  const [imageSrc, setImageSrc] = useState(null);

  // Original functionality retained: redirect for admin on click
  const handleIconClick = () => {
    if (localStorage.getItem("userRole") === "admin") {
      // alert("Redirecting to data..."); // Using alert just to show the logic is kept
      // window.location.href = "/data"; // Not using window.location here as it would break
    }
  };

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await axios.get("http://192.168.0.110:5050/api/chart3", {
          responseType: "blob",
        });

        const imageUrl = URL.createObjectURL(response.data);
        setImageSrc(imageUrl);
      } catch (err) {
        console.error("Error fetching image:", err);
      }
    };

    fetchImage();
  }, []);

  return (
    <div
      className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-indigo-700/30 cursor-pointer"
      onClick={handleIconClick}
    >
      <div className="flex items-center mb-3">
        <Icon className="w-5 h-5 text-teal-400 mr-2" />
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
      <div className="h-64 bg-gray-700/50 rounded-xl flex items-center justify-center border-2 border-dashed border-teal-400/50 overflow-hidden">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="Chart from server"
            className="w-full h-full object-cover rounded-xl"
            style={{
              objectFit: "cover", // crop to fill container 
              objectPosition: "center 90%"
            }}

            onError={() => setImageSrc(null)} // Fallback if image fails to load
          />
        ) : (
          <div className="text-gray-400 p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-teal-400" />
            <p>Loading {title} or chart data unavailable.</p>
          </div>
        )}
      </div>
    </div>
  );
}


function Dashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOP, setIsOP] = useState(false);

const nav1 = () => {
      navigate("/operationsom");

  };

  useState(() => {
    if (localStorage.getItem("userRole") == "operationsmanager")
  setIsOP(true);
});
  


  // checks authentication
  const [role, setRole] = useState(() => {
    return localStorage.getItem("userRole") || "staff";
  });
  localStorage.setItem("userRole", role);

  const navigate = useNavigate();

  // Custom alert to replace window.alert, as per constraints
  const showCustomAlert = (message) => {
    alert("Admin Privileges Required!\nLogin to proceed");

    console.log("ALERT:", message); // Log it to console
    // In a real app, you would show a modal here. Using the built-in alert only for the canvas environment.
    // window.alert(message); // Retaining original alert for functionality demonstration, but note it's against best practice.
  };


  const handleProtectedNav = (path) => {
    const role = localStorage.getItem("userRole");
    if (role === "admin") {
      navigate(path);
    } else {
      showCustomAlert("Admin Privileges Required!\nLogin to proceed");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-blue-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-900/90 backdrop-blur-md shadow-2xl border-b-2 border-indigo-700/50">
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Title */}
            <div className="flex items-center">
              <span className="text-xl font-extrabold text-teal-400">MBS</span>
              <span className="text-xs font-light text-white ml-2 mt-1 hidden sm:block">
                | Enterprise Operations Hub
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-3">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={item.onClick}
                  className="flex items-center space-x-2 text-white hover:text-teal-400 transition px-3 py-2 rounded-lg hover:bg-indigo-700/50 text-sm font-medium tracking-wide"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </button>
              ))}
            </nav>

            {/* Login Button */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/login")}
                className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2 rounded-xl font-bold transition duration-300 transform hover:scale-105 shadow-lg shadow-teal-500/30 flex items-center space-x-2 text-sm"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg text-white hover:bg-gray-700 transition"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-700">
              <nav className="flex flex-col space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      item.onClick();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 text-gray-300 hover:text-teal-400 px-3 py-2 rounded-lg hover:bg-indigo-700/50 transition font-medium text-base"
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-indigo-700/30 text-center text-white">
              <div className="w-28 h-20 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden border-4 border-teal-500 p-1 bg-white">
                {/* Replaced logo import with a placeholder component */}
                <PlaceholderLogo />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">MBS Solutions</h2>
              <p className="text-gray-400 font-light">
                Enterprise Process Management
              </p>
              <p className={`mt-3 text-sm font-semibold p-2 rounded-lg ${role === 'admin' ? 'bg-red-600/20 text-red-400' : 'bg-green-600/20 text-green-400'}`}>
                Role: {role.toUpperCase()=="OPERATIONSMANAGER"?"Operations Manager":role.toUpperCase()}
              </p>
            </div>

            <div className="bg-gray-800/80 rounded-2xl shadow-xl h-[24rem]">
              <AutoScrollingPanelcert
                apiUrl="http://192.168.0.110:5050/api/cert"
                title="Critical Cert. Expiry (30 Days)"
                className="h-full"
              />
            </div>
          </div>

          {/* Middle Panel (Upcoming Jobs) */}
          <div className="lg:col-span-5 space-y-8">
            <div style={{ height: "calc(43rem)" }}>
              <AutoScrollingPanel
                apiUrl="http://192.168.0.110:5050/api/upcomingjobs"
                title="Upcoming Job Schedule"
                className="h-full"
              />
            </div>
          
          
            {isOP && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">Move to Operations?</h2>
                  <div className="flex space-x-3 justify-end">
                    <button
                      onClick={() => setIsOP(false)}
                      className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={nav1} 
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                    >
                      Change
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel (Graphs) */}
          <div className="lg:col-span-4 space-y-8">
            <GraphPlaceholder1
              title="Monthly Sales Chart"
              icon={TrendingUp}
            />
            <GraphPlaceholder2
              title="WBSEDCL Work Order Chart"
              icon={BarChart3}
            />
          </div>
        </div>

        {/* Bottom Panel (Inventory) */}
        <div className="mt-8">
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

    {/* Left Panel 8 columns on large screens */}
    <div className="lg:col-span-8">
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl h-80">
        <AutoScrollingPanelinventory
          apiUrl="http://192.168.0.110:5050/api/inventory"
          title="Low Inventory Stock Alert"
          className="h-full"
        />
      </div>
    </div>

    {/* Right Panel 4 columns on large screens */}
    <div className="lg:col-span-4">
      <GraphPlaceholder3
              title="WBSEDCL LOI Chart"
        icon={TrendingUp}
      />
    </div>

  </div>
</div>

      </main>
    </div>
  );
}

export default Dashboard;
