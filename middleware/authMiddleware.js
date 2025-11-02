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

    // ✅ Make sure we fetch the actual user row
    const [rows] = await pool.query(
      "SELECT user_id, name, email FROM users WHERE user_id = ?",
      [decoded.id] // in JWT we signed { id: user_id }
    );

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ error: "Authentication error, user not found." });
    }

    // ✅ Attach normalized object to req.user
    req.user = {
      user_id: rows[0].user_id,
      name: rows[0].name,
      email: rows[0].email,
    };

    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(403).json({ error: "Invalid token" });
  }
};
