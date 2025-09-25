import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE user_id = ?",
      [decoded.id]
    );

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ error: "Authentication error, user not found." });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(403).json({ error: "Invalid token" });
  }
};
