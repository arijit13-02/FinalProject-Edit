// src/pages/Staff.jsx
import React, { useState, useEffect } from "react"; // <-- import useState and useEffect
import { useNavigate } from "react-router-dom";

function Vendors() {
  const navigate = useNavigate();
  const [pending, setPending] = useState([]);

  // Check role on component mount
  useEffect(() => {
    const role = localStorage.getItem("userRole"); // assuming role is stored in localStorage
    if (role === "staff") {
      alert("Access denied. Only admin can view this page.");
      navigate("/login"); // redirect to login
    } else {
      fetchPendingChanges();
    }
  }, []);

  const fetchPendingChanges = async () => {
    try {
      // fetch your data here if needed
    } catch (err) {
      console.error(err);
    }
  };

  return <div>Vendors Page</div>;
}

export default Vendors;


