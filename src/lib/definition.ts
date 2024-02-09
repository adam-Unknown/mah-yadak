import { ObjectId } from "mongodb";
import { z } from "zod";

// ----------------- Macro? here ------------

export const SEC_TO_RESEND = 60;

// ----------------- Schemas here --------------

export const PhoneEnterFormSchema = z.object({
  phone: z
    .string({
      invalid_type_error: "شماره نامعتبر",
      required_error: "شماره همراه را وارد کنید!",
    })
    .regex(/^09\d{9}$/, "شماره همراه نامعتبر."),
});

export const CodeVerifyFormSchema = z.object({
  code: z.coerce
    .number({
      invalid_type_error: "کد وارد شده صحیح نمی باشد!",
      required_error: "کد را وارد کنید!",
    })
    .min(6, "کد وارد شده صحیح نمی باشد!")
    .max(6, "کد وارد شده صحیح نمی باشد!"),
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

export const Profession = z.enum(["برقکار", "جلوبندساز", "مکانیک", "هیچکدام"]);

export const CartCreateSchema = z.object({
  belongsTo: z.string(),
  items: z.array(ItemLineSchema),
});

export const CartReadSchema = CartCreateSchema;

export const PartSchema = z.object({
  id: z.string().optional(),
  category: z.string(),
  model: z.array(z.string()),
  usedFor: z.array(z.string()).optional(),
  brand: z.string().optional(),
  properties: z.string().optional(),
  sale: z.object({
    buyPrice: z.number().positive(),
    vat: z.number().positive().min(0, "vat should be at least 0"),
    updatedAt: z.date(),
  }),
  warehouse: z.object({
    stock: z.number(),
    address: z.string().optional(),
    initialStock: z.number(),
    updatedAt: z.date(),
  }),
  description: z.string().optional(),
  notes: z.array(z.string()).optional(),
  imageUrls: z.array(z.string()).min(1, "at least one image is required"),
});

export const AggregatedPartSchema = PartSchema.omit({
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
    partDetails: AggregatedPartSchema.omit({
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

export const OrderStatus = z.enum([
  "در انتظار تایید",
  "تایید شده و در حال ارسال",
  "لغو شده توسط مشتری",
  "رد شده توسط ادمین",
  "تکمیل شده",
  "برگشت خورده",
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
      AggregatedPartSchema.omit({
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
  fullname: z.string(),
  phone: z.string(),
  profession: Profession,
  address: z.string(),
});

export type AuthSessionData = {
  phone?: string;
  code?: number;
  resendOn?: Date;
  timesAttempted?: number;
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
