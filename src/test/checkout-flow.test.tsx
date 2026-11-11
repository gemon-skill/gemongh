import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const payment = vi.hoisted(() => ({ initialize: vi.fn(), verify: vi.fn(), restore: vi.fn(), resume: vi.fn() }));
vi.mock("@tanstack/react-start", () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock("@/lib/paystack.functions", () => ({ initializeHostedPayment: payment.initialize, checkPayment: payment.verify, getPurchaseState: payment.restore }));
vi.mock("@/lib/paystack-inline", () => ({ checkoutPublicKey: () => "pk_test_unit", loadPaystack: async () => class { resumeTransaction = payment.resume; } }));
vi.mock("@tanstack/react-router", () => ({ Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a> }));
import { BuyButton } from "@/components/buy-button";

beforeEach(() => {
  vi.clearAllMocks();
  payment.restore.mockResolvedValue({ courses: [], pendingReference: null, unavailable: false });
  payment.initialize.mockResolvedValue({ reference: "gemon_0123456789abcdef0123456789abcdef", accessCode: "unit-access", amount: 5000, currency: "GHS", publicKey: "pk_test_unit" });
  payment.verify.mockResolvedValue({ status: "pending", message: "Pending", courses: [] });
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

async function submit() {
  fireEvent.click(screen.getByRole("button", { name: "Buy now" }));
  fireEvent.change(screen.getByLabelText("Email Address"), { target: { value: "buyer@example.com" } });
  fireEvent.click(screen.getByRole("button", { name: "Continue to Paystack" }));
  await waitFor(() => expect(payment.resume).toHaveBeenCalledTimes(1));
}

describe("email-first Paystack payments", () => {
  it("submits only selection and email, and never unlocks from an unverified success callback", async () => {
    render(<BuyButton selection="1">Buy now</BuyButton>);
    await submit();
    expect(payment.initialize).toHaveBeenCalledWith({ data: { selection: "1", email: "buyer@example.com" } });
    expect(payment.resume.mock.calls[0]?.[0]).toBe("unit-access");
    await act(async () => payment.resume.mock.calls[0]?.[1].onSuccess());
    await waitFor(() => expect(payment.verify).toHaveBeenCalledWith({ data: { reference: "gemon_0123456789abcdef0123456789abcdef" } }));
    expect(screen.queryByText("Open course")).toBeNull();
  });
  it("uses the all-course selection for the GHC 300 bundle", async () => {
    payment.initialize.mockResolvedValue({ reference: "gemon_0123456789abcdef0123456789abcdef", accessCode: "bundle-access", amount: 30000, currency: "GHS", publicKey: "pk_test_unit" });
    render(<BuyButton selection="all">Buy now</BuyButton>);
    await submit();
    expect(payment.initialize).toHaveBeenCalledWith({ data: { selection: "all", email: "buyer@example.com" } });
    expect(payment.resume.mock.calls[0]?.[0]).toBe("bundle-access");
  });
  it("grants course access only after server verification", async () => {
    payment.verify.mockResolvedValue({ status: "paid", message: "Verified", courses: [{ id: "1", title: "Course one" }] });
    render(<BuyButton selection="1">Buy now</BuyButton>);
    await submit();
    await act(async () => payment.resume.mock.calls[0]?.[1].onSuccess());
    await screen.findByText("Open course");
  });
  it("waits 14 seconds after cancellation before automatically checking a pending payment", async () => {
    render(<BuyButton selection="1">Buy now</BuyButton>);
    await submit();
    vi.useFakeTimers();
    await act(async () => payment.resume.mock.calls[0]?.[1].onCancel());
    await act(async () => { await vi.advanceTimersByTimeAsync(13999); });
    expect(payment.verify).not.toHaveBeenCalled();
    await act(async () => { await vi.advanceTimersByTimeAsync(1); });
    expect(payment.verify).toHaveBeenCalledTimes(1);
  });
  it("does not initialize when purchases cannot be restored", async () => {
    payment.restore.mockRejectedValue(new Error("Purchase check unavailable"));
    render(<BuyButton selection="1">Buy now</BuyButton>);
    fireEvent.click(screen.getByRole("button", { name: "Buy now" }));
    fireEvent.change(screen.getByLabelText("Email Address"), { target: { value: "buyer@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue to Paystack" }));
    await screen.findByRole("alert");
    expect(payment.initialize).not.toHaveBeenCalled();
  });
});
