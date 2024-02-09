"use client";
import { order } from "@/lib/actions/order";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel } from "../ui/form";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const orderSchema = z.object({
  invoices: z.object({
    orderer: z.coerce.boolean(),
    customer: z.coerce.boolean(),
  }),
});

interface Props {}

const OrderForm: React.FC<Props> = () => {
  const form = useForm<z.infer<typeof orderSchema>>({
    resolver: zodResolver(orderSchema),
  });
  const router = useRouter();

  const submit = async ({ invoices }: z.infer<typeof orderSchema>) => {
    const toastId = toast.loading("در حال انجام عملیات ثبت سفارش", {
      description: "لطفا منتظر بمانید...",
    });
    const res = await order(invoices);
    if (res.success) {
      toast.success("سفارش شما با موفقیت ثبت شد.", {
        id: toastId,
        duration: 4000,
      });

      form.reset();
      router.push(res.redirectTo || "/dashboard/orders");
    } else {
      toast.error("خطا !", {
        description: res.message,
        id: toastId,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)}>
        <FormField
          control={form.control}
          name="invoices"
          render={({ field }) => (
            <fieldset className="border border-gray-300 rounded-sm p-2">
              <legend className="mx-2">
                <span className="px-2 font-bold text-md">چاپ فاکتور</span>
              </legend>
              <div className="grid grid-cols-2 gap-2 p-2">
                <FormField
                  control={form.control}
                  name="invoices.orderer"
                  render={({ field }) => (
                    <FormItem>
                      <Checkbox
                        className="ml-1"
                        onCheckedChange={field.onChange}
                      />
                      <FormLabel>چاپ فاکتور برای خودم</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="invoices.customer"
                  render={({ field }) => (
                    <FormItem>
                      <Checkbox
                        className="ml-1"
                        onCheckedChange={field.onChange}
                      />
                      <FormLabel>چاپ فاکتور برای مشتری</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </fieldset>
          )}
        />
        <Button
          className="fixed bottom-[72px] left-0 right-0 mx-2"
          disabled={form.formState.isSubmitting}
          type="submit"
        >
          ثبت سفارش
        </Button>
      </form>
    </Form>
  );
};

export default OrderForm;
