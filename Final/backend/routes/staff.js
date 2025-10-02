import express from "express";
import fs from "fs";
import path from "path";
import {
	fileURLToPath
} from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const File = path.join(__dirname, '../data/staffData.json');

// Utility functions
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf-8"));
const writeJson = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");

// Initialize files
for (const file of [File ]) {
    if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify([]));
}



// GET based on role
router.get("/", (req, res) => {
    try {
		const data = readJson(File);
		res.json(data);
	} catch (err) {
		console.error("GET Staff error:", err);
		res.status(500).json({
			message: "Failed to read Staff"
		});
	}
});



// ADD new item
router.post("/", (req, res) => {
  try {
    const data = readJson(File);
    const newItem = {
      ...req.body,
      id: Date.now().toString()
    };

    data.unshift(newItem);
    writeJson(File, data);

    res.json({
      success: true,
      message: "Item added",
      item: newItem
    });
  } catch (err) {
    console.error("POST staff error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to add item"
    });
  }
});




// UPDATE item
router.put("/:id", (req, res) => {
    try {
		const data = readJson(File);
		const index = data.findIndex(item => item.id === req.params.id);
		if (index === -1) return res.status(404).json({
			message: "Item not found"
		});

		const updatedItem = {
			...data[index],
			...req.body
		};
		data[index] = updatedItem;
		writeJson(File, data);

		res.json({
			success: true,
			message: "Item updated",
			item: updatedItem
		});
	} catch (err) {
		console.error("PUT  staff error:", err);
		res.status(500).json({
			message: "Failed to update item"
		});
	}
});

// DELETE item
router.delete("/:id", (req, res) => {
    try {
		const data = readJson(File);
		const item = data.find(i => i.id === req.params.id);
		if (!item) return res.status(404).json({
			message: "Item not found"
		});

		const updated = data.filter(i => i.id !== req.params.id);
		writeJson(File, updated);

		res.json({
			message: "Item deleted"
		});
	} catch (err) {
		console.error("DELETE staff error:", err);
		res.status(500).json({
			message: "Failed to delete item"
		});
	}
});



export default router;