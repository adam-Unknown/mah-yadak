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

export const AddToCartFormSchema = z.object({
  partId: z.string({
    invalid_type_error: ", لطفا صفحه را مجدد باز کنید.خطای دریافت اطلاعات",
    required_error: ", لطفا صفحه را مجدد باز کنید.خطای دریافت اطلاعات",
  }),
  quantity: z.coerce.number().min(1, "Quantity should be at least 1"),
});

export const ItemLineSchema = z.object({
  partId: z.string(),
  quantity: z.number(),
});

export const OrderFormSchema = z.object({
  cooperatesInvoicePrint: z.coerce.boolean(),
  customerInvoicePrint: z.coerce.boolean(),
});

export const Profession = z.enum([
  "ELECTRICIAN",
  "SUSPENSION",
  "MECHANIC",
  "NONE",
]);

export const CartCreateSchema = z.object({
  belongsTo: z.string(),
  items: z.array(ItemLineSchema),
});

export const CartReadSchema = CartCreateSchema;

export const PartCreateSchema = z.object({
  id: z.string(),
  category: z.string(),
  subCategory: z.string().optional(),
  model: z.array(z.string()),
  usedFor: z.array(z.string()),
  brand: z.string(),
  suitableFor: z.array(z.string()),
  sale: z.object({
    purchasePrice: z.number().positive(),
    interestRates: z.number().min(0, "Interest rates should be at least 0"),
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

export const AggregatedPartSchama = PartCreateSchema.omit({
  warehouse: true,
  sale: true,
}).merge(
  z.object({
    price: z.number(),
    isInStock: z.boolean(),
  })
);

export const AggregatedCartSchema = z.array(
  z.object({
    partDetails: AggregatedPartSchama.omit({
      id: true,
      imageUrls: true,
      description: true,
      notices: true,
      model: true,
      usedFor: true,
      suitableFor: true,
      category: true,
      subCategory: true,
    }).merge(
      z.object({
        id: z.string(),
        imageUrl: z.string(),
        model: z.string(),
        usedFor: z.string(),
        suitableFor: z.string(),
      })
    ),
    quantity: z.number(),
    totalPrice: z.number(),
  })
);

export const SuggestionCreateSchema = z.array(
  z.object({
    backgroundColor: z.number(),
    imageUrl: z.string(),
    profession: Profession,
    partIds: z.array(z.string()),
  })
);

export const AggregatedSuggestionsSchema = z.array(
  z.object({
    backgroundColor: z.number(),
    imageUrl: z.string(),
    profession: Profession,
    parts: z.array(
      PartCreateSchema.pick({
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

export const OrderStatus = z.enum([
  "CONFIRMING",
  "CONFIRMED",
  "CANCELED_BY_USER",
  "CANCELED_BY_ADMIN",
  "COMPLETED",
]);

export const OrderCreateSchema = z
  .object({
    status: OrderStatus,
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .merge(OrderFormSchema.merge(CartReadSchema));

export const OrdersReadSchema = z.array(
  OrderCreateSchema.merge(z.object({ id: z.string() }))
);

export const AggregatedOrderSchema = OrderCreateSchema.omit({
  belongsTo: true,
}).merge(
  z.object({
    items: z.array(
      AggregatedPartSchama.omit({
        id: true,
        imageUrls: true,
        description: true,
        notices: true,
        model: true,
        usedFor: true,
        suitableFor: true,
        category: true,
        subCategory: true,
        isInStock: true,
      }).merge(
        z.object({
          id: z.string(),
          imageUrl: z.string(),
          model: z.string(),
          usedFor: z.string(),
          suitableFor: z.string(),
          quantity: z.number(),
        })
      )
    ),
  })
);

// ----------------- Types here --------------

export const UserSchema = z.object({
  name: z.string(),
  family: z.string(),
  phone: z.string(),
  profession: Profession,
  address: z.string(),
});

export type AuthSessionData = {
  phone?: string;
  code?: string;
  sentAt?: number;
};

export type UserSessionData = {
  user: z.infer<typeof UserSchema>;
};

// --------------- MongoDB Schema here ---------------

// ----------------- Interfaces here --------------

export interface State<T> {
  formErrors?: string[];
  fieldErrors?: { [K in keyof T]?: string[] };
  success?: boolean;
}

export type CartItem = {
  _id: ObjectId;
  quantity: number;
};

// ----------------- FORM SCHEMAS HERE --------------

export const CartItemEditForm = z.object({
  partId: z.string(),
  quantity: z.coerce.number(),
});
