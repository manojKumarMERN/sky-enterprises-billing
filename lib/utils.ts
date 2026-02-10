import { useBillingStore } from "@/store/useBillingStore";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const useTotalAmount = () => {
  const items = useBillingStore((s: any) => s.items);
  const discount = useBillingStore((s: any) => s.discountPercent);

  const total = items.reduce((sum: number, item: any) => {
    if (item.sqft && item.rate) {
      return sum + item.qty * item.sqft * item.rate;
    }
    return sum + item.qty * item.price;
  }, 0);

  const discountAmount = (total * discount) / 100;
  return {
    total,
    discountAmount,
    finalTotal: total - discountAmount,
  };
};

function numberToWords(num: number) {
  if (num === 0) return "Zero";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five",
    "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
    "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];

  const tens = [
    "", "", "Twenty", "Thirty", "Forty",
    "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  function convertBelowHundred(n: number) {
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
  }

  function convertBelowThousand(n: number) {
    if (n < 100) return convertBelowHundred(n);
    return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convertBelowHundred(n % 100) : "");
  }

  function convertIndian(n: number) {
    let result = "";
    if (n >= 10000000) {
      result += convertBelowThousand(Math.floor(n / 10000000)) + " Crore ";
      n %= 10000000;
    }
    if (n >= 100000) {
      result += convertBelowThousand(Math.floor(n / 100000)) + " Lakh ";
      n %= 100000;
    }
    if (n >= 1000) {
      result += convertBelowThousand(Math.floor(n / 1000)) + " Thousand ";
      n %= 1000;
    }
    if (n > 0) {
      result += convertBelowThousand(n);
    }
    return result.trim();
  }

  return convertIndian(num);
}

function amountInWords(amount: number) {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  let words = numberToWords(rupees) + " Rupees";
  if (paise > 0) words += " and " + numberToWords(paise) + " Paise";

  return words + " Only";
}



