import express from "express";
import { createGoal, getGoals } from "../controllers/goalController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateToken, createGoal);
router.get("/", authenticateToken, getGoals);

export default router;
