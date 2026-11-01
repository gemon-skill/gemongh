import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const payment = vi.hoisted(() => ({ begin: vi.fn(), verify: vi.fn(), restore: vi.fn(), otp: vi.fn() }));
vi.mock("@tanstack/react-start", () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock("@/lib/paystack.functions", () => ({ beginPayment: payment.begin, checkPayment: payment.verify, getPurchaseState: payment.restore, submitPaymentOtp: payment.otp }));
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: Record<string, unknown>) => ({ options, useLoaderData: () => ({ selection: "1", course: { title: "Course one" }, title: "Course one", price: 50 }) }),
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
  notFound: () => new Error("Not found"),
}));
import { Route } from "@/routes/checkout.$id";

beforeEach(() => {
  vi.clearAllMocks();
  payment.restore.mockResolvedValue({ courses: [], pendingReference: null, unavailable: false });
  payment.begin.mockResolvedValue({ reference: "gemon_0123456789abcdef0123456789abcdef", status: "send_otp", message: "Approve payment" });
  payment.otp.mockResolvedValue({ status: "success", message: "Code accepted" });
  payment.verify.mockResolvedValue({ status: "paid", message: "Verified", courses: [{ id: "1", title: "Course one" }] });
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("checkout payment transitions", () => {
  it("waits 14 seconds before verifying a pending wallet charge", async () => {
    payment.begin.mockResolvedValue({ reference: "gemon_0123456789abcdef0123456789abcdef", status: "pending", message: "Awaiting wallet approval" });
    payment.verify.mockResolvedValue({ status: "pending", message: "Awaiting wallet approval", courses: [] });
    const Checkout = Route.options.component;
    if (!Checkout) throw new Error("Missing checkout");
    render(<Checkout />);
    await screen.findByRole("button", { name: "Pay GHC 50" });
    vi.useFakeTimers();
    fireEvent.change(screen.getByLabelText("Mobile money number"), { target: { value: "0241234567" } });
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "buyer@example.com" } });
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Pay GHC 50" })); });
    await act(async () => { await vi.advanceTimersByTimeAsync(13999); });
    expect(payment.verify).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Check payment status" }).hasAttribute("disabled")).toBe(true);
    await act(async () => { await vi.advanceTimersByTimeAsync(1); });
    expect(payment.verify).toHaveBeenCalledTimes(1);
    expect(payment.verify).toHaveBeenCalledWith({ data: { reference: "gemon_0123456789abcdef0123456789abcdef" } });
    expect(screen.queryByText("Open course")).toBeNull();
  });
  it("sends the selected network without a buyer price and verifies after OTP before access", async () => {
    const Checkout = Route.options.component;
    if (!Checkout) throw new Error("Missing checkout");
    render(<Checkout />);
    fireEvent.click(await screen.findByRole("button", { name: /Telecel/ }));
    fireEvent.change(screen.getByLabelText("Mobile money number"), { target: { value: "0201234567" } });
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "buyer@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Pay GHC 50" }));
    const otp = await screen.findByLabelText("One-time code");
    expect(payment.begin).toHaveBeenCalledWith({ data: { selection: "1", provider: "vod", email: "buyer@example.com", phone: "0201234567" } });
    expect(screen.queryByText("Open course")).toBeNull();
    fireEvent.change(otp, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Submit code" }));
    await screen.findByText("Open course");
    expect(payment.verify).toHaveBeenCalledWith({ data: { reference: "gemon_0123456789abcdef0123456789abcdef" } });
  });
  it("immediately verifies approved charges using the newly returned reference", async () => {
    payment.begin.mockResolvedValue({ reference: "gemon_0123456789abcdef0123456789abcdef", status: "verify", message: "Approved" });
    const Checkout = Route.options.component;
    if (!Checkout) throw new Error("Missing checkout");
    render(<Checkout />);
    await screen.findByRole("button", { name: "Pay GHC 50" });
    fireEvent.change(screen.getByLabelText("Mobile money number"), { target: { value: "0241234567" } });
    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "buyer@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Pay GHC 50" }));
    await waitFor(() => expect(payment.verify).toHaveBeenCalledWith({ data: { reference: "gemon_0123456789abcdef0123456789abcdef" } }));
  });
});