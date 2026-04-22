import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StoreLayout } from "@/components/StoreLayout";
import { supabase } from "@/integrations/supabase/client";
import { resolveImage } from "@/lib/images";
import { formatJPY } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type Product = {
  id: string;
  name: string;
  price_jpy: number;
  image_url: string | null;
  category: string | null;
  stock: number;
};

export default function Shop() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [filter, setFilter] = useState<string>("All");

  useEffect(() => {
    document.title = "Shop — Raksha & Co.";
    supabase
      .from("products")
      .select("id,name,price_jpy,image_url,category,stock")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => setProducts(data ?? []));
  }, []);

  const categories = ["All", ...Array.from(new Set((products ?? []).map((p) => p.category).filter(Boolean) as string[]))];
  const filtered = filter === "All" ? products ?? [] : (products ?? []).filter((p) => p.category === filter);

  return (
    <StoreLayout>
      <div className="container py-12 md:py-16">
        <div className="mb-10">
          <span className="text-xs uppercase tracking-[0.3em] text-primary">Collection</span>
          <h1 className="mt-2 font-serif text-4xl md:text-5xl">All masks</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Every piece below is unique, carved and painted by hand. Stock counts reflect physical inventory at our Ambalangoda workshop.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                filter === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent border-border text-foreground/70 hover:border-primary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {!products ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-5 mt-4 w-2/3" />
                <Skeleton className="h-4 mt-2 w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <Link key={p.id} to={`/product/${p.id}`} className="group block animate-fade-in">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                  <img
                    src={resolveImage(p.image_url)}
                    alt={p.name}
                    loading="lazy"
                    width={1024}
                    height={1024}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {p.stock <= 3 && p.stock > 0 && (
                    <Badge className="absolute top-3 left-3 bg-secondary text-secondary-foreground">Only {p.stock} left</Badge>
                  )}
                  {p.stock === 0 && (
                    <Badge variant="destructive" className="absolute top-3 left-3">Sold out</Badge>
                  )}
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <h3 className="font-serif text-xl">{p.name}</h3>
                  <span className="text-primary font-semibold">{formatJPY(p.price_jpy)}</span>
                </div>
                {p.category && <p className="text-xs uppercase tracking-wider text-muted-foreground">{p.category}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
