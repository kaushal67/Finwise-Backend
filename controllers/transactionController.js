// controllers/transactionController.js
import fs from "fs/promises";
import pool from "../config/db.js";
import pdf from "pdf-parse";

import parseSBI from "../parsers/sbiParser.js";
import parseHDFC from "../parsers/hdfcParser.js";
import parseICICI from "../parsers/iciciParser.js";
import parseGeneric from "../parsers/genericParser.js";
import parseIDFC from "../parsers/idfcParser.js";
import { categorizeTransaction } from "../utils/categorizeTransaction.js"; // ✅ New import

// 🧾 Upload and parse bank statement PDF
export const uploadStatement = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const dataBuffer = await fs.readFile(req.file.path);
    const pdfData = await pdf(dataBuffer);
    const text = pdfData.text;

    console.log("=== Extracted PDF text preview ===");
    console.log(text.split("\n").slice(0, 20));

    // Detect Bank & Parse Accordingly
    let transactions = [];
    if (text.includes("State Bank of India")) {
      transactions = parseSBI(text);
    } else if (text.includes("HDFC Bank")) {
      transactions = parseHDFC(text);
    } else if (text.includes("ICICI Bank")) {
      transactions = parseICICI(text);
    } else if (text.includes("IDFC FIRST BANK") || text.includes("IDFC FIRST Bank")) {
      transactions = parseIDFC(text);
    } else {
      transactions = parseGeneric(text);
    }

    console.log(`✅ Parsed ${transactions.length} transactions`);

    // Insert into DB
    for (const tx of transactions) {
      // Convert "07-Jun-2023" → "2023-06-07"
      const formattedDate = new Date(
        tx.date.replace(/(\d{2})-(\w{3})-(\d{4})/, (_, d, m, y) => {
          const months = {
            Jan: "01", Feb: "02", Mar: "03", Apr: "04",
            May: "05", Jun: "06", Jul: "07", Aug: "08",
            Sep: "09", Oct: "10", Nov: "11", Dec: "12"
          };
          return `${y}-${months[m]}-${d}`;
        })
      );

      if (isNaN(formattedDate)) {
        console.warn(`⚠️ Skipping invalid date: ${tx.date}`);
        continue;
      }

      // ✅ Categorize each transaction
      const category = categorizeTransaction(tx.description);

      await pool.query(
        `INSERT INTO transactions 
          (user_id, transaction_date, description, amount, type, category)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          req.user.user_id,
          formattedDate.toISOString().slice(0, 10),
          tx.description,
          tx.amount,
          tx.type,
          category,
        ]
      );
    }

    res.json({
      message: "✅ Bank statement uploaded & transactions saved successfully",
      imported: transactions.length,
    });
  } catch (err) {
    console.error("Upload PDF error:", err);
    res.status(500).json({ error: "Failed to process PDF" });
  } finally {
    try {
      await fs.unlink(req.file.path);
    } catch {
      // ignore
    }
  }
};

// 📦 Get Transactions (with Pagination + Filters)
export const getTransactions = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const {
      page = 1,
      limit = 10,
      type,
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
    } = req.query;

    const offset = (page - 1) * limit;
    let sql = "SELECT * FROM transactions WHERE user_id = ?";
    const params = [userId];

    // 🧩 Dynamic filters
    if (type) {
      sql += " AND type = ?";
      params.push(type);
    }
    if (category) {
      sql += " AND category = ?";
      params.push(category);
    }
    if (startDate) {
      sql += " AND transaction_date >= ?";
      params.push(startDate);
    }
    if (endDate) {
      sql += " AND transaction_date <= ?";
      params.push(endDate);
    }
    if (minAmount) {
      sql += " AND amount >= ?";
      params.push(minAmount);
    }
    if (maxAmount) {
      sql += " AND amount <= ?";
      params.push(maxAmount);
    }

    sql += " ORDER BY transaction_date DESC LIMIT ? OFFSET ?";
    params.push(Number(limit), Number(offset));

    const [rows] = await pool.query(sql, params);

    // Get total count for pagination
    const [countResult] = await pool.query(
      "SELECT COUNT(*) as total FROM transactions WHERE user_id = ?",
      [userId]
    );
    const total = countResult[0].total;

    res.json({
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
      transactions: rows,
    });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};
// 📅 Monthly Spending Summary
// 📊 Monthly Spending Chart (Frontend-Ready)
export const getMonthlySummary = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Fetch all transactions for user
    const [rows] = await pool.query(
      `SELECT 
         transaction_date, 
         amount, 
         type, 
         category
       FROM transactions
       WHERE user_id = ?
       ORDER BY transaction_date ASC`,
      [userId]
    );

    if (!rows.length) {
      return res.json({ message: "No transactions found", data: [] });
    }

    // 🧮 Group by month and category
    const summary = {};

    for (const tx of rows) {
      const monthKey = tx.transaction_date.toISOString().slice(0, 7); // e.g. "2023-06"
      if (!summary[monthKey]) {
        summary[monthKey] = {
          month: monthKey,
          spent: 0,
          received: 0,
          categories: {}
        };
      }

      const cat = tx.category || "Uncategorized";
      if (!summary[monthKey].categories[cat]) {
        summary[monthKey].categories[cat] = 0;
      }

      if (tx.type === "debit") {
        summary[monthKey].spent += tx.amount;
        summary[monthKey].categories[cat] += tx.amount;
      } else if (tx.type === "credit") {
        summary[monthKey].received += tx.amount;
      }
    }

    // Convert object → sorted array (easier for frontend charts)
    const chartData = Object.values(summary).sort(
      (a, b) => new Date(a.month) - new Date(b.month)
    );

    res.json(chartData);

  } catch (err) {
    console.error("Error generating monthly summary:", err);
    res.status(500).json({ error: "Failed to generate monthly summary" });
  }
};
