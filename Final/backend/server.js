import express from "express";
import fs from "fs";
import bcrypt from "bcrypt";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import realtimejobsRoutes from "./routes/realtimejobs.js";
import operationsRoutes from "./routes/operations.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5050;

// acting as middleware for open endpoint api protection, so that searching point blank dont give out the data
const requireAdmin = (req, res, next) => {
  const role = req.headers["x-user-role"];
  if (role === "admin") {
    next(); // ✅ allow
  } else {
    res.status(403).json({ message: "Forbidden: Admins only" });
  }
};

const allowedOrigins = [
  "http://localhost:5173",
  "http://192.168.0.112:5173" // LAN access
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("CORS not allowed"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-user-role"],
    credentials: true
  })
);

app.use(bodyParser.json());

const AUTH_FILE = path.join(__dirname, "auth.json");

// Utility
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf-8"));
const writeJson = (file, data) =>
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");

// Initialize files
if (!fs.existsSync(AUTH_FILE)) {
  const defaultHash = bcrypt.hashSync("admin123", 10);
  fs.writeFileSync(
    AUTH_FILE,
    JSON.stringify({ adminPasswordHash: defaultHash })
  );
}

// === AUTH ROUTES ===
app.post("/api/login", async (req, res) => {
  const { role, password } = req.body;
  if (role !== "admin") return res.json({ success: true });

  const authData = readJson(AUTH_FILE);
  const isMatch = await bcrypt.compare(password, authData.adminPasswordHash);
  isMatch
    ? res.json({ success: true })
    : res.status(401).json({ success: false, message: "Incorrect password" });
});

app.post("/api/change-password", requireAdmin, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const authData = readJson(AUTH_FILE);
  const isMatch = await bcrypt.compare(oldPassword, authData.adminPasswordHash);
  if (!isMatch)
    return res.status(401).json({ message: "Old password incorrect" });

  const newHash = await bcrypt.hash(newPassword, 10);
  fs.writeFileSync(AUTH_FILE, JSON.stringify({ adminPasswordHash: newHash }));
  res.json({ message: "Password updated successfully" });
});

app.use("/api/realtimejobs", realtimejobsRoutes);
app.use("/api/operations", requireAdmin, operationsRoutes);
//app.use('/api/operations', operationsRoutes);

// === Health Check ===
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Backend running at http://0.0.0.0:${PORT}`);
});
