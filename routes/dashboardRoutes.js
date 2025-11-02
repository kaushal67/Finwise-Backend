import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { getDashboardSummary } from "../controllers/dashboardController.js";

const router = express.Router();

// ✅ Dashboard summary endpoint
router.get("/", authenticateToken, getDashboardSummary);

export default router;
