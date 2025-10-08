import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const File = path.join(__dirname, '../data/staffData.json');
const uploadDir = path.join(__dirname, "../Staffuploads");

// Ensure folders exist
if (!fs.existsSync(File)) fs.writeFileSync(File, JSON.stringify([]));
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Utility functions
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf-8"));
const writeJson = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");

// GET all staff
router.get("/", (req, res) => {
  try {
    const data = readJson(File);
    res.json(data);
  } catch (err) {
    console.error("GET Staff error:", err);
    res.status(500).json({ message: "Failed to read Staff" });
  }
});

// ADD new staff with file upload
router.post("/", upload.single("attachment"), (req, res) => {
  try {
    const data = readJson(File);
    const newItem = {
      ...req.body,
      id: Date.now().toString(),
      attachment: req.file ? req.file.filename : null
    };

    data.unshift(newItem);
    writeJson(File, data);

    res.json({ success: true, message: "Item added", item: newItem });
  } catch (err) {
    console.error("POST staff error:", err);
    res.status(500).json({ success: false, message: "Failed to add item" });
  }
});

// UPDATE staff with optional file upload
router.put("/:id", upload.single("attachment"), (req, res) => {
  try {
    const data = readJson(File);
    const index = data.findIndex(item => item.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Item not found" });

    const updatedItem = {
      ...data[index],
      ...req.body,
      attachment: req.file ? req.file.filename : data[index].attachment // Keep old file if not updated
    };

    data[index] = updatedItem;
    writeJson(File, data);

    res.json({ success: true, message: "Item updated", item: updatedItem });
  } catch (err) {
    console.error("PUT staff error:", err);
    res.status(500).json({ message: "Failed to update item" });
  }
});

// DELETE staff
router.delete("/:id", (req, res) => {
  try {
    const data = readJson(File);
    const item = data.find(i => i.id === req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Delete associated file if exists
    if (item.attachment) {
      const filePath = path.join(uploadDir, item.attachment);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    const updated = data.filter(i => i.id !== req.params.id);
    writeJson(File, updated);

    res.json({ message: "Item deleted" });
  } catch (err) {
    console.error("DELETE staff error:", err);
    res.status(500).json({ message: "Failed to delete item" });
  }
});

// Serve uploaded files
router.get("/file/:filename", (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).send("File not found");
  res.sendFile(filePath);
});

export default router;
