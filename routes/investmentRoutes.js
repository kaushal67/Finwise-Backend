import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { addInvestment, getInvestments, updateInvestment, deleteInvestment } from "../controllers/investmentController.js";

const router = express.Router();

router.post("/", authenticateToken, addInvestment);
router.get("/", authenticateToken, getInvestments);
router.put("/:investment_id", authenticateToken, updateInvestment);
router.delete("/:investment_id", authenticateToken, deleteInvestment);

export default router;
