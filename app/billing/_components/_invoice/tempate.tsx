"use client";

type InvoiceItem = {
  id: string;
  name: string;
  qty: number;
  price: number;
  sqft?: number;
  rate?: number;
};

type InvoiceData = {
  company: string;
  tagLine: string;
  location: string;
  phone: string;
  client: {
    name: string;
    address: string;
  };
  items: InvoiceItem[];
};

export default function InvoiceTemplate({ data }: { data: InvoiceData }) {
  const date = new Date().toLocaleDateString();
  const day = new Date().toLocaleDateString("en-IN", { weekday: "long" });

  const total = data.items.reduce((sum, item) => {
    if (item.sqft && item.rate) {
      return sum + item.qty * item.sqft * item.rate;
    }
    return sum + item.qty * item.price;
  }, 0);

 return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .invoice-box {
          max-width: 900px;
          margin: auto;
          background: white;
          padding: 20px;
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

        .logo { height: 60px; }

        h1 {
          margin: 0;
          font-size: 22px;
          color: #2563eb;
        }

        .tagline { font-size: 12px; color: #6b7280; }

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

        tr:nth-child(even) { background: #f9fafb; }

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
      `}</style>

      <div className="invoice-box">
        {/* HEADER */}
        <div className="header">
          <div>
            <img src="/logo.png" className="logo" alt="logo" />
            <h1>{data.company}</h1>
            <div className="tagline">{data.tagLine}</div>
            <div>{data.location}</div>
            <div>Phone: {data.phone}</div>
          </div>

          <div>
            <div><b>Date:</b> {date}</div>
            <div><b>Day:</b> {day}</div>
          </div>
        </div>

        {/* CLIENT */}
        <div className="bill-box">
          <b>Bill To</b><br />
          Name: {data.client.name}<br />
          Address: {data.client.address}
        </div>

        {/* TABLE */}
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
    {data.items.map((item, i) => {
      const totalSqft = item.sqft ? item.qty * item.sqft : 0;

      // Rate per sqft OR normal price
      const unitPrice = item.sqft ? item.rate || 0 : item.price;

      // Final total
      const totalPrice = item.sqft
        ? totalSqft * (item.rate || 0)
        : item.qty * item.price;

      return (
        <tr key={item.id}>
          <td>{i + 1}</td>
          <td>{item.name}</td>

          <td>{item.qty}</td>

          <td>{item.sqft ? totalSqft : "-"}</td>

          {/* SINGLE COLUMN */}
          <td>₹{unitPrice}</td>

          {/* TOTAL */}
          <td>
            <b>₹{totalPrice}</b>
          </td>
        </tr>
      );
    })}
  </tbody>
</table>


        {/* TOTAL */}
        <div style={{ textAlign: "right", marginTop: 20 }}>
          <div className="total-box">Grand Total: ₹{total}</div>
        </div>

        {/* SIGNATURE */}
        <div className="signature">
          <div style={{ textAlign: "right" }}>
            For {data.company}
            <div className="line"></div>
            <div style={{ fontSize: 12, color: "#666" }}>Authorized Signatory</div>
          </div>
        </div>
      </div>
    </>
  );
}
