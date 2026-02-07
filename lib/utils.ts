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

export const handleDownload = () => {
  const printContent = document.getElementById("invoice-preview");
  const win = window.open("", "", "width=800,height=600");

  if (!win || !printContent) return;

  win.document.write(`
      <html>
        <head>
          <title>Invoice</title>
          <style>
            body { font-family: Arial; padding: 20px; }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);

  win.document.close();
  win.print();
};