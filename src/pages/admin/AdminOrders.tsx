import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatJPY, formatDate } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: string;
  shipping_city: string;
  shipping_country: string;
  shipping_postal: string | null;
  total_jpy: number;
  status: string;
  notes: string | null;
  created_at: string;
};

type OrderItem = {
  id: string;
  product_name: string;
  unit_price_jpy: number;
  quantity: number;
  subtotal_jpy: number;
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [items, setItems] = useState<Record<string, OrderItem[]>>({});

  useEffect(() => {
    document.title = "Orders — Admin";
    load();
  }, []);

  async function load() {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data ?? []);
  }

  async function loadItems(orderId: string) {
    if (items[orderId]) return;
    const { data } = await supabase.from("order_items").select("*").eq("order_id", orderId);
    setItems((prev) => ({ ...prev, [orderId]: data ?? [] }));
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Status updated");
    load();
  }

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="p-6 md:p-10 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl">Orders</h1>
          <p className="text-muted-foreground mt-1">Manage customer orders and shipments.</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ({orders.length})</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="p-3 font-medium">Order</th>
                  <th className="p-3 font-medium">Customer</th>
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Total</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-t border-border">
                    <td className="p-3 font-mono text-xs">{o.order_number}</td>
                    <td className="p-3">
                      <div className="font-medium">{o.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{o.customer_email}</div>
                    </td>
                    <td className="p-3 text-muted-foreground">{formatDate(o.created_at)}</td>
                    <td className="p-3 font-semibold">{formatJPY(o.total_jpy)}</td>
                    <td className="p-3">
                      <Badge variant={o.status === "shipped" ? "default" : o.status === "cancelled" ? "destructive" : "secondary"}>
                        {o.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <Dialog onOpenChange={(open) => open && loadItems(o.id)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">View</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl">
                          <DialogHeader>
                            <DialogTitle className="font-serif">Order {o.order_number}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 text-sm">
                            <section>
                              <h4 className="font-medium mb-1">Customer</h4>
                              <p>{o.customer_name}</p>
                              <p className="text-muted-foreground">{o.customer_email}</p>
                              {o.customer_phone && <p className="text-muted-foreground">{o.customer_phone}</p>}
                            </section>
                            <section>
                              <h4 className="font-medium mb-1">Shipping to</h4>
                              <p className="whitespace-pre-line">{o.shipping_address}</p>
                              <p>{o.shipping_city}{o.shipping_postal ? `, ${o.shipping_postal}` : ""}</p>
                              <p>{o.shipping_country}</p>
                            </section>
                            {o.notes && (
                              <section>
                                <h4 className="font-medium mb-1">Notes</h4>
                                <p className="text-muted-foreground">{o.notes}</p>
                              </section>
                            )}
                            <section>
                              <h4 className="font-medium mb-2">Items</h4>
                              <div className="space-y-1">
                                {(items[o.id] ?? []).map((it) => (
                                  <div key={it.id} className="flex justify-between">
                                    <span>{it.product_name} × {it.quantity}</span>
                                    <span>{formatJPY(it.subtotal_jpy)}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-3 pt-3 border-t border-border flex justify-between font-semibold">
                                <span>Total</span>
                                <span className="text-primary">{formatJPY(o.total_jpy)}</span>
                              </div>
                            </section>
                            <section className="border-t border-border pt-4">
                              <h4 className="font-medium mb-2">Update status</h4>
                              <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="shipped">Shipped</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </section>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
