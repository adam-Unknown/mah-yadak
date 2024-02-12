"use server";

import { cartTableColDef } from "@/components/cart/column-def";
import { CartDataTable } from "@/components/cart/data-table";
import OrderForm from "@/components/cart/order-form";
import {
  fetchCartWithDetails,
  fetchStoreStatus,
  getUserSession,
} from "@/lib/data";
import { Fingerprint } from "lucide-react";
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
    <div className="h-screen w-full overflow-hidden flex justify-center items-center space-y-6">
      <div className="flex flex-col justify-center items-center space-y-12 text-black/35">
        <Fingerprint size={48} />
        <p className="font-bold">برای مشاهده سبد خرید بایستی وارد شوید</p>
      </div>
    </div>
  );
};

export default CartPage;
