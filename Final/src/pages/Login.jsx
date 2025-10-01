// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.png";

const Login = () => {
  const [role, setRole] = useState("staff");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (role === "admin") {
      try {
        const res = await axios.post(
          "http://192.168.0.112:5050/api/login",
          {
            role,
            password
          },
          { withCredentials: true }
        );
        if (res.data.success) {
          localStorage.setItem("userRole", role);
          navigate("/dashboard");
        } else {
          alert("Incorrect password");
        }
      } catch (err) {
        console.error("Login error", err.response?.data || err.message);
        alert("Login failed: Incorrect Password");
      }
    } else {
      localStorage.setItem("userRole", role);
      navigate("/dashboard");
    }
  };

  const closesystem = () => {
    localStorage.removeItem("userRole");
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      {/* Main Content */}
      <main className="min-h-screen flex items-center justify-center bg-blue-100 px-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-10 shadow-xl border border-white/30 max-w-md w-full text-center space-y-8">
          {/* Logo Section */}
          <div>
            <div className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
              <img
                className="w-full h-full object-contain"
                src={logo}
                alt="company logo"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">MBS</h2>
            <p className="text-gray-600 text-sm">Enterprise Solutions</p>
          </div>

          {/* Login Form */}
          <div className="space-y-5">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 border mb-4"
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
            {role === "admin" && (
              <input
                type="password"
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border mb-4"
              />
            )}
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
            >
              Login
            </button>
            {localStorage.getItem("userRole") === "admin" && (
              <button
                onClick={closesystem}
                className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition duration-200"
              >
                Logout!
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
