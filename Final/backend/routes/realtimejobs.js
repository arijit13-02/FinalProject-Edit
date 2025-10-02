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

const OPERATIONS_inWB_FILE = path.join(__dirname, '../data/OperationsInHouseWB.json');
const OPERATIONS_siteWB_FILE = path.join(__dirname, '../data/OperationsSiteWB.json');
const OPERATIONS_inpvt_FILE = path.join(__dirname, '../data/OperationsInHousePrivate.json');
const OPERATIONS_inpub_FILE = path.join(__dirname, '../data/OperationsInHousePublic.json');
const OPERATIONS_sitepub_FILE = path.join(__dirname, '../data/OperationsSitePublic.json');
const OPERATIONS_sitepvt_FILE = path.join(__dirname, '../data/OperationsSitePrivate.json');


// Utility functions
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf-8"));
const writeJson = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
const getFileByRole = (role) => (role === "admin" ? ADMIN_FILE : STAFF_FILE);
const syncToStaff = (adminData) => writeJson(STAFF_FILE, adminData);



// Initialize files
for (const file of [ADMIN_FILE, STAFF_FILE, PENDING_FILE, OPERATIONS_inWB_FILE,OPERATIONS_siteWB_FILE, OPERATIONS_inpub_FILE, OPERATIONS_inpvt_FILE,OPERATIONS_sitepub_FILE, OPERATIONS_sitepvt_FILE ]) {
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
    ID: obj.id || "",
    Location: obj.location || "",
    Category: obj.category || "",
    LOINo: obj.orderNo || "",
    LOIDate: obj.date || "",
    Division: obj.type || "",
    
  };
};


function handleWBCategoryadd(newItem) {

  const inwb = readJson(OPERATIONS_inWB_FILE);
  const sitewb = readJson(OPERATIONS_siteWB_FILE);

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
  
  if ((cleanedItem.Location || "").trim().toUpperCase() === "IN HOUSE") {
    inwb.unshift(cleanedItem);
    writeJson(OPERATIONS_inWB_FILE, inwb);
  } else if ((cleanedItem.Location || "").trim().toUpperCase() === "SITE") {
    sitewb.unshift(cleanedItem);
    writeJson(OPERATIONS_siteWB_FILE, sitewb);
  }
  
}


const cleanDataInhouse = (obj) => {
  return {
    ID: obj.id || "",
    Location: obj.location || "",
    Category: obj.category || "",
    Client: obj.type || "",
    WorkOrder: obj.orderNo || "",
    Date: obj.date || "",
  };
};

function handleInhouse(newItem) {
  const inpvt = readJson(OPERATIONS_inpvt_FILE);
  const inpub = readJson(OPERATIONS_inpub_FILE);

  // Remove empty fields
  let cleanedItem = cleanDataInhouse(newItem);

  // Add new fields
  cleanedItem = {
  ...cleanedItem,
  // Extra fields (new)
  FileNo: "",
  Dismetalling: "",
  Inspection: "",
  InformToClient: "",
  Approval: "",
  Winding: "",
  Assembly: "",
  HeatChamber: "",
  Testing: "",
  ClientInspection: "",
  Delivery: "",
  BillSubmission: "",
  Payment: "",
  Amount: "",
  SecurityDeposited: ""
  };

  if ((cleanedItem.Category || "").trim().toUpperCase() === "PRIVATE") {
    inpvt.unshift(cleanedItem);
    writeJson(OPERATIONS_inpvt_FILE, inpvt);
  } else if ((cleanedItem.Category || "").trim().toUpperCase() === "PUBLIC") {
    inpub.unshift(cleanedItem);
    writeJson(OPERATIONS_inpub_FILE, inpub);
  }
}

const cleanDataSite = (obj) => {
  return {
    ID: obj.id || "",
    Location: obj.location || "",
    Category: obj.category || "",
    Client: obj.type || "",                
    WorkOrder: obj.orderNo || "",
    Date: obj.date || "",
    SiteLocation: obj.siteLocation || "",
    TypeOfJob: obj.typeOfJob || "",
    TransformerDetails: (obj.fieldJobDetails || []).map((item) => ({
      KVA: item.kva || "",
      SrNo: item.srNo || "",
      Rating: item.rating || "",
      Note: item.note || ""
    }))
  };
};


function handleSite(newItem) {
  const sitepvt = readJson(OPERATIONS_sitepvt_FILE);
  const sitepub = readJson(OPERATIONS_sitepub_FILE);


  // Remove empty fields
  let cleanedItem = cleanDataSite(newItem);

  // Add new fields
  cleanedItem = {
  ...cleanedItem,
  // Extra fields (new)
  FileNo: "",
  Make: "",
  OilQty: "",
  BillSubmission: "",
  Payment: "",
  Amount: "",
  SecurityDeposited: ""
};


  if ((cleanedItem.Category || "").trim().toUpperCase() === "PRIVATE") {
    sitepvt.unshift(cleanedItem);
    writeJson(OPERATIONS_sitepvt_FILE, sitepvt);
  } else if ((cleanedItem.Category || "").trim().toUpperCase() === "PUBLIC") {
    sitepub.unshift(cleanedItem);
    writeJson(OPERATIONS_sitepub_FILE, sitepub);
  }
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

    data.unshift(newItem);
    writeJson(file, data);

    if (role === "admin") 
    {
      syncToStaff(data);

      if (newItem.category === "WBSEDCL") 
      {
        handleWBCategoryadd(newItem);
      }
      else
      {
        if (newItem.location === "In House") 
        {
          handleInhouse(newItem);
        }
        else{
            if (newItem.location === "Site") 
            {
              handleSite(newItem);
            }
        }
          
      }
      
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
    console.error("POST Realtimejobs error:", err);
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
                remainingPending.unshift(pendingItem); // No decision made — keep
                continue;
            }

            const { type, item } = pendingItem;

            if (action.approved) {
                if (type === "add") {
          adminData.unshift(item);

         // ✅ Call WBSEDCL handler
          if ((item.category || "").trim().toUpperCase() === "WBSEDCL") {
            handleWBCategoryadd(item);
          }
          else
          {
            if (item.location === "In House") 
            {
              handleInhouse(item);
            }
            else{
                if (item.location === "Site") 
                {
                  handleSite(item);
                }
            }
              
          }
        }
        else if (type === "edit") 
          {
            const i = adminData.findIndex(x => x.id === item.id);
  if (i !== -1) {
    if (item.delivery === true) {
      // ✅ If delivery is true, remove the record instead of updating
      adminData = adminData.filter(x => x.id !== item.id);
      staffData = staffData.filter(x => x.id !== item.id);
    } else {
      // ✅ Otherwise, update as normal
      adminData[i] = item;
    }
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