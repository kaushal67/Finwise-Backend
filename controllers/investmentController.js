import pool from "../config/db.js";

// ➕ Add new investment
export const addInvestment = async (req, res) => {
  try {
    const { asset_name, asset_type, amount_invested, purchase_date, current_value } = req.body;
    const userId = req.user.user_id;

    if (!asset_name || !amount_invested|| !purchase_date) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    const [result] = await pool.query(
      `INSERT INTO investments (user_id, asset_name, asset_type, amount_invested, purchase_date, current_value)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, asset_name, asset_type, amount_invested, purchase_date, current_value || amount_invested]
    );

    res.status(201).json({ message: "Investment added", investment_id: result.insertId });
  } catch (err) {
    console.error("Add Investment Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 📊 Get all investments for user
export const getInvestments = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const [rows] = await pool.query(
      "SELECT * FROM investments WHERE user_id = ? ORDER BY purchase_date DESC",
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Get Investments Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 🔄 Update investment
export const updateInvestment = async (req, res) => {
  try {
    const { investment_id } = req.params;
    const { current_value } = req.body;
    const userId = req.user.user_id;

    await pool.query(
      `UPDATE investments 
       SET current_value = ?
       WHERE investment_id = ? AND user_id = ?`,
      [current_value, investment_id, userId]
    );

    res.json({ message: "Investment updated successfully" });
  } catch (err) {
    console.error("Update Investment Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ❌ Delete investment
export const deleteInvestment = async (req, res) => {
  try {
    const { investment_id } = req.params;
    const userId = req.user.user_id;

    await pool.query(
      "DELETE FROM investments WHERE investment_id = ? AND user_id = ?",
      [investment_id, userId]
    );

    res.json({ message: "Investment deleted successfully" });
  } catch (err) {
    console.error("Delete Investment Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
