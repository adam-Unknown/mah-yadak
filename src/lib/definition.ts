import { ObjectId } from "mongodb";
import { z } from "zod";

// ----------------- Macro? here ------------

export const MS_TO_RESEND = 60000;

// ----------------- Schemas here --------------

export const PhoneEnterFormSchema = z.object({
  phone: z
    .string({
      invalid_type_error: "Invalid",
      required_error: "Phone field is required",
    })
    .regex(/^09\d{9}$/, "Invalid phone number"),
});

export const CodeVerifyFormSchema = z.object({
  code: z
    .string({
      invalid_type_error: "Invalid type",
      required_error: "Required",
    })
    .regex(/^\d{6}$/, "Invalid format"),
});

export const CartManagementFormSchema = z.array(
  z.object({
    id: z.string({
      invalid_type_error: "Somthing is wrong",
      required_error: "Somthing is wrong",
    }),
    quantity: z.coerce
      .number({
        invalid_type_error: "Should be a number",
        required_error: "Quantity is required",
      })
      .min(1, "Quantity should be at least 1"),
  })
);
export const Profession = z.enum([
  "ELECTRICIAN",
  "SUSPENSION",
  "MECHANIC",
  "NONE",
]);

export const PartSchema = z.object({
  id: z.string(),
  category: z.string(),
  subCategory: z.string().optional(),
  model: z.array(z.string()),
  usedFor: z.array(z.string()),
  brand: z.string(),
  suitableFor: z.string(),
  sale: z.object({
    purchasePrice: z.number().positive(),
    interestRates: z.number().min(0, "Interest rates should be at least 0"),
    salesPrice: z.number().optional(),
    updatedAt: z.date(),
  }),
  warehouse: z.object({
    stock: z.number(),
    placehold: z.string().optional(),
    warnAt: z.number().optional(),
    updatedAt: z.date(),
  }),
  description: z.string().optional(),
  notices: z.array(z.string()).optional(),
  imageUrls: z.array(z.string()),
});

export const AggregatedPartSchama = PartSchema.omit({
  warehouse: true,
  sale: true,
}).merge(z.object({ price: z.number(), available: z.boolean() }));

export const AggregatedSuggestionsSchema = z.array(
  z.object({
    backgroundColor: z.string(),
    imageUrl: z.string(),
    profession: Profession,
    parts: z.array(
      PartSchema.pick({
        id: true,
        model: true,
        brand: true,
        category: true,
        subCategory: true,
        usedFor: true,
        suitableFor: true,
      }).merge(z.object({ imageUrl: z.string() }))
    ),
  })
);

// ----------------- Types here --------------

export type UserData = {
  name: string;
  phone: string;
  // TODO: other information
};

export type AuthSessionData = {
  phone?: string;
  code?: string;
  sentAt?: number;
};

export type UserSessionData = {
  user?: UserData;
  verified?: boolean;
  cart?: ICart;
};

// --------------- MongoDB Schema here ---------------

// ----------------- Interfaces here --------------

export interface State<T> {
  formErrors?: string[];
  fieldErrors?: { [K in keyof T]?: string[] };
}

export type CartItem = {
  _id: ObjectId;
  quantity: number;
};

export interface ICart extends Array<CartItem> {}
