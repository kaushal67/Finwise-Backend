import pool from "../config/db.js";
import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Helper to run SQL
async function runQuery(query, params = []) {
  const [rows] = await pool.query(query, params);
  return rows;
}

export const askFinanceAI = async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = req.user.user_id;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Detect intent
    const intentResponse = await client.chat.completions.create({
     model: "llama-3.1-8b-instant" ,
      messages: [
        {
          role: "system",
          content: `
You are an INTENT DETECTOR. 
Return ONLY one intent:
"transactions", "spending", "bills", "goals", "investments", "summary".
`
        },
        { role: "user", content: prompt }
      ]
    });

    const intent = intentResponse.choices[0].message.content.trim();
    console.log("Detected Intent:", intent);

    let data = null;

    // SQL by intent
    switch (intent) {
      case "transactions":
      case "spending":
        data = await runQuery(
          "SELECT * FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC LIMIT 50",
          [userId]
        );
        break;

      case "bills":
        data = await runQuery(
          "SELECT * FROM bills WHERE user_id = ? ORDER BY due_date ASC",
          [userId]
        );
        break;

      case "goals":
        data = await runQuery(
          "SELECT * FROM financial_goals WHERE user_id = ?",
          [userId]
        );
        break;

      case "investments":
        data = await runQuery(
          "SELECT * FROM investments WHERE user_id = ?",
          [userId]
        );
        break;

      default:
        data = {
          transactions: await runQuery(
            "SELECT * FROM transactions WHERE user_id = ? LIMIT 20",
            [userId]
          ),
          bills: await runQuery(
            "SELECT * FROM bills WHERE user_id = ? LIMIT 20",
            [userId]
          ),
          goals: await runQuery(
            "SELECT * FROM financial_goals WHERE user_id = ?",
            [userId]
          ),
          investments: await runQuery(
            "SELECT * FROM investments WHERE user_id = ?",
            [userId]
          )
        };
    }

    // Generate final answer using fresh Groq model
    const aiResponse = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
You are a financial advisor AI. 
Use ONLY provided data. No hallucinations.
Return clear, helpful answers.
`
        },
        {
          role: "user",
          content:
            "User question: " +
            prompt +
            "\n\nUser Financial Data:\n" +
            JSON.stringify(data)
        }
      ]
    });

    const answer = aiResponse.choices[0].message.content;

    res.json({ answer });

  } catch (err) {
    console.error("AI Finance Error:", err);
    res.status(500).json({ error: "AI failed" });
  }
};
