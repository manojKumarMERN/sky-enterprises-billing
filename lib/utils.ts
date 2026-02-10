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


export const handleDownload = (data: any, saveInvoiceToLocal: (d: any) => void) => {
  const today = new Date();
  const date = today.toLocaleDateString();
  const day = today.toLocaleString("en-IN", { weekday: "long" });

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

/* HEADER */
.header {
  display: flex;
  justify-content: space-between;
  border-bottom: 3px solid #2563eb;
  padding-bottom: 10px;
}

.logo { height: 50px; }

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
  body { background: white; }
  .page { box-shadow: none; }
  .menu-btn { display: none; }

  table, tr, td, th { page-break-inside: avoid; }
}

/* PAGE NUMBER */
.page-number:after {
  content: counter(page);
}

</style>
</head>

<body>

<div class="page">

<div class="header">
  <div>
    <img src="/logo.png" class="logo" />
    <h1>${data.company}</h1>
    <div>${data.tagLine}</div>
    <div>${data.location}</div>
    <div>Phone: ${data.phone}</div>
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
  <td>₹${total}</td>
</tr>`;
  }).join("")}
</tbody>
</table>

<!-- FOOTER LAST PAGE -->
<div class="footer">

<div style="display:flex; justify-content:flex-end;">
  <div style="border:1px solid #ddd;padding:10px;border-radius:6px;">
    <div>Sub Total: ₹${subTotal.toFixed(2)}</div>
    ${discountPercent > 0 ? `<div style="color:red">Discount: -₹${percentDiscountAmount.toFixed(2)}</div>` : ""}
    ${discountFlat > 0 ? `<div style="color:red">Flat Discount: -₹${discountFlat.toFixed(2)}</div>` : ""}
    <div class="total-box">Grand Total: ₹${grandTotal.toFixed(2)}</div>
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

