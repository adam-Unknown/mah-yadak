"use server";

import OrderForm from "@/components/cart/order-form";
import {
  fetchCartWithDetails,
  getMongoDbCrudExecutor,
  getUserSession,
} from "@/lib/data";
import React from "react";
import CartItem from "@/components/cart/item/item";

const CartPage: React.FC = async () => {
  const {
    user: { phone },
  } = await getUserSession();
  const cart = await fetchCartWithDetails({ belongsTo: phone });

  return (
    <div>
      {cart.map((item, index) => (
        <React.Fragment key={index}>
          <CartItem
            index={index}
            {...item.partDetails}
            quantity={item.quantity}
            total={item.totalPrice}
          />
        </React.Fragment>
      ))}
      {cart.length > 0 && <OrderForm />}
    </div>
  );
};

export default CartPage;
