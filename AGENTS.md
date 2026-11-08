<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Header and footer share the same prepared logo image; derive the square favicon from its coin emblem so branding stays consistent.
- Paystack guest orders use a hashed HttpOnly browser capability; server functions reverify the provider before returning course entitlements, because callbacks and client state cannot authorize access.
- Paid course pages live under /learn and expose no lesson files unless server-verified entitlement exists; genuine materials must use private storage with authorized short-lived delivery URLs when supplied.
- Checkout uses a route-scoped theme and the shared dark logo, so other pages retain their existing appearance.
- Uncertain Paystack charge responses retain the original pending reference; only definitive failures allow a fallback, to avoid duplicate wallet charges.
- All purchase CTAs share BuyButton; initialize hosted payments server-side and resume the returned Inline v2 access code, because client-created transactions cannot enforce immutable prices or browser-scoped entitlements. Load the provider script through the root head, since TanStack Start has no index.html.
