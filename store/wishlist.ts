import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  salePrice: number | null;
  image: string;
  slug: string;
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  toggle: (item: WishlistItem) => void;
  has: (id: string) => boolean;
  clear: () => void;
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((s) =>
          s.items.find((i) => i.id === item.id)
            ? s
            : { items: [...s.items, item] }
        ),
      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      toggle: (item) => {
        const exists = get().items.find((i) => i.id === item.id);
        if (exists) {
          set((s) => ({ items: s.items.filter((i) => i.id !== item.id) }));
        } else {
          set((s) => ({ items: [...s.items, item] }));
        }
      },
      has: (id) => !!get().items.find((i) => i.id === id),
      clear: () => set({ items: [] }),
    }),
    { name: "electro-wishlist" }
  )
);
