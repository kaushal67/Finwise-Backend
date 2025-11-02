import express from "express";
import {
  addAccount,
  getAccounts,
  updateAccount,
  deleteAccount,
} from "../controllers/accountController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateToken, addAccount);
router.get("/", authenticateToken, getAccounts);
router.put("/:account_id", authenticateToken, updateAccount);
router.delete("/:account_id", authenticateToken, deleteAccount);

export default router;
