export const categorizeTransaction = (description) => {
  const text = description.toLowerCase();

  if (text.includes("swiggy") || text.includes("zomato") || text.includes("restaurant"))
    return "Food & Dining";
  if (text.includes("amazon") || text.includes("flipkart") || text.includes("shopping"))
    return "Shopping";
  if (text.includes("electricity") || text.includes("bill") || text.includes("upi") || text.includes("paytm"))
    return "Utilities";
  if (text.includes("salary") || text.includes("credited"))
    return "Income";
  if (text.includes("atm") || text.includes("withdrawal"))
    return "Cash Withdrawal";
  if (text.includes("phonepe") || text.includes("gpay") || text.includes("upi"))
    return "Transfers";

  return "Uncategorized";
};
