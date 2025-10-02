import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Map operation types to file paths
const files = {
    inhousewb: path.join(__dirname, "../data/OperationsInHouseWB.json"),
    sitewb: path.join(__dirname, "../data/OperationsSiteWB.json"),
    inhousepvt: path.join(__dirname, "../data/OperationsInHousePrivate.json"),
    inhousepub: path.join(__dirname, "../data/OperationsInHousePublic.json"),
    sitepub: path.join(__dirname, "../data/OperationsSitePublic.json"),
    sitepvt: path.join(__dirname, "../data/OperationsSitePrivate.json"),
};

// Utility functions
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf-8"));
const writeJson = (file, data) =>
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");

// Ensure all files exist
for (const file of Object.values(files)) {
    if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify([]));
}

// Generate routes dynamically
Object.entries(files).forEach(([route, file]) => {
    // GET
    router.get(`/${route}`, (req, res) => {
        try {
            const data = readJson(file);
            res.json(data);
        } catch (err) {
            console.error(`GET ${route} error:`, err);
            res.status(500).json({ message: "Failed to read Operations" });
        }
    });

    // POST
    router.post(`/${route}`, (req, res) => {
        try {
            const data = readJson(file);
            const newItem = { ID: Date.now().toString(), ...req.body };
            data.unshift(newItem);
            writeJson(file, data);

            res.json({ success: true, message: "Item added", item: newItem });
        } catch (err) {
            console.error(`POST ${route} error:`, err);
            res.status(500).json({ success: false, message: "Failed to add item" });
        }
    });

    // PUT
    router.put(`/${route}/:ID`, (req, res) => {
        try {
            const data = readJson(file);
            const index = data.findIndex(item => item.ID === req.params.ID);

            if (index === -1) {
                return res.status(404).json({ message: "Item not found" });
            }

            const updatedItem = {
                ...data[index],
                ...req.body,
                ID: req.params.ID,
                updatedAt: new Date().toISOString(),
            };

            data[index] = updatedItem;
            writeJson(file, data);

            res.json({ success: true, message: "Item updated", item: updatedItem });
        } catch (err) {
            console.error(`PUT ${route} error:`, err);
            res.status(500).json({ message: "Failed to update item" });
        }
    });

    // DELETE
    router.delete(`/${route}/:ID`, (req, res) => {
        try {
            const data = readJson(file);
            const index = data.findIndex(i => i.ID === req.params.ID);

            if (index === -1) {
                return res.status(404).json({ message: "Item not found" });
            }

            const deletedItem = data[index];
            const updated = data.filter(i => i.ID !== req.params.ID);

            writeJson(file, updated);

            res.json({ success: true, message: "Item deleted", item: deletedItem });
        } catch (err) {
            console.error(`DELETE ${route} error:`, err);
            res.status(500).json({ message: "Failed to delete item" });
        }
    });


});

export default router;
