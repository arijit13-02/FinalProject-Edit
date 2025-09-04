/*
for now, in add directly 
for admin
files are added, now just clean and function call
then for staff applu changes

then when delivery is checked, just delete from realtimes file

then all files be generated, in operaitons just display the file thats it
*/
import express from "express";
import fs from "fs";
import path from "path";
import {
	fileURLToPath
} from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADMIN_FILE = path.join(__dirname, '../data/adminrtj.json');
const STAFF_FILE = path.join(__dirname, '../data/staffrtj.json');
const PENDING_FILE = path.join(__dirname, '../data/pendingChangesrtj.json');

const OPERATIONS_WB_FILE = path.join(__dirname, '../data/OperationsWB.json');
const OPERATIONS_inpub_FILE = path.join(__dirname, '../data/OperationsInHousePrivate.json');
const OPERATIONS_inpvt_FILE = path.join(__dirname, '../data/OperationsInHousePublic.json');
const OPERATIONS_sitepub_FILE = path.join(__dirname, '../data/OperationsSitePrivate.json');
const OPERATIONS_sitepvt_FILE = path.join(__dirname, '../data/OperationsSitePublic.json');


// Utility functions
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf-8"));
const writeJson = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
const getFileByRole = (role) => (role === "admin" ? ADMIN_FILE : STAFF_FILE);
const syncToStaff = (adminData) => writeJson(STAFF_FILE, adminData);




// Initialize files
for (const file of [ADMIN_FILE, STAFF_FILE, PENDING_FILE, OPERATIONS_WB_FILE, OPERATIONS_inpub_FILE, OPERATIONS_inpvt_FILE,OPERATIONS_sitepub_FILE, OPERATIONS_sitepvt_FILE ]) {
    if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify([]));
}



// GET based on role
router.get("/", (req, res) => {
    try {
		const role = req.query.role;
		const data = readJson(getFileByRole(role));
		res.json(data);
	} catch (err) {
		console.error("GET RealTimeJobs error:", err);
		res.status(500).json({
			message: "Failed to read RealTimeJobs"
		});
	}
});

// Utility: remove empty/null/false fields
const cleanDataWB = (obj) => {
  return {
    LOINo: obj.orderNo || "",
    LOIDate: obj.date || "",
    Division: obj.type || ""
  };
};

function handleWBCategoryadd(newItem) {
  const operationsData = readJson(OPERATIONS_WB_FILE);

  // Remove empty fields
  let cleanedItem = cleanDataWB(newItem);

  // Add new fields
  cleanedItem = {
    ...cleanedItem,
    // Extra fields
    Tender: "",
    FileNo: "",
    WorkOrder: "",
    PrelimarySurvey: "",
    SIRNofTransformer: "",
    FinalSurvey: "",
    SRNofDrainoutOil: "",
    StageInspection: "",
    OilStatement: "",
    SIRNofOil: "",
    TransfomerTesting: "",
    Materialdeliveredon: "",
    SRNofTransformer: "",
    Estimate: "",
    FormalOrderPlaced: "",
    OrderReferanceno: "",
    OrderDate: "",
    Billsubmission: "",
    Payment: "",
    NetAmount: "",
    SecurityDepositesubmitted: "",
    SecurityDepositeReceived: ""
  };

  operationsData.push(cleanedItem);
  writeJson(OPERATIONS_WB_FILE, operationsData);
}


// ADD new item
router.post("/", (req, res) => {
  try {
    const role = req.query.role;
    const file = getFileByRole(role);
    const data = readJson(file);

    const newItem = {
      ...req.body,
      id: Date.now().toString()
    };

    data.push(newItem);
    writeJson(file, data);

    if (role === "admin") {
      syncToStaff(data);

    if (newItem.category === "WB") 
    {
      handleWBCategoryadd(newItem);
    }
    } else {
      const pending = readJson(PENDING_FILE);
      pending.push({
        type: "add",
        item: newItem
      });
      writeJson(PENDING_FILE, pending);
    }
	//console.log("test1");
    

    res.json({
      success: true,
      message: "Item added",
      item: newItem
    });
  } catch (err) {
    console.error("POST Realtimejobs error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to add item"
    });
  }
});

// Utility to add all required fields
const addDefaultFields = (item) => {
  return {
    ...item,
    status: "Pending",
    createdAt: new Date().toISOString(),
    Tender: "",
    Division: "",
    FileNo: "",
    WorkOrder: "",
    Dated1: "",
    PrelimarySurvey: "",
    SIRNofTransformer: "",
    FinalSurvey: "",
    SRNofDrainoutOil: "",
    StageInspection: "",
    OilStatement: "",
    SIRNofOil: "",
    TransfomerTesting: "",
    Materialdeliveredon: "",
    SRNofTransformer: "",
    Estimate: "",
    FormalOrderPlaced: "",
    OrderReferanceno: "",
    Dated2: "",
    Billsubmission: "",
    Payment: "",
    NetAmount: "",
    SecurityDepositesubmitted: "",
    SecurityDepositeReceived: ""
  };
};


