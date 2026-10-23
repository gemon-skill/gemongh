import { z } from "zod";
import { courses, PRICE_GHS, BUNDLE_GHS } from "./courses";

export const selectionSchema = z.enum(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "all"]);
export const providerSchema = z.enum(["mtn", "vod", "atl"]);
export const checkoutSchema = z.object({
  selection: selectionSchema,
  email: z.string().trim().email().max(254).transform((v) => v.toLowerCase()),
  phone: z.string().regex(/^(?:0|233|\+233)[0-9]{9}$/),
  provider: providerSchema,
}).strict();
export const referenceSchema = z.string().regex(/^gemon_[a-f0-9]{32}$/);
export function paymentSelection(selection: string) {
  const id = selectionSchema.parse(selection);
  const selected = id === "all" ? courses : courses.filter((c) => c.slug === id);
  return { selection: id, title: id === "all" ? "All 10 courses bundle" : selected[0]?.title ?? "Course", amount: (id === "all" ? BUNDLE_GHS : PRICE_GHS) * 100, currency: "GHS", courses: selected.map((c) => ({ id: c.slug, title: c.title })) };
}
export type VerificationOrder = { reference: string; amount: number; currency: string; email: string };
export function selectionIncludesCourse(selection: string, courseId: string) {
  return paymentSelection(selection).courses.some(course => course.id === courseId);
}
export function verifiedPayment(order: VerificationOrder, transaction: unknown): boolean {
  const result = z.object({ status: z.literal("success"), reference: z.string(), amount: z.number().int(), currency: z.string(), customer: z.object({ email: z.string() }) }).safeParse(transaction);
  return result.success && result.data.reference === order.reference && result.data.amount === order.amount && result.data.currency === order.currency && result.data.customer.email.toLowerCase() === order.email.toLowerCase();
}