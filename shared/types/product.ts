export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  qty: number;        // For normal items & Wooden Boards if needed
  price: number;      // For normal items
  sqft?: number;      // Optional, for Wooden Boards / Finishes
  rate?: number;      // Optional, rate per sqft for Wooden Boards / Finishes
};
