import { ClientDetails } from "./client";

export interface BillingItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Invoice {
  invoiceNo: string;
  date: string;
  day: string;
  client: ClientDetails;
  items: BillingItem[];
  grandTotal: number;
}
