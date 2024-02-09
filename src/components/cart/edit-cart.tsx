"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { addItemToCart, editItemInCart } from "@/lib/actions/cart";
import { usePathname, useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBasket, ShoppingCart } from "lucide-react";

interface Props {
  toAdd?: boolean;
  defaultValues: z.infer<typeof cartItemSchema>;
}

export const cartItemSchema = z.object({
  partId: z.string(),
  quantity: z.coerce.number().min(1),
});

const EditCart: React.FC<Props> = ({ defaultValues, toAdd }) => {
  const form = useForm<z.infer<typeof cartItemSchema>>({
    resolver: zodResolver(cartItemSchema),
    defaultValues: defaultValues,
  });
  const router = useRouter();
  const pathname = usePathname();

  const submit = async (item: z.infer<typeof cartItemSchema>) => {
    const res = toAdd ? await addItemToCart(item) : await editItemInCart(item);
    if (!res.success) {
      toast.error("خطا", {
        description: res.message,
      });
    }

    if (res.success) {
      toast.success(res.message, {
        duration: 4000,
      });
      form.reset();
      router.refresh();
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submit)}
        className="grid grid-cols-2 gap-2"
      >
        <FormField
          control={form.control}
          name="partId"
          render={({ field }) => (
            <FormControl>
              <input {...field} type="hidden" />
            </FormControl>
          )}
        />
        <FormField
          name="quantity"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <div className="flex flex-row border justify-between border-primary p-1 rounded-sm">
                <Button
                  className="aspect-square rounded-md p-0 h-8"
                  type="button"
                  onClick={() =>
                    field.onChange(z.coerce.number().parse(field.value) + 1)
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <FormControl>
                  <input
                    {...field}
                    value={field.value.toLocaleString("fa-IR")}
                    className="w-12 hover:outline-none text-center"
                  />
                </FormControl>

                <Button
                  className="aspect-square rounded-md p-0 h-8"
                  type="button"
                  onClick={() =>
                    field.onChange(z.coerce.number().parse(field.value) - 1)
                  }
                >
                  <Minus className="h-4 w-4 m-0" />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={form.formState.isSubmitting} type="submit">
          {toAdd ? (
            <>
              <ShoppingCart className="w-4 h-4 ml-2" />
              افزودن
            </>
          ) : (
            "ویرایش"
          )}{" "}
          {/* Cart icon */}
        </Button>
      </form>
    </Form>
  );
};

export default EditCart;
