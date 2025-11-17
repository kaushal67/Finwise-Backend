import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { askFinanceAI } from "../controllers/aiFinanceController.js";

const router = express.Router();

router.post("/", authenticateToken, askFinanceAI);

export default router;
