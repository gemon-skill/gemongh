CREATE TABLE public.payment_orders (
 reference text PRIMARY KEY,
 checkout_token_hash text NOT NULL,
 course_selection text NOT NULL CHECK (course_selection IN ('1','2','3','4','5','6','7','8','9','10','all')),
 email text NOT NULL,
 amount integer NOT NULL CHECK (amount > 0),
 currency text NOT NULL DEFAULT 'GHS' CHECK (currency = 'GHS'),
 provider text NOT NULL CHECK (provider IN ('mtn','vod','atl')),
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed')),
 created_at timestamptz NOT NULL DEFAULT now(),
 verified_at timestamptz,
 CHECK ((course_selection = 'all' AND amount = 30000) OR (course_selection <> 'all' AND amount = 5000))
);
GRANT ALL ON public.payment_orders TO service_role;
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.payment_orders IS 'Guest checkout orders; no direct browser access. Server checks a hashed HttpOnly browser capability before reading or verifying. Only provider-verified payments become paid.';