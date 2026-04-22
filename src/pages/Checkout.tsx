import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { StoreLayout } from "@/components/StoreLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { formatJPY } from "@/lib/format";
import { toast } from "sonner";

const schema = z.object({
  customer_name: z.string().trim().min(1).max(200),
  customer_email: z.string().trim().email().max(255),
  customer_phone: z.string().trim().max(50).optional().or(z.literal("")),
  shipping_address: z.string().trim().min(1).max(500),
  shipping_city: z.string().trim().min(1).max(100),
  shipping_country: z.string().trim().min(1).max(100),
  shipping_postal: z.string().trim().max(30).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export default function Checkout() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    shipping_address: "",
    shipping_city: "",
    shipping_country: "Japan",
    shipping_postal: "",
    notes: "",
  });

  if (items.length === 0) {
    return (
      <StoreLayout>
        <div className="container py-16 text-center">
          <p className="text-muted-foreground mb-4">Your cart is empty.</p>
          <Button onClick={() => navigate("/shop")}>Back to shop</Button>
        </div>
      </StoreLayout>
    );
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error("Please check your details", { description: parsed.error.issues[0].message });
      return;
    }
    setSubmitting(true);
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        ...parsed.data,
        customer_phone: parsed.data.customer_phone || null,
        shipping_postal: parsed.data.shipping_postal || null,
        notes: parsed.data.notes || null,
        total_jpy: total,
        status: "pending",
      })
      .select()
      .single();

    if (error || !order) {
      toast.error("Couldn't place order", { description: error?.message });
      setSubmitting(false);
      return;
    }

    const orderItems = items.map((i) => ({
      order_id: order.id,
      product_id: i.id,
      product_name: i.name,
      unit_price_jpy: i.price_jpy,
      quantity: i.quantity,
      subtotal_jpy: i.price_jpy * i.quantity,
    }));

    const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
    if (itemsErr) {
      toast.error("Couldn't save items", { description: itemsErr.message });
      setSubmitting(false);
      return;
    }

    clear();
    toast.success(`Order ${order.order_number} placed!`);
    navigate(`/order-confirmed/${order.order_number}`);
  }

  return (
    <StoreLayout>
      <div className="container py-12 max-w-5xl">
        <h1 className="font-serif text-4xl mb-8">Checkout</h1>
        <form onSubmit={placeOrder} className="grid md:grid-cols-[1fr_360px] gap-8">
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full name *</Label>
                <Input id="name" required maxLength={200} value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" required maxLength={255} value={form.customer_email}
                  onChange={(e) => setForm({ ...form, customer_email: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" maxLength={50} value={form.customer_phone}
                onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="address">Shipping address *</Label>
              <Textarea id="address" required maxLength={500} value={form.shipping_address}
                onChange={(e) => setForm({ ...form, shipping_address: e.target.value })} />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input id="city" required maxLength={100} value={form.shipping_city}
                  onChange={(e) => setForm({ ...form, shipping_city: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="postal">Postal code</Label>
                <Input id="postal" maxLength={30} value={form.shipping_postal}
                  onChange={(e) => setForm({ ...form, shipping_postal: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="country">Country *</Label>
                <Input id="country" required maxLength={100} value={form.shipping_country}
                  onChange={(e) => setForm({ ...form, shipping_country: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" maxLength={1000} value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>

          <aside className="bg-card border border-border rounded-lg p-6 h-fit space-y-4 sticky top-20">
            <h2 className="font-serif text-xl">Order summary</h2>
            <div className="space-y-2 text-sm">
              {items.map((i) => (
                <div key={i.id} className="flex justify-between gap-4">
                  <span className="text-foreground/80">{i.name} × {i.quantity}</span>
                  <span className="font-medium">{formatJPY(i.price_jpy * i.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4 flex justify-between text-lg">
              <span>Total</span>
              <span className="font-semibold text-primary">{formatJPY(total)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              This is a demo checkout — no payment will be processed. Your order will appear in the admin dashboard.
            </p>
            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Placing..." : "Place order"}
            </Button>
          </aside>
        </form>
      </div>
    </StoreLayout>
  );
}
