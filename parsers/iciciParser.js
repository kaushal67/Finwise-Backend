export default function parseICICI(text) {
  const transactions = [];
  const lines = text.split("\n");

  for (let line of lines) {
    // ICICI format: 2025-09-01 POS PURCHASE AMAZON -500.00 12000.00
    const match = line.match(
      /(\d{4}-\d{2}-\d{2})\s+(.+?)\s+(-?[\d,]+\.\d{2})\s+([\d,]+\.\d{2})/
    );
    if (match) {
      transactions.push({
        date: match[1],
        description: match[2].trim(),
        amount: parseFloat(match[3].replace(/,/g, "")),
        balance: parseFloat(match[4].replace(/,/g, "")),
        type: parseFloat(match[3]) < 0 ? "debit" : "credit",
      });
    }
  }

  return transactions;
}
