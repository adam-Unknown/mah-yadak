"use client";
import { ColumnDef } from "@tanstack/react-table";
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
import { removeItemFromCart } from "@/lib/actions/cart";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Input } from "../ui/input";
import AddToCart from "./edit-cart";
import EditCart from "./edit-cart";
import { Popover } from "../ui/popover";
import { Trash2 } from "lucide-react";

export type cartItemTypeInTable = {
  id: string;
  isAvalibale: boolean;
  imageUrl: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
};

export const cartTableColDef: ColumnDef<cartItemTypeInTable>[] = [
  {
    id: "index",
    header: " ",
    cell: ({ row }) => <span>{(row.index + 1).toLocaleString("fa-IR")}</span>,
  },
  {
    accessorKey: "image",
    header: () => <p className="text-center">تصویر</p>,
    cell: ({ row }) => (
      <Link href={`/store/part/${row.original.id}`}>
        <Image
          height={64}
          width={64}
          src={row.original.imageUrl}
          alt={row.original.name || " "}
          className="w-[64px] h-[64px] rounded-md overflow-hidden mx-auto"
        />
      </Link>
    ),
  },
  {
    accessorKey: "name",
    header: "نام",
    cell: ({ row }) => (
      <Link href={`/store/part/${row.original.id}`} legacyBehavior passHref>
        <a>{row.original.name}</a>
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
  {
    id: "actions",
    cell: (({ row }: any) => {
      const router = useRouter();
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="link">عملیات</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={(e) => e.preventDefault()} asChild>
              <EditCart
                defaultValues={{
                  partId: row.original.id,
                  quantity: row.original.quantity,
                }}
                toAdd={false}
              />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => e.preventDefault()}>
              <AlertDialog>
                <AlertDialogTrigger className="text-sm text-red-500 text-start w-[100%]">
                  <Trash2 className="w-4 h-4 ml-2 inline" />
                  حذف
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-start">
                      آیا از حذف قطعه مطمئن هستید؟
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-start">
                      یه متن قابل توجه
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="mx-2">
                      انصراف
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="mx-2 bg-red-500 hover:bg-red-600"
                      onClick={async () => {
                        const toastId = toast.loading(
                          "در حال انجام عملیات حذف قطعه..."
                        );
                        const res = await removeItemFromCart(row.original.id);
                        if (res.success) {
                          toast.success("موفق.", {
                            description: res.message,
                            id: toastId,
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
                      حذف
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }) as React.FC,
  },
];
