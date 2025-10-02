import express from "express";
import fs from "fs";
import bcrypt from "bcrypt";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import realtimejobsRoutes from "./routes/realtimejobs.js";
import operationsRoutes from "./routes/operations.js";
import upcomingjobsRoutes from "./routes/upcomingjobs.js";
import staffRoutes from "./routes/staff.js";
import certRoutes from "./routes/cert.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5050;

// --- Middleware to protect admin routes ---
const requireAdmin = (req, res, next) => {
  const role = req.headers["x-user-role"];
  if (role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: Admins only" });
  }
};

// --- CORS configuration ---
const allowedOrigins = [
  "http://localhost:5173",
  "http://192.168.0.111:5173" // LAN access
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS not allowed"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-user-role"],
    credentials: true
  })
);

app.use(bodyParser.json());

// --- Auth file setup ---
const AUTH_FILE = path.join(__dirname, "auth.json");

// Utility functions
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf-8"));
const writeJson = (file, data) =>
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");

// Initialize auth file if missing
if (!fs.existsSync(AUTH_FILE)) {
  const defaultHash = bcrypt.hashSync("admin123", 10);
  writeJson(AUTH_FILE, { adminPasswordHash: defaultHash });
}

// === AUTH ROUTES ===

// Login route
app.post("/api/login", async (req, res) => {
  const { role, password } = req.body;
  if (role !== "admin") return res.json({ success: true });

  const authData = readJson(AUTH_FILE);
  const isMatch = await bcrypt.compare(password, authData.adminPasswordHash);
  if (isMatch) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Incorrect password" });
  }
});

// Change password route
app.post("/api/change-password", async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  const authData = readJson(AUTH_FILE);
  const isMatch = await bcrypt.compare(oldPassword, authData.adminPasswordHash);

  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Old password is incorrect" });
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  authData.adminPasswordHash = newHash;
  writeJson(AUTH_FILE, authData);

  res.json({ success: true, message: "Password changed successfully" });
});

// --- API Routes ---
app.use("/api/realtimejobs", realtimejobsRoutes);
app.use("/api/operations", requireAdmin, operationsRoutes);
app.use("/api/upcomingjobs", requireAdmin, upcomingjobsRoutes);
app.use("/api/staff", requireAdmin, staffRoutes);
app.use("/api/cert", requireAdmin, certRoutes);

// --- Health Check ---
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running" });
});

// --- Start Server ---
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Backend running at http://0.0.0.0:${PORT}`);
});
