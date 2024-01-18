"use server";

import { z } from "zod";
import {
  AddToCartFormSchema,
  CartCreateSchema,
  CartItemEditForm,
  CartReadSchema,
  ItemLineSchema,
  OrderCreateSchema,
  State,
  UserSessionData,
} from "../definition";
import { userSessionOptions } from "@/session.config";
import { getIronSession } from "iron-session";
import {
  addToCart,
  editCartItem,
  fetchCart,
  fetchOrderable,
  fetchPartAvailability,
  getMongoDbCrudExecutor,
  getUserSession,
  removeCartItem,
} from "../data";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

interface AddToCartFormState
  extends State<z.infer<typeof AddToCartFormSchema>> {}

/* THIS NEED BE PROTECTED BY MIDDLEWARE!!!! */
export const addItemAction = async (
  prevState: AddToCartFormState | undefined,
  formData: FormData
): Promise<AddToCartFormState | undefined> => {
  //  validating the formData
  const validatedFields = AddToCartFormSchema.safeParse({
    partId: formData.get("partId"),
    quantity: formData.get("quantity"),
  });

  if (!validatedFields.success)
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };

  const {
    user: { phone },
  } = await getIronSession<UserSessionData>(cookies(), userSessionOptions);

  const isAvailable = await fetchPartAvailability({
    belongsTo: phone,
    ...validatedFields.data,
  });

  if (!isAvailable)
    return {
      fieldErrors: {
        quantity: ["Not enough stock"],
      },
    };

  // Add the part to the cart
  const success = await addToCart({
    belongsTo: phone,
    ...validatedFields.data,
  });

  if (!success)
    return {
      fieldErrors: {
        quantity: ["Not added"],
      },
    };
};

interface EditFormState extends State<z.infer<typeof CartItemEditForm>> {}

export async function editItemAction(
  prevState: EditFormState | undefined,
  formData: FormData
): Promise<EditFormState | undefined> {
  const validatedFields = CartItemEditForm.safeParse({
    partId: formData.get("partId"),
    quantity: formData.get("quantity"),
  });

  if (!validatedFields.success) {
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const {
    user: { phone },
  } = await getUserSession();

  const salable = await fetchPartAvailability({
    belongsTo: "!",
    ...validatedFields.data,
  });
  if (!salable)
    return {
      fieldErrors: {
        quantity: ["Not enough stock"],
      },
    };

  const edited = await editCartItem({
    belongsTo: phone,
    ...validatedFields.data,
  });

  if (!edited)
    return {
      fieldErrors: {
        quantity: ["Not Edited"],
      },
    };

  redirect("/store/cart");
}

const CartItemRemoveForm = z.object({
  partId: z.string(),
});

interface RemoveFormState extends State<z.infer<typeof CartItemRemoveForm>> {}

export async function removeItemAction(
  prevState: RemoveFormState | undefined,
  formData: FormData
): Promise<RemoveFormState | undefined> {
  const validatedFields = CartItemRemoveForm.safeParse({
    partId: formData.get("partId"),
  });

  if (!validatedFields.success) {
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const {
    user: { phone },
  } = await getIronSession<UserSessionData>(cookies(), userSessionOptions);

  const removed = await removeCartItem({
    belongsTo: phone,
    partId: validatedFields.data.partId,
  });
  console.log(removed);

  redirect("/store/cart");
}
