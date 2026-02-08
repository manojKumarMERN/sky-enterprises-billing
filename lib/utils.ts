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

  const total = data.items.reduce(
    (sum: number, item: any) => sum + item.qty * item.price,
    0
  );

  const discountPercent = data.discountPercent || 0;
  const discountFlat = data.discountFlat || 0;

  const subTotal = data.items.reduce((sum: number, item: any) => {
    if (item.sqft && item.rate) {
      return sum + item.qty * item.sqft * item.rate;
    }
    return sum + item.qty * item.price;
  }, 0);

  const percentDiscountAmount = (subTotal * discountPercent) / 100;
  const finalDiscount = percentDiscountAmount + discountFlat;
  const grandTotal = subTotal - finalDiscount;

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
* { box-sizing: border-box; }

html, body {
  height: 100%;
  margin: 0;
}

body {
  font-family: "Segoe UI", Arial, sans-serif;
  background: #f4f6fb;
  padding: 15px;
}

/* MAIN INVOICE BOX */
.invoice-box {
  max-width: 900px;
  margin: auto;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.12);

  min-height: 95vh; /* FULL PAGE HEIGHT */
  display: flex;
  flex-direction: column;
}

/* HEADER */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 3px solid #2563eb;
  padding-bottom: 15px;
  margin-bottom: 20px;
}

.logo { height: 60px; }

h1 {
  margin: 0;
  font-size: 22px;
  color: #2563eb;
}

.tagline {
  font-size: 12px;
  color: #6b7280;
}

.bill-box {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
}

/* TABLE */
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th {
  background: linear-gradient(135deg, #2563eb, #06b6d4);
  color: white;
  padding: 10px;
}

td {
  border: 1px solid #ddd;
  padding: 8px;
}

tr:nth-child(even) {
  background: #f9fafb;
}

/* TOTAL BOX */
.total-box {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  padding: 12px 20px;
  font-size: 20px;
  border-radius: 8px;
  font-weight: bold;
  display: inline-block;
}

/* SIGNATURE */
.signature {
  display: flex;
  justify-content: flex-end;
  margin-top: 35px;
}

.line {
  border-top: 1px solid #000;
  width: 200px;
  margin-top: 20px;
}

/* FOOTER PUSH */
.invoice-footer {
  margin-top: auto; /* THIS PUSHES FOOTER TO BOTTOM */
}

/* PRINT MODE */
@media print {
  body { background: white; }
  .invoice-box { box-shadow: none; border: none; }
}
</style>
</head>

<body>
<div class="invoice-box">

<!-- HEADER -->
<div class="header">
  <div>
    <img src="/logo.png" class="logo" />
    <h1>${data.company}</h1>
    <div class="tagline">${data.tagLine}</div>
    <div>${data.location}</div>
    <div>Phone: ${data.phone}</div>
  </div>

 <div style="text-align:right">
  <div style="font-size:16px;font-weight:bold;color:#111">
    Invoice No: <span style="color:#2563eb">${invoiceNo}</span>
  </div>
  <div><b>Date:</b> ${date}</div>
  <div><b>Day:</b> ${day}</div>
</div>

</div>

<!-- CLIENT -->
<div class="bill-box">
  <b>Bill To</b><br/>
  Name: ${data.client.name}<br/>
  Address: ${data.client.address}<br/>
  phone: ${data.client.phone}
</div>

<!-- TABLE -->
<table>
<thead>
<tr>
  <th>S.No</th>
  <th>Product</th>
  <th>Qty</th>
  <th>Total Sqft</th>
  <th>Price / Rate (₹)</th>
  <th>Total (₹)</th>
</tr>
</thead>

<tbody>
${data.items.map((item: any, i: number) => {
    const totalSqft = item.sqft ? item.qty * item.sqft : 0;
    const unitPrice = item.sqft ? item.rate || 0 : item.price;
    const total = item.sqft ? totalSqft * (item.rate || 0) : item.qty * item.price;

    return `
  <tr>
    <td>${i + 1}</td>
    <td>${item.name}</td>
    <td style="text-align:center">${item.qty}</td>
    <td style="text-align:center">${item.sqft ? totalSqft : "-"}</td>
    <td style="text-align:right">₹${unitPrice}</td>
    <td style="text-align:right"><b>₹${total}</b></td>
  </tr>`;
  }).join("")}
</tbody>
</table>


<!-- FOOTER START -->
<div class="invoice-footer">

<!-- TOTAL SUMMARY -->
<div style="display:flex; justify-content:flex-end; margin-top:20px;">
  <div style="min-width:300px; border:1px solid #ddd; padding:12px 15px; border-radius:8px; background:#f9fafb; font-size:14px;">

    <div style="display:flex; justify-content:space-between;">
      <span>Sub Total</span>
      <span>₹${subTotal.toFixed(2)}</span>
    </div>

    ${discountPercent > 0 ? `
    <div style="display:flex; justify-content:space-between; color:red;">
      <span>Discount (${discountPercent}%)</span>
      <span>- ₹${percentDiscountAmount.toFixed(2)}</span>
    </div>` : ""}

    ${discountFlat > 0 ? `
    <div style="display:flex; justify-content:space-between; color:red;">
      <span>Flat Discount</span>
      <span>- ₹${discountFlat.toFixed(2)}</span>
    </div>` : ""}

    <div style="border-top:1px solid #ddd; margin-top:8px; padding-top:8px; text-align:right;">
      <div class="total-box">
        Grand Total: ₹${grandTotal.toFixed(2)}
      </div>
    </div>

  </div>
</div>

<!-- SIGNATURE -->
<div class="signature">
  <div style="text-align:right;">
    For ${data.company}
    <div class="line"></div>
    <div style="font-size:12px;color:#666">Authorized Signatory</div>
  </div>
</div>

</div> <!-- FOOTER END -->

</div>
</body>
</html>

  `);

  win.document.close();

  setTimeout(() => {
    win.focus();
    win.print();
    win.close();
  }, 500);

};
