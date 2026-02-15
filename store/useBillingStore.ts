// store/useBillingStore.ts
import { create } from "zustand";
import { Product } from "@/shared/types";
import { v4 as uuidv4 } from "uuid";

type ClientDetail = {
  name: string;
  address: string;
  phone: string;
};

type BillingStore = {
  clientDetail: ClientDetail;
  setClient: (data: Partial<ClientDetail>) => void;

  tempItem: Product;
  items: Product[];
  isEditing: boolean;

  discountEnabled: boolean;
  discountPercent: number;
  discountFlat: number;
  projectDescriptionEnabled: boolean;
  projectDescription: string;

  editingInvoiceNo: string | null;
  setEditingInvoice: (no: string | null) => void;

  setDiscountEnabled: (v: boolean) => void;
  setDiscountPercent: (v: number) => void;
  setDiscountFlat: (v: number) => void;

  setItem: (data: Partial<Product>) => void;
  addOrUpdateItem: () => void;
  editItem: (item: Product) => void;
  deleteItem: (id: string) => void;
  resetTemp: () => void;
  resetInvoice: () => void;
  generateInvoiceNumber: () => string;

  saveInvoiceToLocal: (invoiceData: any) => string;
  cleanOldInvoices: () => void;
  getSavedInvoices: () => any[];

  loadDraftInvoice: (data: any) => void;
  clearDraftInvoice: () => void;

  setProjectDescriptionEnabled: (v: boolean) => void;
  setProjectDescription: (v: string) => void;
};

const emptyItem = (): Product => ({
  id: uuidv4(),
  name: "",
  description: "",
  category: "",
  qty: 1,
  price: 0,
  sqft: undefined,
  rate: undefined,
});

export const useBillingStore = create<BillingStore>((set, get) => ({
  // ── CLIENT ────────────────────────────────────────────────────────────────
  clientDetail: { name: "", address: "", phone: "" },

  setClient: (data) =>
    set((state) => ({
      clientDetail: { ...state.clientDetail, ...data },
    })),

  // ── DISCOUNT & DESCRIPTION ────────────────────────────────────────────────
  discountEnabled: false,
  discountPercent: 0,
  discountFlat: 0,
  projectDescriptionEnabled: false,
  projectDescription: "",

  setDiscountEnabled:  (v) => set({ discountEnabled: v }),
  setDiscountPercent:  (v) => set({ discountPercent: v }),
  setDiscountFlat:     (v) => set({ discountFlat: v }),
  setProjectDescriptionEnabled: (v) => set({ projectDescriptionEnabled: v }),
  setProjectDescription:        (v) => set({ projectDescription: v }),

  // ── INVOICE EDITING ───────────────────────────────────────────────────────
  editingInvoiceNo: null,
  setEditingInvoice: (no) => set({ editingInvoiceNo: no }),

  // ── PRODUCTS ──────────────────────────────────────────────────────────────
  tempItem: emptyItem(),
  items: [],
  isEditing: false,

  setItem: (data) =>
    set((state) => ({
      tempItem: { ...state.tempItem, ...data },
    })),

  addOrUpdateItem: () =>
    set((state) => {
      const newItem = state.tempItem;

      // ✅ Validate: don't allow empty name
      if (!newItem.name.trim()) {
        alert("⚠️ Product name is required!");
        return state;
      }

      // ✅ Duplicate check
      const exists = state.items.some((item) => {
        if (newItem.sqft && newItem.rate) {
          return (
            item.name.trim().toLowerCase() === newItem.name.trim().toLowerCase() &&
            item.rate === newItem.rate &&
            item.id !== newItem.id
          );
        }
        return (
          item.name.trim().toLowerCase() === newItem.name.trim().toLowerCase() &&
          item.price === newItem.price &&
          item.id !== newItem.id
        );
      });

      if (exists) {
        alert("⚠️ Product already added!");
        return state;
      }

      // UPDATE existing item
      if (state.isEditing) {
        return {
          items: state.items.map((item) =>
            item.id === newItem.id ? newItem : item
          ),
          tempItem: emptyItem(),
          isEditing: false,
        };
      }

      // ADD new item
      return {
        items: [...state.items, newItem],
        tempItem: emptyItem(),
      };
    }),

  editItem: (item) =>
    // ✅ Removed accidental console.log with comma operator
    set(() => ({
      tempItem: item,
      isEditing: true,
    })),

  deleteItem: (id) =>
    set((state) => {
      const isEditingDeleted = state.tempItem.id === id;
      return {
        items: state.items.filter((i) => i.id !== id),
        tempItem: isEditingDeleted ? emptyItem() : state.tempItem,
        isEditing: isEditingDeleted ? false : state.isEditing,
      };
    }),

  resetTemp: () => set({ tempItem: emptyItem(), isEditing: false }),

  // ── INVOICE STORAGE ───────────────────────────────────────────────────────
  generateInvoiceNumber: () =>
    `SKY-INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,

  saveInvoiceToLocal: (invoiceData) => {
    const { editingInvoiceNo, generateInvoiceNumber } = get();

    // ✅ Reuse existing number if editing, otherwise generate new
    const invoiceNo = editingInvoiceNo ?? generateInvoiceNumber();

    const dataToSave = {
      invoiceNo,
      data: invoiceData,
      createdAt: Date.now(),
      expiryTime: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      updatedAt: Date.now(),
    };

    localStorage.setItem(`invoice_${invoiceNo}`, JSON.stringify(dataToSave));

    // ✅ Clear editing state after save
    set({ editingInvoiceNo: null });

    return invoiceNo;
  },

  cleanOldInvoices: () => {
    // ✅ Guard: only run in browser
    if (typeof window === "undefined") return;
    Object.keys(localStorage).forEach((key) => {
      if (!key.startsWith("invoice_")) return;
      const raw = localStorage.getItem(key);
      if (!raw) return;
      try {
        const inv = JSON.parse(raw);
        if (Date.now() > inv.expiryTime) {
          localStorage.removeItem(key);
        }
      } catch {
        // Remove corrupted entries
        localStorage.removeItem(key);
      }
    });
  },

  getSavedInvoices: () => {
    if (typeof window === "undefined") return [];
    return Object.keys(localStorage)
      .filter((k) => k.startsWith("invoice_"))
      .map((k) => {
        try {
          return JSON.parse(localStorage.getItem(k) || "{}");
        } catch {
          return null;
        }
      })
      .filter(Boolean) // ✅ Remove null/corrupt entries
      .sort((a, b) => b.createdAt - a.createdAt); // ✅ Newest first
  },

  loadDraftInvoice: (data) => {
    set({
      clientDetail:              data.client               || { name: "", address: "", phone: "" },
      items:                     data.items                || [],
      discountPercent:           data.discountPercent      || 0,
      discountFlat:              data.discountFlat         || 0,
      projectDescription:        data.projectDescription   || "",
      projectDescriptionEnabled: data.projectDescriptionEnabled || false,
      discountEnabled:           data.discountEnabled      || false,
    });
  },

  clearDraftInvoice: () => {
    localStorage.removeItem("draft_invoice");
  },

  // ── RESET ─────────────────────────────────────────────────────────────────
  resetInvoice: () =>
    set({
      clientDetail:              { name: "", address: "", phone: "" },
      items:                     [],
      tempItem:                  emptyItem(), // ✅ Also reset tempItem
      isEditing:                 false,       // ✅ Also reset isEditing
      discountPercent:           0,
      discountFlat:              0,
      discountEnabled:           false,
      projectDescription:        "",
      projectDescriptionEnabled: false,
    }),
}));