ALTER TABLE public.payment_orders DROP CONSTRAINT payment_orders_provider_check;
ALTER TABLE public.payment_orders ADD CONSTRAINT payment_orders_provider_check CHECK (provider IN ('mtn', 'vod', 'atl', 'paystack'));
COMMENT ON COLUMN public.payment_orders.provider IS 'Requested wallet network, or paystack when the buyer chooses card or mobile money inside hosted checkout.';