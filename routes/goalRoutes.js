import express from "express";
import { createGoal, getGoals } from "../controllers/goalController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { updateGoal, deleteGoal } from "../controllers/goalController.js"; // ✅ import deleteGoal


const router = express.Router();

router.post("/", authenticateToken, createGoal);
router.get("/", authenticateToken, getGoals);
router.put("/:id", authenticateToken, updateGoal);   // ✅ Update goal
router.delete("/:id", authenticateToken, deleteGoal); // ✅ Delete goal

export default router;
