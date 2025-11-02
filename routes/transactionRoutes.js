import express from "express";
import multer from "multer";
import { 
  uploadStatement, 
  getTransactions, 
  getMonthlySummary 
} from "../controllers/transactionController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Multer config for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// 📂 Upload bank statement
router.post(
  "/upload",
  authenticateToken,
  upload.single("statement"),
  uploadStatement
);

// 📋 Get all transactions
router.get("/", authenticateToken, getTransactions);

// 📊 Get monthly spending summary (the one you tested)
router.get("/summary", authenticateToken, getMonthlySummary);

export default router;
