import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveImage } from "@/lib/images";
import { Eye, MousePointerClick, ShoppingCart } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

type TopProduct = { id: string; name: string; image_url: string | null; view_count: number };
type DailyView = { day: string; views: number };

export default function AdminAnalytics() {
  const [top, setTop] = useState<TopProduct[]>([]);
  const [views7d, setViews7d] = useState(0);
  const [viewsToday, setViewsToday] = useState(0);
  const [orders7d, setOrders7d] = useState(0);
  const [conversion, setConversion] = useState(0);
  const [daily, setDaily] = useState<DailyView[]>([]);

  useEffect(() => {
    document.title = "Analytics — Admin";
    (async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
      const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);

      const [topRes, viewsRes, todayRes, ordersRes] = await Promise.all([
        supabase.from("products").select("id,name,image_url,view_count").order("view_count", { ascending: false }).limit(5),
        supabase.from("product_views").select("viewed_at").gte("viewed_at", sevenDaysAgo),
        supabase.from("product_views").select("*", { count: "exact", head: true }).gte("viewed_at", startOfDay.toISOString()),
        supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
      ]);

      setTop(topRes.data ?? []);
      const viewRows = viewsRes.data ?? [];
      setViews7d(viewRows.length);
      setViewsToday(todayRes.count ?? 0);
      const ordersCount = ordersRes.count ?? 0;
      setOrders7d(ordersCount);
      setConversion(viewRows.length ? (ordersCount / viewRows.length) * 100 : 0);

      // Aggregate per day
      const buckets: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
        buckets[d.toISOString().slice(0, 10)] = 0;
      }
      viewRows.forEach((v) => {
        const k = new Date(v.viewed_at).toISOString().slice(0, 10);
        if (k in buckets) buckets[k]++;
      });
      setDaily(Object.entries(buckets).map(([day, views]) => ({
        day: new Date(day).toLocaleDateString("en-US", { weekday: "short" }),
        views,
      })));
    })();
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-7xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl">Analytics</h1>
        <p className="text-muted-foreground mt-1">Live traffic, popular masks, and conversion rate.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Views today</span>
            <Eye className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-semibold">{viewsToday}</div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Views (7 days)</span>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2 text-2xl font-semibold">{views7d}</div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Orders (7 days)</span>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2 text-2xl font-semibold">{orders7d}</div>
        </CardContent></Card>
        <Card className="border-primary/30"><CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Conversion rate</span>
          </div>
          <div className="mt-2 text-2xl font-semibold text-primary">{conversion.toFixed(2)}%</div>
        </CardContent></Card>
      </div>

      <Card className="mt-8">
        <CardHeader><CardTitle className="font-serif">Daily views — last 7 days</CardTitle></CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader><CardTitle className="font-serif">Most-viewed masks</CardTitle></CardHeader>
        <CardContent>
          {top.length === 0 ? (
            <p className="text-sm text-muted-foreground">No views yet.</p>
          ) : (
            <div className="space-y-3">
              {top.map((p, i) => (
                <div key={p.id} className="flex items-center gap-4">
                  <span className="font-serif text-2xl text-muted-foreground w-6">{i + 1}</span>
                  <img src={resolveImage(p.image_url)} alt="" className="h-12 w-12 rounded object-cover" />
                  <span className="flex-1 font-medium">{p.name}</span>
                  <span className="text-sm text-muted-foreground">{p.view_count} views</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
