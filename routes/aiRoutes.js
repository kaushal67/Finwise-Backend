import express from "express";
import { askAI } from "../controllers/aiController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateToken, askAI);

export default router;
