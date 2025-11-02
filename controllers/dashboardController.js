import pool from "../config/db.js";

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // 🧮 1️⃣ Total Spent & Received (from transactions)
    const [totals] = await pool.query(
      `SELECT 
          SUM(CASE WHEN type='debit' THEN amount ELSE 0 END) AS total_spent,
          SUM(CASE WHEN type='credit' THEN amount ELSE 0 END) AS total_received
       FROM transactions
       WHERE user_id = ?`,
      [userId]
    );

    // 📅 2️⃣ Monthly Spending (this month)
    const [monthly] = await pool.query(
      `SELECT 
          DATE_FORMAT(transaction_date, '%Y-%m') AS month,
          SUM(CASE WHEN type='debit' THEN amount ELSE 0 END) AS spent,
          SUM(CASE WHEN type='credit' THEN amount ELSE 0 END) AS received
       FROM transactions
       WHERE user_id = ?
       GROUP BY month
       ORDER BY month DESC
       LIMIT 1`,
      [userId]
    );

    // 💸 3️⃣ Upcoming Bills (next 30 days)
    const [upcomingBills] = await pool.query(
      `SELECT * FROM bills 
       WHERE user_id = ? 
       AND status = 'upcoming' 
       AND due_date >= CURDATE()
       AND due_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
       ORDER BY due_date ASC`,
      [userId]
    );

    // 🕒 4️⃣ Recent Transactions
    const [recentTransactions] = await pool.query(
      `SELECT * FROM transactions 
       WHERE user_id = ? 
       ORDER BY transaction_date DESC 
       LIMIT 5`,
      [userId]
    );

    // ✅ Response structure for frontend dashboard
    res.json({
      summary: {
        total_spent: totals[0].total_spent || 0,
        total_received: totals[0].total_received || 0,
        net_balance:
          (totals[0].total_received || 0) - (totals[0].total_spent || 0),
      },
      monthly_overview: monthly[0] || { spent: 0, received: 0 },
      upcoming_bills: upcomingBills,
      recent_transactions: recentTransactions,
    });
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
};
