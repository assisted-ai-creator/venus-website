import { z } from "zod";

export const CLASS_OPTIONS = [
  "Playgroup",
  "Pre-KG",
  "Nursery",
  "Junior KG",
  "Senior KG",
  "Standard I",
  "Standard II",
  "Standard III",
  "Standard IV",
  "Standard V",
  "Standard VI",
  "Standard VII",
  "Standard VIII",
  "Standard IX",
  "Standard X",
] as const;

/** Indian mobile or landline, with or without +91 and separators. */
const phone = z
  .string()
  .trim()
  .min(1, "Enter a phone number so the school can call you back")
  .refine(
    (v) => {
      const digits = v.replace(/[^\d]/g, "").replace(/^91(?=\d{10}$)/, "");
      return digits.length >= 8 && digits.length <= 12;
    },
    { message: "Enter a valid Indian phone number, for example 70280 88103" }
  );

export const enquirySchema = z.object({
  parentName: z
    .string()
    .trim()
    .min(2, "Enter the parent or guardian's name")
    .max(120, "That name is too long"),
  phone,
  email: z
    .string()
    .trim()
    .max(200)
    .email("Enter a valid email address, for example name@example.com")
    .or(z.literal(""))
    .optional(),
  childName: z.string().trim().max(120).optional(),
  seekingClass: z.enum(CLASS_OPTIONS, {
    errorMap: () => ({ message: "Choose the class you are applying for" }),
  }),
  message: z
    .string()
    .trim()
    .max(2000, "Please keep the message under 2000 characters")
    .optional(),
  /** Honeypot — must stay empty. Never shown to a real visitor. */
  website: z.string().max(0).optional(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

export type EnquiryResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };
