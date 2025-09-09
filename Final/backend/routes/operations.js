import express from "express";
import fs from "fs";
import path from "path";
import {
    fileURLToPath
} from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const OPERATIONS_inWB_FILE = path.join(__dirname, '../data/OperationsInHouseWB.json');
const OPERATIONS_siteWB_FILE = path.join(__dirname, '../data/OperationsSiteWB.json');
const OPERATIONS_inpvt_FILE = path.join(__dirname, '../data/OperationsInHousePrivate.json');
const OPERATIONS_inpub_FILE = path.join(__dirname, '../data/OperationsInHousePublic.json');
const OPERATIONS_sitepub_FILE = path.join(__dirname, '../data/OperationsSitePublic.json');
const OPERATIONS_sitepvt_FILE = path.join(__dirname, '../data/OperationsSitePrivate.json');


// Utility functions
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf-8"));
const writeJson = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");




// Initialize files
for (const file of [OPERATIONS_inWB_FILE,OPERATIONS_siteWB_FILE, OPERATIONS_inpub_FILE, OPERATIONS_inpvt_FILE,OPERATIONS_sitepub_FILE, OPERATIONS_sitepvt_FILE ]) {
    if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify([]));
}

//inhousewb
//inhousepub
//inhousepvt
//
//sitewb
//sitepvt
//sitepub


// GET based on type
router.get("/inhousewb", (req, res) => {
    try {
        const data = readJson(OPERATIONS_inWB_FILE);
        res.json(data);
    } catch (err) {
        console.error("GET Operations error:", err);
        res.status(500).json({
            message: "Failed to read Operations"
        });
    }
});
router.get("/inhousepub", (req, res) => {
    try {
        const data = readJson(OPERATIONS_inpub_FILE);
        res.json(data);
    } catch (err) {
        console.error("GET Operations error:", err);
        res.status(500).json({
            message: "Failed to read Operations"
        });
    }
});
router.get("/inhousepvt", (req, res) => {
    try {
        const data = readJson(OPERATIONS_inpvt_FILE);
        res.json(data);
    } catch (err) {
        console.error("GET Operations error:", err);
        res.status(500).json({
            message: "Failed to read Operations"
        });
    }
});
router.get("/sitewb", (req, res) => {
    try {
        const data = readJson(OPERATIONS_siteWB_FILE);
        res.json(data);
    } catch (err) {
        console.error("GET Operations error:", err);
        res.status(500).json({
            message: "Failed to read Operations"
        });
    }
});
router.get("/sitepvt", (req, res) => {
    try {
        const data = readJson(OPERATIONS_sitepvt_FILE);
        res.json(data);
    } catch (err) {
        console.error("GET Operations error:", err);
        res.status(500).json({
            message: "Failed to read Operations"
        });
    }
});
router.get("/sitepub", (req, res) => {
    try {
        const data = readJson(OPERATIONS_sitepub_FILE);
        res.json(data);
    } catch (err) {
        console.error("GET Operations error:", err);
        res.status(500).json({
            message: "Failed to read Operations"
        });
    }
});
export default router;