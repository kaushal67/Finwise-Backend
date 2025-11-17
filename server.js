import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2";
import userRoutes from "./routes/userRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import billRoutes from "./routes/billRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import investmentRoutes from "./routes/investmentRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import aiFinanceRoutes from "./routes/aiFinanceRoutes.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/investments", investmentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/ai/finance", aiFinanceRoutes);
// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) console.error("DB connection failed:", err);
  else console.log("Connected to MySQL ✅");
});

// Simple route
app.get("/", (req, res) => {
  res.json({ message: "Finance API is running!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
