import { useParams, Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { StoreLayout } from "@/components/StoreLayout";
import { Button } from "@/components/ui/button";

export default function OrderConfirmed() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  return (
    <StoreLayout>
      <div className="container py-20 max-w-xl text-center">
        <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-6" />
        <h1 className="font-serif text-4xl">Thank you!</h1>
        <p className="mt-4 text-muted-foreground">
          Your order <span className="font-mono text-foreground">{orderNumber}</span> has been received.
          We'll email you tracking details once it ships from Colombo.
        </p>
        <Button asChild className="mt-8">
          <Link to="/shop">Continue shopping</Link>
        </Button>
      </div>
    </StoreLayout>
  );
}
