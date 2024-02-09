"use server";
import { ordersTableColDef } from "@/components/order/column-def";
import { OrderDataTable } from "@/components/order/data-table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  fetchOrders,
  getMongoDbCrudExecutor,
  getUserSession,
} from "@/lib/data";
import React from "react";
import { z } from "zod";

const pageSelSchema = z.coerce.number().min(1);

export default async function OrderHistory({
  searchParams,
}: {
  searchParams: {
    page?: string;
  };
}) {
  const pageResult = pageSelSchema.safeParse(searchParams.page);
  const page = pageResult.success ? pageResult.data : 1;

  const session = await getUserSession();

  const limit = 6;
  const totalPages = Math.ceil(
    (await getMongoDbCrudExecutor("orders", async (orders) =>
      orders.countDocuments({})
    )()) / limit
  );

  const orders = await fetchOrders({
    belongsTo: session.user?.phone,
    skip: (page - 1) * limit,
    limit: limit,
  });
  return session.user ? (
    <div className="w-[100vw] p-2 overflow-x-scroll space-y-3">
      <p className="m-2 font-bold text-xl">تاریخچه سفارشات</p>
      <OrderDataTable columns={ordersTableColDef} data={orders} />
      <Pagination dir="ltr" className="w-full mx-auto mt-3 overflow-hidden">
        <PaginationContent>
          {page > 1 && (
            <PaginationItem>
              <PaginationPrevious
                href={`/dashboard/orders/?page=${page - 1}&limit=${limit}`}
              />
            </PaginationItem>
          )}
          {page > 2 && (
            <PaginationItem>
              <PaginationLink href={`/dashboard/orders/?page=1&limit=${limit}`}>
                {(1).toLocaleString("fa-IR")}
              </PaginationLink>
            </PaginationItem>
          )}
          {page > 3 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          {page !== 1 && (
            <PaginationItem>
              <PaginationLink
                href={`/dashboard/orders/?page=${page - 1}&limit=${limit}`}
              >
                {(page - 1).toLocaleString("fa-IR")}
              </PaginationLink>
            </PaginationItem>
          )}
          <PaginationItem>
            <PaginationLink href="#" isActive={true}>
              {page.toLocaleString("fa-IR")}
            </PaginationLink>
          </PaginationItem>
          {page !== totalPages && (
            <PaginationItem>
              <PaginationLink
                href={`/dashboard/orders/?page=${page + 1}&limit=${limit}`}
              >
                {(page + 1).toLocaleString("fa-IR")}
              </PaginationLink>
            </PaginationItem>
          )}
          {page < totalPages - 2 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          {page <= totalPages - 2 && (
            <PaginationItem>
              <PaginationLink
                href={`/dashboard/orders/?page=${totalPages}&limit=${limit}`}
              >
                {totalPages.toLocaleString("fa-IR")}
              </PaginationLink>
            </PaginationItem>
          )}
          {page < totalPages && (
            <PaginationItem>
              <PaginationNext
                href={`/dashboard/orders/?page=${page + 1}&limit=${limit}`}
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  ) : (
    "لطفا ابتدا وارد شوید."
  );
}
