"use server";
import { userSessionOptions } from "@/session.config";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  cancelOrder,
  createOrder,
  fetchCart,
  fetchOrderable,
  getMongoDbCrudExecutor,
  isCancelableOrder,
  updatePart,
} from "../data";
import { State, UserSessionData } from "../definition";

interface OrderFormState extends State<void> {}

export async function orderAction(
  prevState: OrderFormState | undefined,
  formData: FormData
): Promise<OrderFormState | undefined> {
  const {
    user: { phone },
  } = await getIronSession<UserSessionData>(cookies(), userSessionOptions);

  const orderable = await fetchOrderable({
    belongsTo: phone,
  });

  if (!orderable) return { formErrors: ["Not orderable"] };

  const cart = await fetchCart({ belongsTo: phone });
  //  TODO: GET BACKUP FOR THE PARTS BEFORE UPDATING THEM
  // UPDATE THE PARTS
  for (const item of cart.items) await updatePart(item);
  try {
  } catch (e) {
    return { formErrors: ["Not updated x1"] };
  }

  // DELETE THE CART
  try {
    await getMongoDbCrudExecutor("carts", async (carts) =>
      carts.deleteOne({ belongsTo: phone })
    )();
  } catch (e) {
    // RECOVERY THE PARTS
    return {};
  }

  // CREATE THE ORDER
  try {
    const orderId = await createOrder({
      cart: cart,
      invoicesPrint: { cooperate: false, customer: false },
    });
    
    redirect(`/dashboard/orders/${orderId}`);
  } catch (e) {
    // RECOVERY THE PARTS
  }
}

interface CancelOrderFormState extends State<void> {}

export const cancelOrderAction = async (
  prevState: CancelOrderFormState | undefined,
  formData: FormData
): Promise<CancelOrderFormState | undefined> => {
  const validatedFields = z.string().safeParse(formData.get("orderId"));

  if (!validatedFields.success)
    return {
      formErrors: ["Invalid order id"],
    };

  if (!(await isCancelableOrder({ orderId: validatedFields.data })))
    return {
      formErrors: ["Order is not cancelable"],
    };

  const {
    user: { phone },
  } = await getIronSession<UserSessionData>(cookies(), userSessionOptions);

  if (!(await cancelOrder({ belongsTo: phone, orderId: validatedFields.data })))
    return {
      formErrors: ["Failed to cancel the order"],
    };

  redirect("/dashboard/orders");
};
