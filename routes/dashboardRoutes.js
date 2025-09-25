import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, (req, res) => {
  res.json({
    message: "Dashboard data",
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    }
  });
});

export default router;
