export const formatNumber = (num?: number): string => {
  if (Number.isNaN(num)) {
    return "0";
  }

  return Number(num ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};
