export const formatDate = (date: Date, format?: "YYYY-MM-DD" | "DD-MM-YYYY"): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  if (format === "YYYY-MM-DD") return `${year}-${month}-${day}`;

  return `${day}-${month}-${year}`;
};

export const toSentenceCase = (value: string): string => {
  if (!value) throw new Error("Error parsing string to sentence case");
  return value
    .trim()
    .toLowerCase()
    .replace(/(^|\s)\w/g, (match) => match.toUpperCase());
};
