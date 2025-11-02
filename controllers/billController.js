import pool from "../config/db.js";

// ➕ Add new bill
export const addBill = async (req, res) => {
  const { title, category, amount, due_date } = req.body;
  const userId = req.user.user_id;

  if (!title || !amount || !due_date) {
    return res.status(400).json({ error: "Title, amount, and due date are required." });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO bills (user_id, title, category, amount, due_date) VALUES (?, ?, ?, ?, ?)`,
      [userId, title, category || "Uncategorized", amount, due_date]
    );
    res.status(201).json({ message: "Bill added successfully", billId: result.insertId });
  } catch (err) {
    console.error("Add Bill Error:", err);
    res.status(500).json({ error: "Failed to add bill" });
  }
};

// 📅 Get bills grouped by status
export const getBills = async (req, res) => {
  const userId = req.user.user_id;

  try {
    const [rows] = await pool.query(
      `SELECT *, 
        CASE 
          WHEN status = 'paid' THEN 'paid'
          WHEN due_date < CURDATE() THEN 'overdue'
          ELSE 'upcoming'
        END AS bill_status
      FROM bills
      WHERE user_id = ?
      ORDER BY due_date ASC`,
      [userId]
    );

    // Group bills into categories
    const grouped = { overdue: [], upcoming: [], paid: [] };
    for (const bill of rows) {
      grouped[bill.bill_status].push(bill);
    }

    res.json({
      summary: {
        total: rows.length,
        overdue: grouped.overdue.length,
        upcoming: grouped.upcoming.length,
        paid: grouped.paid.length,
      },
      bills: grouped,
    });
  } catch (err) {
    console.error("Get Bills Error:", err);
    res.status(500).json({ error: "Failed to fetch bills" });
  }
};

// controllers/billController.js
export const updateBill = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    const { title, category, amount, due_date, status } = req.body;

    // Build the update query dynamically
    const updates = [];
    const values = [];

    if (title) { updates.push("title = ?"); values.push(title); }
    if (category) { updates.push("category = ?"); values.push(category); }
    if (amount) { updates.push("amount = ?"); values.push(amount); }
    if (due_date) { updates.push("due_date = ?"); values.push(due_date); }
    if (status) { updates.push("status = ?"); values.push(status); }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const sql = `
      UPDATE bills
      SET ${updates.join(", ")}
      WHERE bill_id = ? AND user_id = ?`;
    values.push(id, userId);

    await pool.query(sql, values);

    res.json({ message: "Bill updated successfully" });
  } catch (err) {
    console.error("Update Bill Error:", err);
    res.status(500).json({ error: "Failed to update bill" });
  }
};
// ❌ Delete bill
export const deleteBill = async (req, res) => {
  const { bill_id } = req.params;
  const userId = req.user.user_id;

  try {
    await pool.query(`DELETE FROM bills WHERE bill_id = ? AND user_id = ?`, [bill_id, userId]);
    res.json({ message: "Bill deleted successfully" });
  } catch (err) {
    console.error("Delete Bill Error:", err);
    res.status(500).json({ error: "Failed to delete bill" });
  }
};

export const getBillSummary = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Fetch all user bills
    const [bills] = await pool.query(
      "SELECT category, amount, due_date, status FROM bills WHERE user_id = ?",
      [userId]
    );

    const today = new Date();
    let summary = { paid: 0, upcoming: 0, overdue: 0, total: bills.length };
    const categorySummary = {};

    bills.forEach(bill => {
      const due = new Date(bill.due_date);

      // Categorize status
      if (bill.status === "paid") {
        summary.paid++;
      } else if (due < today) {
        summary.overdue++;
      } else {
        summary.upcoming++;
      }

      // Group by category
      if (!categorySummary[bill.category]) {
        categorySummary[bill.category] = { paid: 0, upcoming: 0, overdue: 0 };
      }

      if (bill.status === "paid") categorySummary[bill.category].paid++;
      else if (due < today) categorySummary[bill.category].overdue++;
      else categorySummary[bill.category].upcoming++;
    });

    res.json({
      ...summary,
      details: categorySummary
    });
  } catch (err) {
    console.error("Bill summary error:", err);
    res.status(500).json({ error: "Failed to generate bill summary" });
  }
};


export const getMonthlyBillSummary = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [bills] = await pool.query(
      `SELECT due_date, status 
       FROM bills 
       WHERE user_id = ?`,
      [userId]
    );

    const monthlySummary = {};

    bills.forEach(bill => {
      const due = new Date(bill.due_date);
      const monthKey = `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, "0")}`;

      if (!monthlySummary[monthKey]) {
        monthlySummary[monthKey] = { paid: 0, upcoming: 0, overdue: 0 };
      }

      const today = new Date();

      if (bill.status === "paid") {
        monthlySummary[monthKey].paid++;
      } else if (due < today) {
        monthlySummary[monthKey].overdue++;
      } else {
        monthlySummary[monthKey].upcoming++;
      }
    });

    res.json(monthlySummary);
  } catch (err) {
    console.error("Monthly bill summary error:", err);
    res.status(500).json({ error: "Failed to generate monthly bill summary" });
  }
};
