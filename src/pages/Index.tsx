import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, Hammer, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoreLayout } from "@/components/StoreLayout";
import { supabase } from "@/integrations/supabase/client";
import { resolveImage, giniImage } from "@/lib/images";
import { formatJPY } from "@/lib/format";

type Product = {
  id: string;
  name: string;
  price_jpy: number;
  image_url: string | null;
  category: string | null;
};

const Index = () => {
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    supabase
      .from("products")
      .select("id,name,price_jpy,image_url,category")
      .eq("is_active", true)
      .order("view_count", { ascending: false })
      .limit(3)
      .then(({ data }) => setFeatured(data ?? []));
  }, []);

  return (
    <StoreLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero text-primary-foreground">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <img src={heroImage} alt="" className="h-full w-full object-cover" width={1600} height={1200} />
        </div>
        <div className="relative container py-20 md:py-32 grid md:grid-cols-2 gap-10 items-center">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gold">
              <Sparkles className="h-3.5 w-3.5" /> Hand-carved in Ambalangoda
            </span>
            <h1 className="mt-4 font-serif text-5xl md:text-7xl font-bold leading-[1.05]">
              Masks of the <span className="text-gold">Sri Lankan</span> spirit
            </h1>
            <p className="mt-6 text-lg text-primary-foreground/85 max-w-xl">
              Authentic Raksha, Sanni and Kolam masks carved from kaduru wood by third-generation artisans.
              Each piece tells a story — and now ships to Japan.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gold text-secondary-foreground hover:opacity-90 shadow-gold">
                <Link to="/shop">
                  Shop the collection <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-gold text-gold hover:bg-gold hover:text-secondary-foreground bg-transparent">
                <Link to="/about">Our heritage</Link>
              </Button>
            </div>
          </div>
          <div className="relative hidden md:block animate-scale-in">
            <div className="absolute inset-0 bg-gold rounded-full blur-3xl opacity-30" />
            <img src={giniImage} alt="Royal Raksha mask centerpiece" className="relative rounded-lg shadow-elegant" width={800} height={600} />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-border/60 bg-card">
        <div className="container py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="flex items-center gap-3">
            <Hammer className="h-5 w-5 text-primary" />
            <span><strong className="text-foreground">Hand-carved</strong> by master artisans</span>
          </div>
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <span><strong className="text-foreground">One-of-a-kind</strong> — no two masks alike</span>
          </div>
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-primary" />
            <span><strong className="text-foreground">Worldwide shipping</strong> from Colombo</span>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="container py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-primary">Most coveted</span>
            <h2 className="mt-2 font-serif text-4xl">Featured masks</h2>
          </div>
          <Link to="/shop" className="text-sm font-medium text-primary hover:underline hidden sm:inline">
            View all →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((p) => (
            <Link key={p.id} to={`/product/${p.id}`} className="group block">
              <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                <img
                  src={resolveImage(p.image_url)}
                  alt={p.name}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <h3 className="font-serif text-xl">{p.name}</h3>
                <span className="text-primary font-semibold">{formatJPY(p.price_jpy)}</span>
              </div>
              {p.category && <p className="text-xs uppercase tracking-wider text-muted-foreground">{p.category}</p>}
            </Link>
          ))}
        </div>
      </section>
    </StoreLayout>
  );
};

export default Index;
