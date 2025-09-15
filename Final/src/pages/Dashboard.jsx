import React, { useState, useEffect } from "react";
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

const mockData1 = [
  {
    id: 1,
    title: "Revenue Update",
    value: "$2.4M",
    change: "+12%",
    time: "2 min ago",
  },
  {
    id: 2,
    title: "New Customers",
    value: "1,247",
    change: "+8%",
    time: "5 min ago",
  },
  {
    id: 3,
    title: "System Status",
    value: "Operational",
    change: "99.9%",
    time: "1 min ago",
  },
  {
    id: 4,
    title: "Active Users",
    value: "8,432",
    change: "+15%",
    time: "3 min ago",
  },
  {
    id: 5,
    title: "Server Load",
    value: "64%",
    change: "-5%",
    time: "4 min ago",
  },
  {
    id: 6,
    title: "Sales Target",
    value: "87%",
    change: "+3%",
    time: "6 min ago",
  },
];

const mockData2 = [
  { id: 1, title: "Q4 Performance", value: "94.2%", status: "Excellent" },
  { id: 2, title: "Customer Satisfaction", value: "4.8/5", status: "High" },
  { id: 3, title: "Market Share", value: "23.4%", status: "Growing" },
  { id: 4, title: "Product Launch", value: "On Track", status: "Scheduled" },
  { id: 5, title: "Team Productivity", value: "112%", status: "Excellent" },
  { id: 6, title: "Budget Utilization", value: "78%", status: "Optimal" },
];

const mockData3 = [
  { id: 1, metric: "Daily Active Users", value: "45,678", trend: "up" },
  { id: 2, metric: "Conversion Rate", value: "3.24%", trend: "up" },
  { id: 3, metric: "Bounce Rate", value: "42.1%", trend: "down" },
  { id: 4, metric: "Page Load Time", value: "1.2s", trend: "down" },
  { id: 5, metric: "Customer Retention", value: "89.3%", trend: "up" },
  { id: 6, metric: "Revenue per User", value: "$127", trend: "up" },
];

function AutoScrollingPanel({ data, title, className = "" }) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const itemHeight = 100;
  const totalHeight = data.length * itemHeight;

  useEffect(() => {
    const interval = setInterval(() => {
      setScrollPosition((prev) => (prev + 1 >= totalHeight ? 0 : prev + 1));
    }, 30);
    return () => clearInterval(interval);
  }, [totalHeight]);

  return (
    <div className={`flex flex-col rounded-xl overflow-hidden ${className}`}>
      <div className="bg-blue-600 text-white p-4 font-semibold text-lg flex-shrink-0">
        {title}
      </div>
      <div className="flex-1 relative overflow-hidden">
        <div
          className="absolute w-full transition-transform duration-75 ease-linear"
          style={{ transform: `translateY(-${scrollPosition}px)` }}
        >
          {[...data, ...data].map((item, index) => (
            <div
              key={`${item.id}-${Math.floor(index / data.length)}`}
              className="p-4 border-b border-gray-100 bg-white"
              style={{ height: `${itemHeight}px` }}
            >
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-800">
                  {item.title || item.metric}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-blue-600">
                    {item.value}
                  </span>
                  {item.change && (
                    <span
                      className={`text-sm px-2 py-1 rounded-full ${
                        item.change.startsWith("+")
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.change}
                    </span>
                  )}
                  {item.trend && (
                    <TrendingUp
                      className={`w-4 h-4 ${
                        item.trend === "up"
                          ? "text-green-500"
                          : "text-red-500 rotate-180"
                      }`}
                    />
                  )}
                </div>
                {item.time && (
                  <p className="text-sm text-gray-500">{item.time}</p>
                )}
                {item.status && (
                  <p className="text-sm text-gray-600">{item.status}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GraphPlaceholder({ title, icon: Icon }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
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
              <AutoScrollingPanel
                data={mockData1}
                title="Certification Expiry"
                className="h-full"
              />
            </div>
          </div>

          {/* Middle */}
          <div className="lg:col-span-4 space-y-6">
            <div
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20"
              style={{ height: "calc(100vh - 18rem)" }}
            >
              <AutoScrollingPanel
                data={mockData2}
                title="Upcoming Jobs"
                className="h-full"
              />
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-5 space-y-6">
            <GraphPlaceholder title="Revenue Analytics" icon={BarChart3} />
            <GraphPlaceholder title="Market Analysis" icon={PieChart} />
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 h-64">
            <AutoScrollingPanel
              data={mockData3}
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
