import pool from "../config/db.js";

// ➕ Add new account
export const addAccount = async (req, res) => {
  try {
    const { bank_name, account_number, type, balance } = req.body;
    const userId = req.user.user_id;

    if (!bank_name || !account_number)
      return res.status(400).json({ error: "Bank name & account number required" });

    const [result] = await pool.query(
      `INSERT INTO accounts (user_id, bank_name, account_number, type, balance)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, bank_name, account_number, type || "savings", balance || 0]
    );

    res.json({ message: "Account added successfully", account_id: result.insertId });
  } catch (err) {
    console.error("Add Account Error:", err);
    res.status(500).json({ error: "Failed to add account" });
  }
};

// 📋 Get all accounts for user
export const getAccounts = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const [accounts] = await pool.query(
      "SELECT * FROM accounts WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    res.json(accounts);
  } catch (err) {
    console.error("Get Accounts Error:", err);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
};

// ✏️ Update account
export const updateAccount = async (req, res) => {
  try {
    const { account_id } = req.params;
    const { bank_name, account_number, type, balance } = req.body;
    const userId = req.user.user_id;

    const [result] = await pool.query(
      `UPDATE accounts
       SET bank_name = ?, account_number = ?, type = ?, balance = ?
       WHERE account_id = ? AND user_id = ?`,
      [bank_name, account_number, type, balance, account_id, userId]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Account not found" });

    res.json({ message: "Account updated successfully" });
  } catch (err) {
    console.error("Update Account Error:", err);
    res.status(500).json({ error: "Failed to update account" });
  }
};

// ❌ Delete account
export const deleteAccount = async (req, res) => {
  try {
    const { account_id } = req.params;
    const userId = req.user.user_id;

    const [result] = await pool.query(
      "DELETE FROM accounts WHERE account_id = ? AND user_id = ?",
      [account_id, userId]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Account not found" });

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Delete Account Error:", err);
    res.status(500).json({ error: "Failed to delete account" });
  }
};
