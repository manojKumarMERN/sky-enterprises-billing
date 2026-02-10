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
<title>Invoice</title>
<style>

/* RESET */
* {
  box-sizing: border-box;
  -webkit-print-color-adjust: exact;
}

body {
  font-family: Segoe UI, Arial;
  margin: 0;
  padding: 0;
  background: #f4f6fb;
}

/* PAGE */
.page {
  width: 210mm;
  min-height: 297mm;
  padding: 12mm;
  margin: auto;
  background: white;
  display: flex;
  flex-direction: column;
}

.watermark {
  position: absolute;
  inset: 0;
  background: url('/logo.png') no-repeat center;
  background-size: 400px;
  opacity: 0.38;
  z-index: 0;
}

.page {
  position: relative;
}



/* HEADER */
.header {
  display: flex;
  justify-content: space-between;
  border-bottom: 3px solid #2563eb;
  padding-bottom: 10px;
}

.logo { height: 65px; }

h1 {
  margin: 0;
  font-size: 20px;
  color: #2563eb;
}

/* BILL BOX */
.bill-box {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  padding: 10px;
  border-radius: 6px;
  margin: 10px 0;
}

/* TABLE */
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

th {
  background: #2563eb;
  color: white;
  padding: 8px;
}

td {
  border: 1px solid #ddd;
  padding: 6px;
}

tr:nth-child(even) { background: #f9fafb; }

/* TOTAL BOX */
.total-box {
  background: #16a34a;
  color: white;
  padding: 10px 14px;
  font-size: 18px;
  border-radius: 6px;
  font-weight: bold;
}

/* FOOTER */
.footer {
  margin-top: auto;
  text-align: right;
}

/* SIGN */
.signature {
  margin-top: 20px;
  text-align: right;
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
  <div style="display:flex;align-items:center" >
    <img src="/logo.png" class="logo" />
    <div>
    <div>
    <h1>${data.company}</h1>
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

<div style="display:flex; justify-content:flex-end; margin-top:15px;">
  <div style="
    width:100%;
    border-radius:12px;
    padding:16px;
    background:linear-gradient(135deg,#f8fafc,#eef2ff);
    border:1px solid #c7d2fe;
    font-size:14px;
  ">

    <div style="display:flex; justify-content:space-between;">
      <span>Sub Total</span>
      <span>₹${subTotal.toFixed(2)}</span>
    </div>

    ${discountPercent > 0 ? `
    <div style="display:flex; justify-content:space-between; color:#dc2626;">
      <span>Discount (${discountPercent}%)</span>
      <span>- ₹${percentDiscountAmount.toFixed(2)}</span>
    </div>` : ""}

    ${discountFlat > 0 ? `
    <div style="display:flex; justify-content:space-between; color:#dc2626;">
      <span>Flat Discount</span>
      <span>- ₹${discountFlat.toFixed(2)}</span>
    </div>` : ""}

     <div style="font-size:18px; font-weight:bold;">
    Grand Total: ₹${grandTotal.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}
  </div>

    <!-- Amount in Words -->
    <div style="margin-top:6px; font-size:13px; font-style:italic; color:#374151;">
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

