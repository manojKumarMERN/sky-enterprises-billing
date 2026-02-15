import { amountInWords } from "@/lib/utils";

export const handleDownload = async (
  data: any,
  saveInvoiceToLocal: (d: any) => string
) => {
  // ── 1. Derived values ──────────────────────────────────────────────────────
  const today = new Date();
  const date  = today.toLocaleDateString("en-IN");
  const day   = today.toLocaleString("en-IN", { weekday: "long" });

  const discountPercent           = data.discountPercent || 0;
  const discountFlat              = data.discountFlat    || 0;

  const subTotal = data.items.reduce((sum: number, item: any) => {
    if (item.sqft && item.rate) return sum + item.qty * item.sqft * item.rate;
    return sum + item.qty * item.price;
  }, 0);

  const percentDiscountAmount = (subTotal * discountPercent) / 100;
  const grandTotal            = subTotal - percentDiscountAmount - discountFlat;

  // ── 2. Save to localStorage ────────────────────────────────────────────────
  // If editingInvoiceNo is set in store, saveInvoiceToLocal reuses it.
  // If not, it generates a new one.
  // Either way, it returns the correct invoiceNo.
  const invoiceNo = saveInvoiceToLocal({
    ...data,
    totals: { subTotal, discountPercent, discountFlat, grandTotal },
  });

  // ── 3. Store preview payload in sessionStorage ────────────────────────────
  const previewPayload = {
    data,
    invoiceNo,   // ← correct number (existing or new)
    date,
    day,
    subTotal,
    percentDiscountAmount,
    grandTotal,
    amountWords: amountInWords(grandTotal),
    isEdit: !!data.editingInvoiceNo, // flag for preview page if needed
  };

  sessionStorage.setItem("invoice_preview", JSON.stringify(previewPayload));

  // ── 4. Open preview page (same origin — images work!) ─────────────────────
  window.open("/invoice-preview", "_blank", "width=1000,height=800");
};