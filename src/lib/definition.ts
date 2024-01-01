import { z } from "zod";

// ----------------- Macro? here ------------
export const CODE_EXPIRATION = 900000;

// ----------------- Schemas here --------------

export const MoblieNumberSchema = z
  .string({
    invalid_type_error: "Name should be a string",
    required_error: "Name is required",
  })
  .min(3, "Name should be at least 3 characters long")
  .max(3, "Name should be at most 3 characters long");

export const VrfCodeSchema = z.string({
  invalid_type_error: "Name should be a string",
  required_error: "Name is required",
});

export const AuthViaSmsFormSchema = z.object({
  mobileNumber: MoblieNumberSchema,
  vrfCode: VrfCodeSchema,
});

export const AuthViaMobileNumberFormSchema = z.object({
  mobileNumber: z
    .string({
      invalid_type_error: "Name should be a string",
      required_error: "Name is required",
    })
    .min(3, "Name should be at least 3 characters long")
    .max(3, "Name should be at most 3 characters long"),
});

export const VerifyCodeFormSchema = z.object({
  vrfCode: z.string({
    invalid_type_error: "Name should be a string",
    required_error: "Name is required",
  }),
});

// ----------------- Types here --------------

export type userData = {
  name: string;
  // TODO: other information
};

export type sessionData = {
  user?: userData;
  moblieNumber?: string;
  vrfCode?: { code: string; expire: number };
  verified?: boolean;
};

export type AuthViaSmsFormData = z.infer<typeof AuthViaSmsFormSchema>;

export type MobileNumber = z.infer<typeof AuthViaMobileNumberFormSchema>;

export type VerifyCode = z.infer<typeof VerifyCodeFormSchema>;

export type PathUnion = keyof z.infer<typeof AuthViaSmsFormSchema>;

export type ActionError = { msg: string; path: PathUnion | "root" }[];
export type ActionReturn = { succ: boolean; err?: ActionError };
