import Groq from "groq-sdk";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export const askAI = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await client.chat.completions.create({
     model: "llama-3.1-8b-instant" ,
      messages: [
        { role: "system", content: "You are FinWise AI, a financial assistant that explains things clearly and responsibly." },
        { role: "user", content: prompt }
      ],
      temperature: 0.4,
    });

    const answer = response.choices[0].message.content;

    res.json({
      answer
    });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "Failed to process AI request" });
  }
};
