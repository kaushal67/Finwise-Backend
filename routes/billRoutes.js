import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { addBill, getBills, updateBill, deleteBill ,getBillSummary,getMonthlyBillSummary } from "../controllers/billController.js";

const router = express.Router();

router.post("/", authenticateToken, addBill);
router.get("/", authenticateToken, getBills);
router.put("/:bill_id", authenticateToken, updateBill);
router.delete("/:bill_id", authenticateToken, deleteBill);
router.get("/summary", authenticateToken, getBillSummary);
router.get("/monthly-summary", authenticateToken, getMonthlyBillSummary);


export default router;
