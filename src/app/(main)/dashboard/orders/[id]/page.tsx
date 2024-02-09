"use server";
import { fetchOrderDetails, getUserSession } from "@/lib/data";
import React from "react";
import { OrderDetialsDataTable } from "@/components/order/details/data-table";
import { orderItemsTableColDef } from "@/components/order/details/column-def";
import { CalendarDays, Check, HelpCircle, X } from "lucide-react";
import ClosePageButton from "@/components/close";

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
    <div className="w-[100vw] px-2 pt-14 overflow-x-scroll space-y-3">
      <ClosePageButton redirectTo="/dashboard/orders" />
      <fieldset className="w-full border border-gray-300 rounded-sm bg-white space-y-3 p-4">
        <legend>
          <span className="m-2 font-bold text-lg">جزییات سفارش</span>
        </legend>
        <p>
          <HelpCircle className="inline w-4 h-4 ml-2" />
          وضعیت: {orderDetials.status}
        </p>
        <p>
          <CalendarDays className="inline w-4 h-4 ml-2" />
          تاریخ ثبت:
          {new Intl.DateTimeFormat("fa-IR", {
            timeZone: "Asia/Tehran",
            year: "numeric",
            month: "numeric",
            day: "numeric",
            weekday: "short",
            hour: "numeric",
            minute: "numeric",
          }).format(orderDetials.createdAt as Date)}
        </p>
        <p>
          <CalendarDays className="inline w-4 h-4 ml-2" />
          تاریخ بروزرسانی:
          {new Intl.DateTimeFormat("fa-IR", {
            timeZone: "Asia/Tehran",
            year: "numeric",
            month: "numeric",
            day: "numeric",
            weekday: "short",
            hour: "numeric",
            minute: "numeric",
          }).format(orderDetials.updatedAt as Date)}
        </p>
        <p>
          {orderDetials.ordererInvoiceToPrint ? (
            <Check className="inline w-4 h-4 ml-2 text-primary" />
          ) : (
            <X className="inline w-4 h-4 ml-2" />
          )}
          فاکتور برای خودم
        </p>
        <p>
          {orderDetials.customerInvoiceToPrint ? (
            <Check className="inline w-4 h-4 ml-2 text-primary" />
          ) : (
            <X className="inline w-4 h-4 ml-2" />
          )}
          فاکتور برای مشتری{" "}
        </p>
      </fieldset>

      <OrderDetialsDataTable
        columns={orderItemsTableColDef}
        data={orderDetials.items}
      />
      <fieldset className="w-full border border-gray-300 rounded-sm bg-white py-2 px-5">
        <legend>
          <span className="mx-2 font-bold text-md">جمع کل</span>
        </legend>
        <p className="mb-1 font-bold text-md text-end">{`${(
          orderDetials.totalPrice as number
        ).toLocaleString("fa-IR")} تومان`}</p>
      </fieldset>
    </div>
  );
};

export default OrderDetails;
