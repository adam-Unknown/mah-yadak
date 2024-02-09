"use server";
import { userSessionOptions } from "@/session.config";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import {
  createOrder,
  fetchCart,
  fetchCartOrdability,
  fetchStoreStatus,
  getMongoDbCrudExecutor,
  getUserSession,
  isCancelableOrder,
  updateOrderCancelation,
} from "../data";
import { ActionResultType } from "./cart";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function order(invoice: {
  orderer: boolean;
  customer: boolean;
}): Promise<ActionResultType & { redirectTo?: string }> {
  const {
    user: { phone },
  } = await getUserSession();

  const storeState = await fetchStoreStatus();

  if (!storeState.store || !storeState.servicing)
    return {
      success: false,
      message: "فروشگاه در حال حاضر بسته است.",
    };

  const orderable = await fetchCartOrdability({
    belongsTo: phone,
  });

  if (!orderable)
    return {
      success: false,
      message: "در سبد خرید شما مغاییرتی ایجاد شده است.",
    };

  const cart = await fetchCart({ belongsTo: phone });

  // DECREASE THE STOCK OF THE PARTS
  await getMongoDbCrudExecutor("parts", async (parts) =>
    parts.bulkWrite(
      cart.items.map((item) => ({
        updateOne: {
          filter: { _id: new ObjectId(item.partId) },
          update: { $inc: { "warehouse.stock": -item.quantity } },
        },
      }))
    )
  )();

  // DELETE THE CART
  await getMongoDbCrudExecutor("carts", async (carts) =>
    carts.deleteOne({ belongsTo: phone })
  )();

  const orderId = await createOrder({
    cart: cart,
    invoicesToPrint: invoice,
  });

  return {
    success: true,
    message: "سفارش شما با موفقیت ثبت شد.",
    redirectTo: `/dashboard/orders/${orderId}`,
  };
}

export const cancelOrder = async (id: string): Promise<ActionResultType> => {
  if (!(await isCancelableOrder(id)))
    return {
      success: false,
      message: "سفارش قابل لغو نمی باشد و در حال پردازش است.",
    };

  const {
    user: { phone },
  } = await getUserSession();

  if (!(await updateOrderCancelation({ orderId: id, belongsTo: phone })))
    return {
      success: false,
      message: "سفارش شما لغو نشد.",
    };

  revalidatePath("/dashboard/orders");

  return {
    success: true,
    message: "سفارش شما با موفقیت لغو گردید.",
  };
};
