export default function parseHDFC(text) {
  const transactions = [];
  const lines = text.split("\n");

  for (let line of lines) {
    // HDFC example: 01/09/2025 NEFT FROM XXX 10,000.00 50,000.00
    const match = line.match(
      /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})/
    );
    if (match) {
      transactions.push({
        date: match[1],
        description: match[2].trim(),
        amount: parseFloat(match[3].replace(/,/g, "")),
        balance: parseFloat(match[4].replace(/,/g, "")),
        type: parseFloat(match[3].replace(/,/g, "")) < 0 ? "debit" : "credit",
      });
    }
  }

  return transactions;
}
