import { useBillingStore } from "@/store/useBillingStore";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const useTotalAmount = () =>
  useBillingStore((s) =>
    s.items.reduce((sum, i) => sum + i.qty * i.price, 0)
  );

export const handleDownload = (data: any) => {
  const today = new Date();
  const date = today.toLocaleDateString();
  const day = today.toLocaleString("en-IN", { weekday: "long" });

  const total = data.items.reduce(
    (sum: number, item: any) => sum + item.qty * item.price,
    0
  );

  const win = window.open("", "", "width=900,height=700");
  if (!win) return;

  win.document.write(`
  <html>
    <head>
      <title>Invoice</title>
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: "Segoe UI", Arial, sans-serif;
          background: #f4f6fb;
          padding: 20px;
        }

        .invoice-box {
          max-width: 900px;
          margin: auto;
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.12);
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }

        .logo {
          height: 60px;
        }

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

        .total-box {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          padding: 12px 20px;
          font-size: 20px;
          border-radius: 8px;
          font-weight: bold;
          display: inline-block;
        }

        .signature {
          display: flex;
          justify-content: space-between;
          margin-top: 50px;
        }

        .line {
          border-top: 1px solid #000;
          width: 200px;
          margin-top: 40px;
        }

        @media print {
          body {
            background: white;
          }
          .invoice-box {
            box-shadow: none;
            border: none;
          }
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

          <div>
            <div><b>Date:</b> ${date}</div>
            <div><b>Day:</b> ${day}</div>
          </div>
        </div>

        <!-- CLIENT -->
        <div class="bill-box">
          <b>Bill To</b><br/>
          Name: ${data.client.name}<br/>
          Address: ${data.client.address}
        </div>

        <!-- TABLE -->
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Product / Description</th>
              <th>Qty</th>
              <th>Price (₹)</th>
              <th>Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map((item: any, i: number) => `
              <tr>
                <td>${i + 1}</td>
                <td>${item.name}</td>
                <td style="text-align:center">${item.qty}</td>
                <td style="text-align:right">₹${item.price}</td>
                <td style="text-align:right"><b>₹${item.qty * item.price}</b></td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <!-- TOTAL -->
        <div style="text-align:right; margin-top:20px;">
          <div class="total-box">Grand Total: ₹${total}</div>
        </div>

        <!-- SIGNATURE -->
        <div class="signature">
          <div>
            Customer Signature
            <div class="line"></div>
          </div>

          <div style="text-align:right">
            For ${data.company}
            <div class="line"></div>
            <div style="font-size:12px;color:#666">Authorized Signatory</div>
          </div>
        </div>

      </div>
    </body>
  </html>
  `);

  win.document.close();
  win.print();
};
