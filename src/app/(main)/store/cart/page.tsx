"use server";

import { cartTableColDef } from "@/components/cart/column-def";
import { CartDataTable } from "@/components/cart/data-table";
import OrderForm from "@/components/cart/order-form";
import {
  fetchCartWithDetails,
  fetchStoreStatus,
  getUserSession,
} from "@/lib/data";
import React from "react";

const CartPage: React.FC = async () => {
  const storeStatus = await fetchStoreStatus();

  const session = await getUserSession();
  const cart = await fetchCartWithDetails({ belongsTo: session.user?.phone });

  return !!session.user ? (
    <div className="w-[100vw] p-2 overflow-x-scroll space-y-3">
      <p className="m-2 font-bold text-xl">سبد خرید</p>
      <CartDataTable columns={cartTableColDef} data={cart} />
      {storeStatus.servicing && storeStatus.store
        ? cart.length > 0 && <OrderForm />
        : "در حال حاضر خدمات ارسال به محل ارائه نمی‌شود."}
    </div>
  ) : (
    "لطفا ابتدا وارد شوید."
  );
};

export default CartPage;
