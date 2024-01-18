"use server";
import {
  fetchOrderDetails,
  getMongoDbCrudExecutor,
  getUserSession,
} from "@/lib/data";
import React from "react";
import { AggregatedOrderSchema } from "@/lib/definition";
import { z } from "zod";
import { ObjectId } from "mongodb";
import CancelOrderForm from "@/components/order/cancel-form";

interface OrderDetailsProps {
  params: { id: string };
}

const OrderDetails: React.FC<OrderDetailsProps> = async ({
  params: { id: orderId },
}) => {
  const {
    user: { phone },
  } = await getUserSession();

  const orderDetials = await fetchOrderDetails({
    belongsTo: phone,
    orderId: orderId,
  });

  return (
    <div>
      <h2>TABLE</h2>
      {orderDetials.items.map((item, index) => (
        <React.Fragment key={index}>
          <span>{item.model}</span>
          <span>{item.brand}</span>
          <span>{item.price}</span>
          <span>{item.quantity}</span>
          <br />
        </React.Fragment>
      ))}
    </div>
  );
};

export default OrderDetails;
