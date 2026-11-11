export const PAYSTACK_SCRIPT_URL = "https://js.paystack.co/v2/inline.js";
export type PaystackCallbacks = {
  onSuccess: () => void;
  onCancel: () => void;
  onError: (error: { message?: string }) => void;
};
export type PaystackConstructor = new () => {
  resumeTransaction: (accessCode: string, callbacks: PaystackCallbacks) => void;
};

export function loadPaystack(): Promise<PaystackConstructor> {
  const scope = window as unknown as { PaystackPop?: PaystackConstructor };
  if (scope.PaystackPop) return Promise.resolve(scope.PaystackPop);
  return new Promise((resolve, reject) => {
    let script = document.querySelector<HTMLScriptElement>(`script[src="${PAYSTACK_SCRIPT_URL}"]`);
    const timer = window.setTimeout(() => finish(new Error("Paystack did not load. Check your connection or disable blockers and try again.")), 15000);
    function finish(error?: Error) {
      window.clearTimeout(timer);
      script?.removeEventListener("load", loaded);
      script?.removeEventListener("error", failed);
      if (error) reject(error);
      else if (scope.PaystackPop) resolve(scope.PaystackPop);
      else reject(new Error("Paystack initialization failed: Inline v2 is unavailable."));
    }
    function loaded() { finish(); }
    function failed() {
      script?.remove();
      finish(new Error("Paystack could not load. Check your connection and try again."));
    }
    if (!script) {
      script = document.createElement("script");
      script.src = PAYSTACK_SCRIPT_URL;
      script.async = true;
      script.addEventListener("load", loaded);
      script.addEventListener("error", failed);
      document.head.appendChild(script);
    } else {
      script.addEventListener("load", loaded);
      script.addEventListener("error", failed);
    }
  });
}

export function checkoutPublicKey(savedKey: string) {
  const key = import.meta.env['VITE_PAYSTACK_PUBLIC_KEY'] || savedKey;
  if (!/^pk_(live|test)_[A-Za-z0-9]+$/.test(key)) {
    throw new Error("Paystack initialization failed: a valid VITE_PAYSTACK_PUBLIC_KEY or saved PAYSTACK_PUBLIC_KEY is required.");
  }
  return key;
}