"use server";
import CancelOrderForm from "@/components/order/cancel-form";
import {
  fetchOrders,
  getMongoDbCrudExecutor,
  getUserSession,
} from "@/lib/data";
import { OrdersReadSchema } from "@/lib/definition";
import Link from "next/link";
import React from "react";
import { z } from "zod";

const OrdersHistory: React.FC = async () => {
  const {
    user: { phone },
  } = await getUserSession();

  const orders = await fetchOrders({ belongsTo: phone });
  return (
    <div>
      <h2>Table</h2>
      {orders.map((order, index) => (
        <React.Fragment key={index}>
          <span>{order.id}</span>
          <span>{order.status}</span>
          <span>{order.createdAt.toDateString()}</span>
          <span>{order.updatedAt.toDateString()}</span>
          <Link href={`orders/${order.id}`}>Details</Link>
          <CancelOrderForm orderId={order.id} />
        </React.Fragment>
      ))}
    </div>
  );
};

export default OrdersHistory;
