"use client";

import { useEffect, useState } from "react";
import { amountInWords } from "@/lib/utils";

export default function InvoicePreviewPage() {
  const [payload, setPayload]   = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [logoSrc, setLogoSrc]   = useState<string>("");

  useEffect(() => {
    const raw = sessionStorage.getItem("invoice_preview");
    if (raw) setPayload(JSON.parse(raw));

    fetch("/logo.png")
      .then((res) => res.arrayBuffer())
      .then((buf) => {
        const bytes = new Uint8Array(buf);
        let binary = "";
        bytes.forEach((b) => (binary += String.fromCharCode(b)));
        setLogoSrc(`data:image/png;base64,${window.btoa(binary)}`);
      })
      .catch(() => setLogoSrc(""));
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const wrapper = document.getElementById("menuWrapper");
      if (wrapper && !wrapper.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const handleDownloadPdf = async () => {
    setMenuOpen(false);
    setLoading(true);

    try {
      const html2pdf = (await import("html2pdf.js")).default;

      // ✅ Capture ONLY the invoice page div — not the whole body
      // This is the key fix for extra pages
      const element  = document.getElementById("invoice-page")!;
      const menuWrap = document.getElementById("menuWrapper")!;
      menuWrap.style.display = "none";

      await html2pdf()
        .set({
          margin: 0,
          filename: `Invoice-${payload.invoiceNo}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#345051",
            logging: false,
            imageTimeout: 0,
            // ✅ Match exact A4 pixel dimensions at 96dpi
            // 210mm = 794px, 297mm = 1123px
            windowWidth: 794,
            windowHeight: 1123,
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(element)
        .save();

    } catch (err: any) {
      alert("PDF failed: " + err.message);
    } finally {
      const menuWrap = document.getElementById("menuWrapper");
      if (menuWrap) menuWrap.style.display = "block";
      setLoading(false);
    }
  };

  const handlePrint = () => {
    setMenuOpen(false);
    window.print();
  };

  if (!payload) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", background: "#0f172a", color: "#f9fafb", fontFamily: "Arial",
      }}>
        Loading invoice...
      </div>
    );
  }

  const { data, invoiceNo, date, day, subTotal, percentDiscountAmount, grandTotal, amountWords } = payload;
  const discountPercent = data.discountPercent || 0;
  const discountFlat    = data.discountFlat    || 0;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

        /*
         * ✅ FIX 1: body has NO background, NO padding, NO margin
         * The dark body background was being captured as extra pages
         */
        html, body {
          margin: 0;
          padding: 0;
          background: #0f172a;
          font-family: Arial, sans-serif;
        }

        /*
         * ✅ FIX 2: .page is EXACTLY A4 — fixed height not min-height
         * overflow:hidden ensures content beyond A4 doesn't create extra pages
         */
        .page {
          width: 210mm;
          height: 297mm;
          overflow: hidden;
          padding: 12mm;
          margin: 0 auto;
          position: relative;
          display: flex;
          flex-direction: column;
          background:
            radial-gradient(circle at top right, rgba(255,255,255,0.12), transparent 40%),
            radial-gradient(circle at bottom left, rgba(255,255,255,0.08), transparent 50%),
            #345051;
          color: #f9fafb;
        }

        .watermark {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 380px; height: auto;
          opacity: 0.18; z-index: 0; pointer-events: none;
        }

        .header {
          position: relative; z-index: 1;
          display: flex; justify-content: space-between; align-items: flex-start;
          padding-bottom: 12px; border-bottom: 2px solid rgba(255,255,255,0.2); margin-bottom: 4px;
        }
        .header-left  { display: flex; gap: 10px; align-items: center; }
        .logo         { height: 65px; }
        .company-name { font-size: 22px; color: #ffb703; font-weight: 700; margin-bottom: 2px; }
        .company-sub  { font-size: 13px; color: #e5e7eb; }
        .invoice-meta { text-align: right; font-size: 13px; color: #e5e7eb; line-height: 1.8; }

        .bill-box {
          position: relative; z-index: 1;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2);
          padding: 12px; border-radius: 10px; margin: 12px 0; font-size: 13px; line-height: 1.8;
        }

        table { position: relative; z-index: 1; width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px; }
        th    { background: #1e2a2a; color: #f9fafb; padding: 10px; font-weight: 600; text-align: left; }
        td    { padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.12); color: #f9fafb; }
        tr:nth-child(even) td { background: rgba(255,255,255,0.03); }

        .footer { margin-top: auto; text-align: right; position: relative; z-index: 1; }

        .project-desc-box {
          margin-top: 14px; padding: 14px 16px; border-radius: 12px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15);
          font-size: 13px; line-height: 1.6; text-align: justify; position: relative; z-index: 1;
        }
        .desc-title { font-weight: 700; color: #ffb703; margin-bottom: 6px; font-size: 14px; text-transform: uppercase; }

        .summary-wrapper { display: flex; justify-content: flex-end; margin-top: 18px; position: relative; z-index: 1; }
        .summary-box {
          width: 100%; padding: 18px 20px; border-radius: 18px;
          background: rgba(255,255,255,0.10); border: 1px solid rgba(255,255,255,0.2);
          font-size: 14px; color: #f9fafb;
        }
        .summary-row      { display: flex; justify-content: space-between; padding: 4px 0; font-weight: 500; }
        .discount         { color: #f87171; }
        .summary-divider  { border-top: 1px dashed rgba(255,255,255,0.3); margin: 10px 0; }
        .grand-total-row  { display: flex; justify-content: space-between; font-size: 20px; font-weight: 800; }
        .grand-total-amount { color: #22c55e; }
        .amount-words     { margin-top: 6px; font-size: 12px; font-style: italic; color: rgba(255,255,255,0.8); }
        .signature        { margin-top: 20px; font-size: 13px; color: #e5e7eb; line-height: 1.8; }

        /* ── MENU ── */
        .menu-wrapper { position: fixed; top: 20px; right: 20px; z-index: 9999; }
        .menu-btn {
          width: 48px; height: 48px; border-radius: 50%;
          background: #fff; border: none; font-size: 24px; font-weight: bold;
          cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center; color: #111;
        }
        .menu-btn:hover { background: #f3f4f6; }
        .menu-dropdown {
          position: absolute; right: 0; top: 56px; background: #fff;
          border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          overflow: hidden; min-width: 180px;
        }
        .menu-item {
          width: 100%; padding: 13px 16px; border: none; background: white;
          text-align: left; font-size: 14px; cursor: pointer; color: #111;
          display: flex; align-items: center; gap: 10px;
        }
        .menu-item:hover { background: #f3f4f6; }

        /* ── LOADING ── */
        .loading-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 99999;
          display: flex; align-items: center; justify-content: center;
          flex-direction: column; gap: 12px; color: white; font-size: 18px;
        }
        .spinner {
          width: 48px; height: 48px;
          border: 5px solid rgba(255,255,255,0.2);
          border-top-color: #22c55e; border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── PRINT ── */
        @page {
          size: A4;
          margin: 0; /* ✅ no browser margin = no extra blank space */
        }

        @media print {
          /* ✅ FIX 3: Hide everything except .page during print */
          html, body {
            margin: 0;
            padding: 0;
            width: 210mm;
            height: 297mm;
            overflow: hidden;   /* ✅ prevents extra print pages */
            background: #345051 !important;
          }

          /* ✅ FIX 4: Hide menu and overlay */
          .menu-wrapper,
          .loading-overlay {
            display: none !important;
          }

          /* ✅ FIX 5: Page sits flush, no margin, no page break */
          .page {
            margin: 0 !important;
            box-shadow: none;
            page-break-after: avoid;
            page-break-before: avoid;
            page-break-inside: avoid;
            break-after: avoid;
            break-before: avoid;
            break-inside: avoid;
          }
        }
      `}</style>

      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <div>Generating PDF, please wait...</div>
        </div>
      )}

      <div className="menu-wrapper" id="menuWrapper">
        <button className="menu-btn" onClick={() => setMenuOpen(o => !o)}>⋮</button>
        {menuOpen && (
          <div className="menu-dropdown">
            <button className="menu-item" onClick={handleDownloadPdf}>⬇ Download PDF</button>
            <button className="menu-item" onClick={handlePrint}>🖨 Print</button>
          </div>
        )}
      </div>

      <div className="page" id="invoice-page">
        {logoSrc && <img src={logoSrc} className="watermark" alt="" />}

        <div className="header">
          <div className="header-left">
            {logoSrc && <img src={logoSrc} className="logo" alt="Logo" />}
            <div>
              <div className="company-name">{data.company}</div>
              <div className="company-sub">{data.tagLine}</div>
              <div className="company-sub">{data.location}</div>
              <div className="company-sub">Phone: {data.phone}</div>
            </div>
          </div>
          <div className="invoice-meta">
            <b>Invoice No:</b> {invoiceNo}<br />
            <b>Date:</b> {date}<br />
            <b>Day:</b> {day}
          </div>
        </div>

        <div className="bill-box">
          <b>Bill To</b><br />
          Name: {data.client.name}<br />
          Address: {data.client.address}<br />
          Phone: {data.client.phone}
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th><th>Product</th><th>Qty</th>
              <th>Sqft</th><th>Rate</th><th>Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item: any, i: number) => {
              const sqft  = item.sqft ? Number(item.qty) * Number(item.sqft) : null;
              const rate  = item.sqft ? item.rate : item.price;
              const total = sqft != null ? sqft * item.rate : item.qty * item.price;
              return (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.qty}</td>
                  <td>{sqft != null ? sqft : "-"}</td>
                  <td>₹{rate}</td>
                  <td>₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="footer">
          {data.projectDescriptionEnabled && data.projectDescription && (
            <div className="project-desc-box">
              <div className="desc-title">Project Description</div>
              <div dangerouslySetInnerHTML={{ __html: data.projectDescription.replace(/\n/g, "<br/>") }} />
            </div>
          )}

          <div className="summary-wrapper">
            <div className="summary-box">
              <div className="summary-row">
                <span>Sub Total</span>
                <span>₹{subTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              {discountPercent > 0 && (
                <div className="summary-row discount">
                  <span>Discount ({discountPercent}%)</span>
                  <span>- ₹{percentDiscountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              {discountFlat > 0 && (
                <div className="summary-row discount">
                  <span>Flat Discount</span>
                  <span>- ₹{discountFlat.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="summary-divider" />
              <div className="grand-total-row">
                <span>Grand Total</span>
                <span className="grand-total-amount">
                  ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="amount-words">
                Amount in Words: <b>{amountWords}</b>
              </div>
            </div>
          </div>

          <div className="signature">
            For {data.company}<br />
            Authorized Signatory
          </div>
        </div>
      </div>
    </>
  );
}