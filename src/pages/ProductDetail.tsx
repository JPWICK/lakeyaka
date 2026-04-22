import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, Minus, ShoppingBag } from "lucide-react";
import { StoreLayout } from "@/components/StoreLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { resolveImage } from "@/lib/images";
import { formatJPY } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { Skeleton } from "@/components/ui/skeleton";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price_jpy: number;
  image_url: string | null;
  category: string | null;
  stock: number;
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const { add } = useCart();

  useEffect(() => {
    if (!id) return;
    supabase
      .from("products")
      .select("id,name,description,price_jpy,image_url,category,stock")
      .eq("id", id)
      .eq("is_active", true)
      .maybeSingle()
      .then(({ data }) => {
        setProduct(data);
        if (data) document.title = `${data.name} — Raksha & Co.`;
      });

    // Track view
    let sessionId = localStorage.getItem("raksha_session");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("raksha_session", sessionId);
    }
    supabase.rpc("increment_product_view", { _product_id: id, _session: sessionId });
  }, [id]);

  if (!product) {
    return (
      <StoreLayout>
        <div className="container py-12 grid md:grid-cols-2 gap-10">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </StoreLayout>
    );
  }

  const outOfStock = product.stock === 0;

  return (
    <StoreLayout>
      <div className="container py-8 md:py-12">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to shop
        </Link>

        <div className="grid md:grid-cols-2 gap-10">
          <div className="aspect-square overflow-hidden rounded-lg bg-muted shadow-elegant">
            <img
              src={resolveImage(product.image_url)}
              alt={product.name}
              width={1024}
              height={1024}
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            {product.category && (
              <span className="text-xs uppercase tracking-[0.3em] text-primary">{product.category}</span>
            )}
            <h1 className="mt-2 font-serif text-4xl md:text-5xl">{product.name}</h1>
            <div className="mt-4 text-3xl font-semibold text-primary">{formatJPY(product.price_jpy)}</div>

            <p className="mt-6 text-foreground/80 leading-relaxed">{product.description}</p>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center border border-border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center font-medium">{qty}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  disabled={qty >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">{product.stock} in stock</span>
            </div>

            <Button
              size="lg"
              className="mt-6 w-full sm:w-auto"
              disabled={outOfStock}
              onClick={() =>
                add(
                  {
                    id: product.id,
                    name: product.name,
                    price_jpy: product.price_jpy,
                    image_url: product.image_url,
                    stock: product.stock,
                  },
                  qty,
                )
              }
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              {outOfStock ? "Sold out" : "Add to cart"}
            </Button>

            <div className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground space-y-2">
              <p>✦ Hand-carved from kaduru wood</p>
              <p>✦ Natural mineral pigments</p>
              <p>✦ Ships from Colombo within 5 business days</p>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
