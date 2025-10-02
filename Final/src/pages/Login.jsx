// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.png";

const Login = () => {
  const [role, setRole] = useState("staff");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const [isChangePwdOpen, setIsChangePwdOpen] = useState(false);
const [oldPwd, setOldPwd] = useState("");
const [newPwd, setNewPwd] = useState("");

const changepwd = () => setIsChangePwdOpen(true);

const handleChangePassword = async () => {
  if (!oldPwd || !newPwd) {
    alert("Please fill both fields");
    return;
  }

  try {
    const res = await axios.post(
      "http://192.168.0.112:5050/api/change-password",
      { oldPassword: oldPwd, newPassword: newPwd },
      { withCredentials: true }
    );

    if (res.data.success) {
      alert(res.data.message);
      setOldPwd("");
      setNewPwd("");
      setIsChangePwdOpen(false);
    }
  } catch (err) {
    console.error(err.response?.data || err.message);
    alert(err.response?.data?.message || "Failed to change password");
  }
};


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
                onClick={changepwd}
                className="w-full bg-yellow-600 text-white py-2 rounded-lg font-semibold hover:bg-yellow-700 transition duration-200"
              >
                Change Password
              </button>
            )}
            {localStorage.getItem("userRole") === "admin" && (
              <button
                onClick={closesystem}
                className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition duration-200"
              >
                Logout!
              </button>
            )}
{isChangePwdOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Change Password</h2>

      <input
        type="text"
        placeholder="Old Password"
        value={oldPwd}
        onChange={(e) => setOldPwd(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg"
      />
      <input
        type="text"
        placeholder="New Password"
        value={newPwd}
        onChange={(e) => setNewPwd(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg"
      />

      <div className="flex space-x-3 justify-end">
        <button
          onClick={() => setIsChangePwdOpen(false)}
          className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleChangePassword}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
        >
          Change
        </button>
      </div>
    </div>
  </div>
)}

          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
