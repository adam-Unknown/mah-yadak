"use client";

import { ColumnDef } from "@tanstack/react-table";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { toast } from "sonner";
import Link from "next/link";
import { cancelOrder } from "@/lib/actions/order";
import { ClipboardList, TableProperties, X } from "lucide-react";
import { OrderStatus } from "@/lib/definition";

export type ordersInTableType = {
  id: string;
  ordererInvoiceToPrint: boolean;
  customerInvoiceToPrint: boolean;
  createdAt: Date;
  updatedAt: Date;
  status: string;
};

export const ordersTableColDef: ColumnDef<ordersInTableType>[] = [
  {
    id: "index",
    header: " ",
    cell: ({ row }) => <span>{(row.index + 1).toLocaleString("fa-IR")}</span>,
  },
  {
    accessorKey: "status",
    header: "وضعیت",
    cell: ({ row }) => <span>{row.original.status}</span>,
  },
  {
    accessorKey: "createdAt",
    header: "تاریخ ثبت",
    cell: ({ row }) => (
      <span>
        {new Intl.DateTimeFormat("fa-IR", {
          timeZone: "Asia/Tehran",
          year: "numeric",
          month: "numeric",
          day: "numeric",
          weekday: "short",
          hour: "numeric",
          minute: "numeric",
        }).format(row.original.createdAt)}
      </span>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: "تاریخ بروزرسانی",
    cell: ({ row }) => (
      <span>
        {new Intl.DateTimeFormat("fa-IR", {
          timeZone: "Asia/Tehran",
          year: "numeric",
          month: "numeric",
          day: "numeric",
          weekday: "short",
          hour: "numeric",
          minute: "numeric",
        }).format(row.original.updatedAt)}
      </span>
    ),
  },
  {
    id: "actions",
    cell: (({ row }: any) => {
      const router = useRouter();
      const pathname = usePathname();
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="link">عملیات</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(row.original.id);
                toast.success("شناسه سفارش کپی شد");
              }}
            >
              <ClipboardList className="inline w-4 h-4 ml-2" />
              کپی شناسه سفارش
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <Link href={`/dashboard/orders/${row.original.id}`} passHref>
              <DropdownMenuItem>
                <TableProperties className="inline w-4 h-4 ml-2" />
                مشاهد جزییات
              </DropdownMenuItem>
            </Link>
            {(row.original.status === OrderStatus.Values["در انتظار تایید"] ||
              row.original.status ===
                OrderStatus.Values["تایید شده و در حال ارسال"]) && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                  <AlertDialog>
                    <AlertDialogTrigger className="text-sm text-red-500 text-start w-[100%]">
                      <X className="inline w-4 h-4 ml-2" />
                      لغو
                    </AlertDialogTrigger>
                    <AlertDialogContent className="">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-start">
                          {row.original.status ===
                          OrderStatus.Values["در انتظار تایید"] ? (
                            <>آیا از لغو سفارش مطمئن هستید؟</>
                          ) : (
                            "در مرحله (سفارش در حال ارسال) امکان لغو آن وجود ندارد!"
                          )}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-start">
                          {row.original.status ===
                            OrderStatus.Values["در انتظار تایید"] && (
                            <>
                              در صورت لغو سفارش, دیگر قادر به بازیابی سفارش
                              نخواهید بود و می بایستی سفارشی را از نو ایجاد
                              بنمایید.
                            </>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="mx-2">
                          انصراف
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="mx-2  text-white bg-red-500 hover:bg-red-600"
                          disabled={
                            row.original.status !==
                            OrderStatus.Values["در انتظار تایید"]
                          }
                          onClick={async () => {
                            const toastId = toast.loading(
                              "در حال انجام عملیات لغو سفارش"
                            );
                            const res = await cancelOrder(row.original.id);
                            if (res.success) {
                              toast.success("سفارش شما لغو شد.", {
                                id: toastId,
                                duration: 4000,
                              });

                              router.refresh();
                            } else {
                              toast.error("خطا !", {
                                description: res.message,
                                id: toastId,
                              });
                            }
                          }}
                        >
                          لغو سفارش
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }) as React.FC,
  },
];
