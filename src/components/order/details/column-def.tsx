"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";

export type OrderItemsInTableType = {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
  total: number;
};

export const orderItemsTableColDef: ColumnDef<OrderItemsInTableType>[] = [
  {
    id: "index",
    header: " ",
    cell: ({ row }) => <span>{(row.index + 1).toLocaleString("fa-IR")}</span>,
  },
  {
    accessorKey: "image",
    header: () => <p className="text-center">تصویر</p>,
    cell: ({ row }) => (
      <Link href={`/store/part/${row.original.id}`} target="_blank">
        <Image
          src={row.original.imageUrl}
          alt={row.original.name}
          width={64}
          height={64}
          className="w-[64px] h-[64px] rounded-md overflow-hidden mx-auto"
        />
      </Link>
    ),
  },
  {
    accessorKey: "name",
    header: "نام قطعه",
    cell: ({ row }) => (
      <Link href={`/store/part/${row.original.id}`} target="_blank">
        <span>{row.original.name}</span>
      </Link>
    ),
  },
  {
    accessorKey: "quantity",
    header: "تعداد",
    cell: ({ row }) => (
      <span>{row.original.quantity.toLocaleString("fa-IR")}</span>
    ),
  },
  {
    accessorKey: "price",
    header: "قیمت واحد",
    cell: ({ row }) => (
      <span>{row.original.price.toLocaleString("fa-IR")} تومان</span>
    ),
  },
  {
    accessorKey: "total",
    header: "قیمت کل",
    cell: ({ row }) => (
      <span>{row.original.total.toLocaleString("fa-IR")} تومان</span>
    ),
  },
];
