import pool from "../config/db.js";

// CREATE a new financial goal
export const createGoal = async (req, res) => {
  const { goal_name, target_amount, target_date } = req.body;
  const userId = req.user?.user_id; // ✅ use user_id not id

  if (!goal_name || !target_amount || !target_date) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO financial_goals 
         (user_id, goal_name, target_amount, target_date, current_savings) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, goal_name, target_amount, target_date, 0.0]
    );

    res.status(201).json({
      message: "Goal created successfully",
      goalId: result.insertId,
    });
  } catch (err) {
    console.error("Create goal error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET all financial goals for the logged-in user
export const getGoals = async (req, res) => {
  const userId = req.user?.user_id; // ✅ fix here too

  try {
    const [rows] = await pool.query(
      `SELECT goal_id, goal_name, target_amount, target_date, current_savings, created_at
       FROM financial_goals 
       WHERE user_id = ?`,
      [userId]
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error("Get goals error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// UPDATE a goal (only by its owner)
export const updateGoal = async (req, res) => {
  const userId = req.user?.user_id;
  const { id } = req.params; // goal_id
  const { goal_name, target_amount, target_date, current_savings } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE financial_goals 
       SET goal_name = ?, target_amount = ?, target_date = ?, current_savings = ?
       WHERE goal_id = ? AND user_id = ?`,
      [goal_name, target_amount, target_date, current_savings, id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Goal not found or unauthorized" });
    }

    res.status(200).json({ message: "Goal updated successfully" });
  } catch (err) {
    console.error("Update goal error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE a goal (only by its owner)
export const deleteGoal = async (req, res) => {
  const userId = req.user?.user_id;
  const { id } = req.params; // goal_id

  try {
    const [result] = await pool.query(
      `DELETE FROM financial_goals WHERE goal_id = ? AND user_id = ?`,
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Goal not found or unauthorized" });
    }

    res.status(200).json({ message: "Goal deleted successfully" });
  } catch (err) {
    console.error("Delete goal error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
