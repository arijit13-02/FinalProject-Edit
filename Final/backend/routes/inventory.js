import express from "express";
import fs from "fs";
import path from "path";
import {
	fileURLToPath
} from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADMIN_FILE = path.join(__dirname, '../data/admininv.json');
const STAFF_FILE = path.join(__dirname, '../data/staffinv.json');
const PENDING_FILE = path.join(__dirname, '../data/pendingChangesinv.json');


// Utility functions
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf-8"));
const writeJson = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
const getFileByRole = (role) => (role === "admin" ? ADMIN_FILE : STAFF_FILE);
const syncToStaff = (adminData) => writeJson(STAFF_FILE, adminData);



// Initialize files
for (const file of [ADMIN_FILE, STAFF_FILE, PENDING_FILE ]) {
    if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify([]));
}



// GET based on role
router.get("/", (req, res) => {
    try {
		const role = req.query.role;
		const data = readJson(getFileByRole(role));
		res.json(data);
	} catch (err) {
		console.error("GET Inventory error:", err);
		res.status(500).json({
			message: "Failed to read Inventory"
		});
	}
});


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

    data.unshift(newItem);
    writeJson(file, data);

    if (role === "admin") 
    {
      syncToStaff(data);
      
    } else {
      const pending = readJson(PENDING_FILE);
      pending.unshift({
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
    console.error("POST Inventory error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to add item"
    });
  }
});




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
  if (updatedItem.delivery === true) {
    // ✅ Remove record if delivery marked true
    data.splice(index, 1);
    writeJson(file, data);
    syncToStaff(data);
  } else {
    // ✅ Normal update
    syncToStaff(data);
  }
}
 
    else {
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
					pending.unshift({
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
		console.error("PUT Inventory error:", err);
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
			pending.unshift({
				type: "delete",
				item
			});
			writeJson(PENDING_FILE, pending);
		}

		res.json({
			message: "Item deleted"
		});
	} catch (err) {
		console.error("DELETE Inventory error:", err);
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
                remainingPending.unshift(pendingItem); // No decision made — keep
                continue;
            }

            const { type, item } = pendingItem;

            if (action.approved) {
                if (type === "add") {
          adminData.unshift(item);

        }
        else if (type === "edit") 
          {
            const i = adminData.findIndex(x => x.id === item.id);
  if (i !== -1) {
;
  }
          } 
          else if (type === "delete") 
          {
            adminData = adminData.filter(x => x.id !== item.id);
          }
          
      } else 
              {
                // Rejected
                if (type === "add") {
                    staffData = staffData.filter(x => x.id !== item.id);
                } else if (type === "edit") {
                    const orig = adminData.find(x => x.id === item.id);
                    const i = staffData.findIndex(x => x.id === item.id);
                    if (i !== -1 && orig) staffData[i] = orig;
                } else if (type === "delete") {
                    staffData.unshift(item);
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