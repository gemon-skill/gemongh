ALTER TABLE public.payment_orders DROP CONSTRAINT payment_orders_check;
ALTER TABLE public.payment_orders ADD CONSTRAINT payment_orders_check CHECK (
  (course_selection = 'all' AND amount = 30000)
  OR (course_selection = '1' AND amount IN (1000, 5000))
  OR (course_selection IN ('2','3','4','5','6','7','8','9','10') AND amount = 5000)
);
COMMENT ON CONSTRAINT payment_orders_check ON public.payment_orders IS 'Course 1 new checkouts use 1000 pesewas enforced by server paymentSelection. Historical course 1 orders at 5000 remain valid for verification; other courses use 5000 and the bundle 30000.';