import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";

export type CartItem = {
  id: string;
  name: string;
  price_jpy: number;
  image_url: string | null;
  quantity: number;
  stock: number;
};

type CartCtx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  remove: (id: string) => void;
  update: (id: string, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem("raksha_cart");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("raksha_cart", JSON.stringify(items));
  }, [items]);

  const add: CartCtx["add"] = (item, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + qty, item.stock);
        return prev.map((p) => (p.id === item.id ? { ...p, quantity: newQty } : p));
      }
      return [...prev, { ...item, quantity: Math.min(qty, item.stock) }];
    });
    toast.success(`${item.name} added to cart`);
  };

  const remove = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id));
  const update = (id: string, qty: number) =>
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, quantity: Math.max(1, Math.min(qty, p.stock)) } : p)));
  const clear = () => setItems([]);

  const total = items.reduce((s, i) => s + i.price_jpy * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return <Ctx.Provider value={{ items, add, remove, update, clear, total, count }}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
