// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Import your page components
import Dashboard from "./pages/Dashboard";
import Operations from "./pages/Operations";
import InventoryPage from "./pages/InventoryPage";
import Vendors from "./pages/Vendors";
import Staff from "./pages/Staff";
import Billing from "./pages/Billing";
import Certifications from "./pages/Certifications";
import UpcomingJobs from "./pages/UpcomingJobs";
import Login from "./pages/Login";
import RealTimeJobs from "./pages/RealTimeJobs";
import PendingChangesRealTimeJobs from "./pages/PendingChangesRealTimeJobs";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/realtimejobs" element={<RealTimeJobs />} />
        <Route path="/operations" element={<Operations />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/certifications" element={<Certifications />} />
        <Route path="/upcoming-jobs" element={<UpcomingJobs />} />
        <Route path="/pendingchangesrealtimejobs" element={<PendingChangesRealTimeJobs />} />
        <Route path="/login" element={<Login />} />
        

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;

