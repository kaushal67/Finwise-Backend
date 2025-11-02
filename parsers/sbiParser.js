export default function parseSBI(text) {
  const transactions = [];
  const lines = text.split("\n");

  for (let line of lines) {
    // SBI example: 01/09/2025 ATM Withdrawal 500.00 DR 15000.00
    const match = line.match(
      /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([\d,]+\.\d{2})\s+(CR|DR)\s+([\d,]+\.\d{2})/
    );
    if (match) {
      transactions.push({
        date: match[1],
        description: match[2].trim(),
        amount: parseFloat(match[3].replace(/,/g, "")) * (match[4] === "DR" ? -1 : 1),
        balance: parseFloat(match[5].replace(/,/g, "")),
        type: match[4] === "DR" ? "debit" : "credit",
      });
    }
  }

  return transactions;
}
