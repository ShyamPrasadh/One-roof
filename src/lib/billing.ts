/** Prices are GST-inclusive. This splits an inclusive amount into taxable value and GST. */
export function splitInclusive(amount: number, gstRate: number) {
  const taxable = round2((amount * 100) / (100 + gstRate));
  const gst = round2(amount - taxable);
  return { taxable, gst };
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Intra-state supply (same state as the store) is CGST + SGST; otherwise IGST. */
export function gstSplit(gst: number, buyerStateCode: string | undefined, storeStateCode: string) {
  if (!buyerStateCode || buyerStateCode === storeStateCode) {
    const half = round2(gst / 2);
    return { cgst: half, sgst: round2(gst - half), igst: 0 };
  }
  return { cgst: 0, sgst: 0, igst: gst };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(amount);
}

export function invoiceNumber(counter: number, date = new Date()): string {
  // Indian financial year, e.g. 2026-27, starts 1 April.
  const startYear = date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
  const fy = `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
  return `OR/${fy}/${String(counter).padStart(4, "0")}`;
}
