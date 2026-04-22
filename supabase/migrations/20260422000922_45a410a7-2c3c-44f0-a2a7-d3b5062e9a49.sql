CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP POLICY IF EXISTS "Anyone places order" ON public.orders;
CREATE POLICY "Anyone places order" ON public.orders FOR INSERT
WITH CHECK (
  length(customer_name) BETWEEN 1 AND 200
  AND customer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(shipping_address) BETWEEN 1 AND 500
  AND length(shipping_city) BETWEEN 1 AND 100
  AND total_jpy >= 0
  AND status = 'pending'
);

DROP POLICY IF EXISTS "Anyone inserts order items" ON public.order_items;
CREATE POLICY "Anyone inserts order items" ON public.order_items FOR INSERT
WITH CHECK (
  quantity > 0 AND quantity <= 1000
  AND unit_price_jpy >= 0
  AND subtotal_jpy >= 0
  AND length(product_name) BETWEEN 1 AND 200
);