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

  setItem: (data: Partial<Product>) => void;
  addOrUpdateItem: () => void;
  editItem: (item: Product) => void;
  deleteItem: (id: string) => void;
  resetTemp: () => void;
};

const emptyItem = (): Product => ({
  id: uuidv4(),
  name: "",
  description: "",
  qty: 1,
  price: 0,
});

export const useBillingStore = create<BillingStore>((set, get) => ({
  // ===== CLIENT =====
  clientDetail: {
    name: "",
    address: "",
    phone: "",
  },

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

      const exists = state.items.some(
        (item) =>
          item.name.trim().toLowerCase() === newItem.name.trim().toLowerCase() &&
          item.price === newItem.price &&
          item.id !== newItem.id
      );

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
  editItem: (item) =>
    set(() => ({
      tempItem: item,
      isEditing: true,
    })),

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