export const handleDownload = (data: any, saveInvoiceToLocal: (d: any) => void) => {
  const today = new Date();
  const date = today.toLocaleDateString();
  const day = today.toLocaleString("en-IN", { weekday: "long" });
  const baseUrl = window.location.origin;

  const discountPercent = data.discountPercent || 0;
  const discountFlat = data.discountFlat || 0;

  const subTotal = data.items.reduce((sum: number, item: any) => {
    if (item.sqft && item.rate) return sum + item.qty * item.sqft * item.rate;
    return sum + item.qty * item.price;
  }, 0);

  const percentDiscountAmount = (subTotal * discountPercent) / 100;
  const grandTotal = subTotal - percentDiscountAmount - discountFlat;

  const invoiceNo = saveInvoiceToLocal({
    ...data,
    totals: { subTotal, discountPercent, discountFlat, grandTotal },
  });

  const win = window.open("", "", "width=900,height=700");
  if (!win) return;

  win.document.write(`
<html>
<head>
<!-- Inter Font -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
<title>Invoice</title>
<style>

/* RESET */
* {
  box-sizing: border-box;
  -webkit-print-color-adjust: exact;
}


body {
  font-family: Inter, Arial;
  margin: 0;
  padding: 0;
  background: #0f172a;
  color: #f9fafb;
}

/* PAGE */
.page {
  width: 210mm;
  min-height: 297mm;
  padding: 12mm;
  margin: auto;
  display: flex;
  flex-direction: column;
  position: relative;

  background: radial-gradient(circle at top right, rgba(255,255,255,0.12), transparent 40%),
              radial-gradient(circle at bottom left, rgba(255,255,255,0.08), transparent 50%),
              #345051;
}

.watermark {
  position: absolute;
  inset: 0;
  background: url('/logo.png') no-repeat center;
  background-size: 400px;
  opacity: 0.30;
  z-index: 0;
}

.page {
  position: relative;
}



/* HEADER */
.header {
  display: flex;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(255,255,255,0.15);
}

.logo { height: 65px; }

h1 {
  margin: 0;
  font-size: 22px;
  color: #ffb703;
  font-weight: 700;
}

.header div {
  font-size: 13px;
  color: #e5e7eb;
}

/* BILL BOX */
.bill-box {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  padding: 12px;
  border-radius: 10px;
  margin: 12px 0;
}

/* TABLE */
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  margin-top: 10px;
}

th {
  background: #282e31;
  color: white;
  padding: 10px;
  font-weight: 600;
}

td {
  padding: 8px;
  border-bottom: 1px solid rgba(255,255,255,0.15);
}

tr:nth-child(even) {
  background: rgba(255,255,255,0.03);
}

/* TOTAL SUMMARY */
.total-summary {
  width: 100%;
  border-radius: 12px;
  padding: 16px;
  background: rgba(0,0,0,0.35);
  border: 1px solid rgba(255,255,255,0.2);
  font-size: 14px;
}


/* TOTAL BOX */
.total-box {
  background: #16a34a;
  color: white;
  padding: 10px 14px;
  font-size: 18px;
  border-radius: 6px;
  font-weight: bold;
}
.total-summary-box {
width: 100%;
  padding: 18px 20px;
  border-radius: 18px;

  /* Glass Effect */
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);

  font-size: 14px;
  color: #f9fafb;
  position: relative;
  overflow: hidden;
}

/* Shine layer */
.total-summary-box::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    rgba(255,255,255,0.35),
    transparent 40%
  );
  opacity: 0.25;
  pointer-events: none;
}

/* Rows */
.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-weight: 500;
  color: #f8fafc;
}

/* Discount red */
.discount {
  color: #f87171;
}

/* Divider */
.summary-divider {
  border-top: 1px dashed rgba(255,255,255,0.3);
  margin: 10px 0;
}

/* Grand total */
.grand-total-row {
  display: flex;
  justify-content: space-between;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.3px;
}

.grand-total-row span:last-child {
  color: #22c55e;
  font-family: "JetBrains Mono", monospace; /* finance style */
}

/* Amount in words */
.amount-words {
  margin-top: 6px;
  font-size: 12px;
  font-style: italic;
  color: rgba(255,255,255,0.8);
}


/* FOOTER */
.footer {
  margin-top: auto;
  text-align: right;
}

/* SIGN */
.signature {
  margin-top: 20px;
  font-size: 13px;
  color: #e5e7eb;
}

.line {
  border-top: 1px solid black;
  width: 180px;
  margin-top: 8px;
}

/* MENU */
.menu-btn {
  position: fixed;
  top: 15px;
  right: 15px;
  background: white;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  border: none;
  font-size: 26px;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

/* PRINT FIX */
@page {
  size: A4;
  margin: 10mm;
}

@media print {
  .page { box-shadow: none; }
  .menu-btn { display: none; }

  table, tr, td, th { page-break-inside: avoid; }

  body {
    background: url('${baseUrl}/logo.png') no-repeat center center !important;
    background-size: 45% !important;
    background-attachment: fixed !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    background-color: #345051z !important;
  }

}

/* PAGE NUMBER */
.page-number:after {
  content: counter(page);
}

</style>
</head>

<body>

<div class="page">

<div class="watermark"></div>

<div class="header">
  <div style="display:flex;gap:10px ; align-items:center" >
    <img src="/logo.png" class="logo" />
    <div>
    <div>
    <h1 >${data.company}</h1>
    <div>${data.tagLine}</div>
    </div>
    <div>
    <div>${data.location}</div>
    <div>Phone: ${data.phone}</div>
    </div>
    </div>
  </div>

  <div style="text-align:right">
    <b>Invoice No:</b> ${invoiceNo}<br/>
    <b>Date:</b> ${date}<br/>
    <b>Day:</b> ${day}
  </div>
</div>

<div class="bill-box">
  <b>Bill To</b><br/>
  Name: ${data.client.name}<br/>
  Address: ${data.client.address}<br/>
  Phone: ${data.client.phone}
</div>

<table>
<thead>
<tr>
  <th>#</th>
  <th>Product</th>
  <th>Qty</th>
  <th>Sqft</th>
  <th>Rate</th>
  <th>Total</th>
</tr>
</thead>
<tbody>
${data.items.map((item: any, i: number) => {
    const sqft = item.sqft ? Number(item.qty) * (item.sqft as number) : "-";
    const rate = item.sqft ? item.rate : item.price;
    const total = item.sqft ? sqft as number * item.rate : item.qty * item.price;
    return `
<tr>
  <td>${i + 1}</td>
  <td>${item.name}</td>
  <td>${item.qty}</td>
  <td>${sqft}</td>
  <td>₹${rate}</td>
  <td>₹${total.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}</td>
</tr>`;
  }).join("")}
</tbody>
</table>

<!-- FOOTER LAST PAGE -->
<div class="footer">

<div style="display:flex; justify-content:flex-end; margin-top:18px;">
  <div class="total-summary-box">

    <div class="summary-row">
      <span>Sub Total</span>
      <span>₹${subTotal.toLocaleString("en-IN",{minimumFractionDigits:2})}</span>
    </div>

    ${discountPercent > 0 ? `
    <div class="summary-row discount">
      <span>Discount (${discountPercent}%)</span>
      <span>- ₹${percentDiscountAmount.toLocaleString("en-IN",{minimumFractionDigits:2})}</span>
    </div>` : ""}

    ${discountFlat > 0 ? `
    <div class="summary-row discount">
      <span>Flat Discount</span>
      <span>- ₹${discountFlat.toLocaleString("en-IN",{minimumFractionDigits:2})}</span>
    </div>` : ""}

    <div class="summary-divider"></div>

    <div class="grand-total-row">
      <span>Grand Total</span>
      <span>₹${grandTotal.toLocaleString("en-IN",{minimumFractionDigits:2})}</span>
    </div>

    <div class="amount-words">
      Amount in Words: <b>${amountInWords(grandTotal)}</b>
    </div>

  </div>
</div>





<div class="signature">
  For ${data.company}
  Authorized Signatory
</div>

</div>

</div>

<button class="menu-btn" onclick="window.print()">⋮</button>

</body>
</html>
`);

  win.document.close();
  setTimeout(() => win.focus(), 300);
};

