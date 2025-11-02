export default function parseGeneric(text) {
  const transactions = [];
  const lines = text.split("\n");

  for (let line of lines) {
    // Generic: date + description + amount
    const match = line.match(
      /(\d{2}[\/-]\d{2}[\/-]\d{4}|\d{4}-\d{2}-\d{2})\s+(.+?)\s+(-?\d+\.\d{2})/
    );
    if (match) {
      transactions.push({
        date: match[1],
        description: match[2].trim(),
        amount: parseFloat(match[3]),
        balance: null,
        type: parseFloat(match[3]) < 0 ? "debit" : "credit",
      });
    }
  }

  return transactions;
}
