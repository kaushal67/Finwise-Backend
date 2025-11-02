// parsers/idfcParser.js
export default function parseIDFC(text) {
  const transactions = [];

  // Clean up and split into lines
  const lines = text
    .split(/\n|\r/)
    .map(l => l.trim())
    .filter(l => l && !l.startsWith("STATEMENT") && !l.startsWith("CUSTOMER") && !l.startsWith("ACCOUNT"));

  let currentTxn = null;

  for (let line of lines) {
    // ✅ Detect lines that start with a date (e.g., 07-Jun-2023)
    const dateMatch = line.match(/^(\d{2}-[A-Za-z]{3}-\d{4})/);

    if (dateMatch) {
      // Save previous transaction
      if (currentTxn) {
        transactions.push(currentTxn);
      }

      // Start new transaction
      currentTxn = {
        date: dateMatch[1],
        description: line.replace(dateMatch[0], "").trim(),
        debit: null,
        credit: null,
        balance: null,
      };
    } else if (currentTxn) {
      // Append continuing line to description
      currentTxn.description += " " + line.trim();

      // Try to detect numeric fields (debit, credit, balance)
      const numMatch = line.match(/([\d,]+\.\d{2})/g);
      if (numMatch && numMatch.length >= 1) {
        // Guess position based on count
        if (numMatch.length === 3) {
          // Debit, Credit, Balance
          currentTxn.debit = numMatch[0];
          currentTxn.credit = numMatch[1];
          currentTxn.balance = numMatch[2];
        } else if (numMatch.length === 2) {
          currentTxn.debit = numMatch[0];
          currentTxn.balance = numMatch[1];
        } else if (numMatch.length === 1) {
          // Could be balance or debit
          currentTxn.balance = numMatch[0];
        }
      }
    }
  }

  // Push last transaction
  if (currentTxn) transactions.push(currentTxn);

  // Convert to clean format
  const formatted = transactions
    .filter(t => t.description && (t.debit || t.credit))
    .map(t => ({
      date: t.date,
      description: t.description.trim(),
      amount: parseFloat((t.debit || t.credit || "0").replace(/,/g, "")),
      type: t.debit ? "debit" : "credit",
      balance: t.balance ? parseFloat(t.balance.replace(/,/g, "")) : null,
    }));

  console.log(`✅ Parsed ${formatted.length} IDFC transactions`);
  console.log("🧾 Sample:", formatted.slice(0, 3));

  return formatted;
}
