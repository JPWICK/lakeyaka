import { Link } from "react-router-dom";
import { Trash2, Plus, Minus } from "lucide-react";
import { StoreLayout } from "@/components/StoreLayout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { resolveImage } from "@/lib/images";
import { formatJPY } from "@/lib/format";

export default function Cart() {
  const { items, remove, update, total } = useCart();

  return (
    <StoreLayout>
      <div className="container py-12 max-w-4xl">
        <h1 className="font-serif text-4xl mb-8">Your cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-6">Your cart is empty.</p>
            <Button asChild>
              <Link to="/shop">Browse masks</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 border border-border rounded-lg p-4 bg-card">
                  <img
                    src={resolveImage(item.image_url)}
                    alt={item.name}
                    width={120}
                    height={120}
                    className="h-24 w-24 rounded-md object-cover"
                  />
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <Link to={`/product/${item.id}`} className="font-serif text-lg hover:text-primary">
                        {item.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">{formatJPY(item.price_jpy)} each</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-border rounded-md">
                        <Button variant="ghost" size="icon" onClick={() => update(item.id, item.quantity - 1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button variant="ghost" size="icon" onClick={() => update(item.id, item.quantity + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="font-semibold w-24 text-right">{formatJPY(item.price_jpy * item.quantity)}</span>
                      <Button variant="ghost" size="icon" onClick={() => remove(item.id)} aria-label="Remove">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-border pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">Shipping calculated at checkout.</div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Subtotal</div>
                <div className="text-3xl font-serif text-primary">{formatJPY(total)}</div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button asChild variant="outline">
                <Link to="/shop">Continue shopping</Link>
              </Button>
              <Button asChild size="lg">
                <Link to="/checkout">Checkout</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </StoreLayout>
  );
}
