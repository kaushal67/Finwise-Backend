import pool from "../config/db.js";

// CREATE a new financial goal
export const createGoal = async (req, res) => {
  const { goal_name, target_amount, target_date } = req.body;
  const userId = req.user?.id;

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
  const userId = req.user?.id;

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
