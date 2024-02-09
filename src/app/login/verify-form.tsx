"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { msgSentContext } from "./page";
import { verify } from "@/lib/actions/auth";
import { KeySquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const verifyFormSchema = z.object({
  code: z
    .string()
    .min(6, {
      message: `کد می بایستی ${(6).toLocaleString("fa-IR")} رقم باشد*`,
    })
    .max(6, {
      message: `کد می بایستی ${(6).toLocaleString("fa-IR")} رقم باشد*`,
    }),
});

type verifyFormSchemaType = z.infer<typeof verifyFormSchema>;
interface LoginFormProps {}

export const VerifyForm: React.FC<LoginFormProps> = () => {
  const form = useForm<verifyFormSchemaType>({
    resolver: zodResolver(verifyFormSchema),
    defaultValues: {
      code: "",
    },
  });
  const { value: msgSent } = useContext(msgSentContext);
  const router = useRouter();

  const submit = async (data: verifyFormSchemaType) => {
    const res = await verify(parseInt(data.code));

    if (!res.success) {
      form.setError("code", {
        type: "server",
        message: res.message,
      });
      return;
    }

    toast.success(`خوش آمدید, ${res.message}!`, { position: "top-center" });

    router.push("/store");
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submit)}
        className={`${msgSent ? "block" : "hidden"} grid grid-row-2 gap-2`}
      >
        <FormField
          name="code"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <KeySquare className="w-4 h-4 inline" />
                {"  "}
                کد
              </FormLabel>
              <FormControl>
                <Input
                  disabled={!msgSent}
                  placeholder={`کد ${(6).toLocaleString("fa-IR")} رقمی`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          disabled={!msgSent || form.formState.isSubmitting}
          type="submit"
        >
          ورود
        </Button>
      </form>
    </Form>
  );
};
