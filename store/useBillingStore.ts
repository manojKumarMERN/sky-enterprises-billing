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

  setDiscountEnabled: (v: boolean) => void;
  setDiscountPercent: (v: number) => void;
  setDiscountFlat: (v: number) => void;

  setItem: (data: Partial<Product>) => void;
  addOrUpdateItem: () => void;
  editItem: (item: Product) => void;
  deleteItem: (id: string) => void;
  resetTemp: () => void;
};

// Updated emptyItem to include sqft and rate
const emptyItem = (): Product => ({
  id: uuidv4(),
  name: "",
  description: "",
  category: "",
  qty: 1,
  price: 0,
  sqft: undefined, // For Wooden Boards / Finishes
  rate: undefined, // Rate per sqft
});

export const useBillingStore = create<BillingStore>((set, get) => ({
  // ===== CLIENT =====
  clientDetail: {
    name: "",
    address: "",
    phone: "",
  },

  discountEnabled: false,
  discountPercent: 0,
  discountFlat: 0,

  setDiscountEnabled: (v) => set({ discountEnabled: v }),
  setDiscountPercent: (v) => set({ discountPercent: v }),
  setDiscountFlat: (v) => set({ discountFlat: v }),


  setClient: (data) =>
    set((state) => ({
      clientDetail: { ...state.clientDetail, ...data },
    })),

  // ===== PRODUCTS =====
  tempItem: emptyItem(),
  items: [],
  isEditing: false,

  setItem: (data) =>
    set((state) => ({
      tempItem: { ...state.tempItem, ...data },
    })),

  // ADD OR UPDATE
  addOrUpdateItem: () =>
    set((state) => {
      const newItem = state.tempItem;

      // Check for duplicates by name + price (or rate for sqft items)
      const exists = state.items.some((item) => {
        if (newItem.sqft && newItem.rate) {
          // Wooden Boards / Finishes comparison by name + rate
          return (
            item.name.trim().toLowerCase() === newItem.name.trim().toLowerCase() &&
            item.rate === newItem.rate &&
            item.id !== newItem.id
          );
        } else {
          return (
            item.name.trim().toLowerCase() === newItem.name.trim().toLowerCase() &&
            item.price === newItem.price &&
            item.id !== newItem.id
          );
        }
      });

      if (exists) {
        alert("⚠️ Product already added!");
        return state;
      }

      // UPDATE
      if (state.isEditing) {
        return {
          items: state.items.map((item) =>
            item.id === newItem.id ? newItem : item
          ),
          tempItem: emptyItem(),
          isEditing: false,
        };
      }

      // ADD
      return {
        items: [...state.items, newItem],
        tempItem: emptyItem(),
      };
    }),

  // EDIT
  editItem: (item) => {
    console.log(item,"SINGLE_ITEM"),
    set(() => ({
      tempItem: item,
      isEditing: true,

    }))
  },

  // DELETE
  deleteItem: (id) =>
    set((state) => {
      const isEditingDeleted = state.tempItem.id === id;

      return {
        items: state.items.filter((i) => i.id !== id),
        tempItem: isEditingDeleted ? emptyItem() : state.tempItem,
        isEditing: isEditingDeleted ? false : state.isEditing,
      };
    }),

  // RESET FORM
  resetTemp: () =>
    set({
      tempItem: emptyItem(),
      isEditing: false,
    }),
}));
