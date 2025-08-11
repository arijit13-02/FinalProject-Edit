import express from 'express';
import fs from 'fs';
import bcrypt from 'bcrypt';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import realtimejobsRoutes from './routes/realtimejobs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5050;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));
app.use(bodyParser.json());

const AUTH_FILE = path.join(__dirname, 'auth.json');

// Utility
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf-8"));
const writeJson = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");

// Initialize files
if (!fs.existsSync(AUTH_FILE)) {
  const defaultHash = bcrypt.hashSync('admin123', 10);
  fs.writeFileSync(AUTH_FILE, JSON.stringify({ adminPasswordHash: defaultHash }));
}



// === AUTH ROUTES ===
app.post('/api/login', async (req, res) => {
  const { role, password } = req.body;
  if (role !== 'admin') return res.json({ success: true });

  const authData = readJson(AUTH_FILE);
  const isMatch = await bcrypt.compare(password, authData.adminPasswordHash);
  isMatch ? res.json({ success: true }) : res.status(401).json({ success: false, message: 'Incorrect password' });
});


app.post('/api/change-password', async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const authData = readJson(AUTH_FILE);
  const isMatch = await bcrypt.compare(oldPassword, authData.adminPasswordHash);
  if (!isMatch) return res.status(401).json({ message: 'Old password incorrect' });

  const newHash = await bcrypt.hash(newPassword, 10);
  fs.writeFileSync(AUTH_FILE, JSON.stringify({ adminPasswordHash: newHash }));
  res.json({ message: 'Password updated successfully' });
});

app.use('/api/realtimejobs', realtimejobsRoutes);

// === Health Check ===
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});