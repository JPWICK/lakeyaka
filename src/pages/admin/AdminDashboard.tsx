import { useEffect, useState } from "react";
import { TrendingUp, ShoppingBag, Package, JapaneseYen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { formatJPY, formatDate } from "@/lib/format";
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

type Stats = {
  totalRevenue: number;
  orderCount: number;
  pending: number;
  avgOrder: number;
  productCount: number;
  monthly: { month: string; revenue: number }[];
  recentOrders: { id: string; order_number: string; customer_name: string; total_jpy: number; status: string; created_at: string }[];
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    document.title = "Admin — Raksha & Co.";
    (async () => {
      const [{ data: orders }, { count: productCount }] = await Promise.all([
        supabase.from("orders").select("id,order_number,customer_name,total_jpy,status,created_at").order("created_at", { ascending: false }),
        supabase.from("products").select("*", { count: "exact", head: true }),
      ]);

      const allOrders = orders ?? [];
      const totalRevenue = allOrders.reduce((s, o) => s + o.total_jpy, 0);
      const pending = allOrders.filter((o) => o.status === "pending").length;
      const avgOrder = allOrders.length ? Math.round(totalRevenue / allOrders.length) : 0;

      const months: Record<string, number> = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleDateString("en-US", { month: "short" });
        months[key] = 0;
      }
      allOrders.forEach((o) => {
        const d = new Date(o.created_at);
        const monthsBack = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
        if (monthsBack >= 0 && monthsBack <= 5) {
          const key = d.toLocaleDateString("en-US", { month: "short" });
          months[key] = (months[key] ?? 0) + o.total_jpy;
        }
      });
      const monthly = Object.entries(months).map(([month, revenue]) => ({ month, revenue }));

      setStats({
        totalRevenue,
        orderCount: allOrders.length,
        pending,
        avgOrder,
        productCount: productCount ?? 0,
        monthly,
        recentOrders: allOrders.slice(0, 5),
      });
    })();
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-7xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl">Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back. Here's what's happening at the workshop.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total revenue" value={stats ? formatJPY(stats.totalRevenue) : "—"} icon={JapaneseYen} accent />
        <Stat label="Orders" value={stats ? `${stats.orderCount}` : "—"} sub={stats ? `${stats.pending} pending` : ""} icon={ShoppingBag} />
        <Stat label="Average order" value={stats ? formatJPY(stats.avgOrder) : "—"} icon={TrendingUp} />
        <Stat label="Products" value={stats ? `${stats.productCount}` : "—"} icon={Package} />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="font-serif">Monthly revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={stats?.monthly ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  formatter={(v: number) => formatJPY(v)}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="font-serif">Recent orders</CardTitle>
        </CardHeader>
        <CardContent>
          {stats && stats.recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="space-y-2">
              {(stats?.recentOrders ?? []).map((o) => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <div className="font-medium">{o.order_number}</div>
                    <div className="text-sm text-muted-foreground">{o.customer_name} · {formatDate(o.created_at)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatJPY(o.total_jpy)}</div>
                    <div className={`text-xs uppercase tracking-wider ${o.status === "shipped" ? "text-green-600" : "text-secondary"}`}>{o.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, sub, icon: Icon, accent }: { label: string; value: string; sub?: string; icon: any; accent?: boolean }) {
  return (
    <Card className={accent ? "border-primary/30" : ""}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <Icon className={`h-4 w-4 ${accent ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        <div className={`mt-2 text-2xl font-semibold ${accent ? "text-primary" : ""}`}>{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </CardContent>
    </Card>
  );
}
