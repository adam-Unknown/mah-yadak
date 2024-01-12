"use server";
import { getCart } from "@/lib/data";
import { SessionData } from "@/lib/definition";
import { sessionOptions } from "@/session.config";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import React from "react";

const Cart: React.FC = async () => {
  const cartData = await getCart();
  return <div>Items in cart: {cartData?.length}</div>;
};

export default Cart;