// UPDATE item
router.put("/:id", (req, res) => {
    try {
		const role = req.query.role;
		const file = getFileByRole(role);
		const data = readJson(file);
		const index = data.findIndex(item => item.id === req.params.id);
		if (index === -1) return res.status(404).json({
			message: "Item not found"
		});

		const updatedItem = {
			...data[index],
			...req.body
		};
		data[index] = updatedItem;
		writeJson(file, data);

		if (role === "admin") {
			syncToStaff(data);
		} else {
			const adminData = readJson(ADMIN_FILE);
			const original = adminData.find(item => item.id === req.params.id);

			const hasChange = original ?
				Object.keys(updatedItem).some(key => key !== "id" && updatedItem[key] !== original[key]) :
				true;

			if (hasChange) {
				const pending = readJson(PENDING_FILE);
				const existingIndex = pending.findIndex(
					entry => entry.type === "edit" && entry.item.id === updatedItem.id
				);

				if (existingIndex !== -1) {
					pending[existingIndex].item = updatedItem;
				} else {
					pending.push({
						type: "edit",
						item: updatedItem
					});
				}

				writeJson(PENDING_FILE, pending);
			}
		}

		res.json({
			success: true,
			message: "Item updated",
			item: updatedItem
		});
	} catch (err) {
		console.error("PUT RealTimeJobs error:", err);
		res.status(500).json({
			message: "Failed to update item"
		});
	}
});

// DELETE item
router.delete("/:id", (req, res) => {
    try {
		const role = req.query.role;
		const file = getFileByRole(role);
		const data = readJson(file);
		const item = data.find(i => i.id === req.params.id);
		if (!item) return res.status(404).json({
			message: "Item not found"
		});

		const updated = data.filter(i => i.id !== req.params.id);
		writeJson(file, updated);

		if (role === "admin") {
			syncToStaff(updated);
		} else {
			const pending = readJson(PENDING_FILE);
			pending.push({
				type: "delete",
				item
			});
			writeJson(PENDING_FILE, pending);
		}

		res.json({
			message: "Item deleted"
		});
	} catch (err) {
		console.error("DELETE RealTimejobs error:", err);
		res.status(500).json({
			message: "Failed to delete item"
		});
	}
});

// GET all pending changes
router.get("/pending", (req, res) => {
    try {
		const pending = readJson(PENDING_FILE);
		const adminData = readJson(ADMIN_FILE);

		const detailedChanges = pending.map(change => {
			if (change.type === "edit") {
				const original = adminData.find(item => item.id === change.item.id);
				return {
					...change,
					original
				};
			}
			return change;
		});

		res.json(detailedChanges);
	} catch (err) {
		console.error("GET pending error:", err);
		res.status(500).json({
			message: "Error reading pending changes"
		});
	}
});

// APPLY approvals or rejections
router.post("/pending/apply", (req, res) => {
    try {
        const actions = req.body.actions;
        const pending = readJson(PENDING_FILE);
        let adminData = readJson(ADMIN_FILE);
        let staffData = readJson(STAFF_FILE);

        const remainingPending = [];

        for (const pendingItem of pending) {
            const action = actions.find(a => a.id === pendingItem.item.id);

            if (!action) {
                remainingPending.push(pendingItem); // No decision made — keep
                continue;
            }

            const { type, item } = pendingItem;

            if (action.approved) {
                if (type === "add") {
          adminData.push(item);

         // ✅ Call WB handler
          if ((item.category || "").trim().toUpperCase() === "WB") {
            handleWBCategoryadd(item);
          }
        }
        else if (type === "edit") {
                    const i = adminData.findIndex(x => x.id === item.id);
                    if (i !== -1) adminData[i] = item;
                } else if (type === "delete") {
                    adminData = adminData.filter(x => x.id !== item.id);
                }
            } else {
                // Rejected
                if (type === "add") {
                    staffData = staffData.filter(x => x.id !== item.id);
                } else if (type === "edit") {
                    const orig = adminData.find(x => x.id === item.id);
                    const i = staffData.findIndex(x => x.id === item.id);
                    if (i !== -1 && orig) staffData[i] = orig;
                } else if (type === "delete") {
                    staffData.push(item);
                }
            }
        }

        writeJson(ADMIN_FILE, adminData);
        writeJson(STAFF_FILE, staffData); // FIXED: write staffData
        writeJson(PENDING_FILE, remainingPending);

        res.json({ message: "Changes applied" });
    } catch (err) {
        console.error("POST apply error:", err);
        res.status(500).json({ message: "Error applying changes" });
    }
});

export default router;