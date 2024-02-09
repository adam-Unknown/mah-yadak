"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import React, { useCallback, useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { msgSentContext } from "./page";
import { sendCode } from "@/lib/actions/auth";
import { useTimer } from "react-timer-hook";
import { MessageSquareText, Pencil, Phone, RotateCw, Send } from "lucide-react";

const sendFormSchema = z.object({
  phone: z
    .string({
      invalid_type_error: "",
      required_error: "",
    })
    .min(1, { message: "شماره همراه خود را وارد کنید." })
    .regex(/^09\d{9}$/, "شماره همراه وارد شده صحیح نیست."),
});

type sendFormSchemaType = z.infer<typeof sendFormSchema>;
interface LoginFormProps {}

export const SendForm: React.FC<LoginFormProps> = () => {
  const form = useForm<sendFormSchemaType>({
    resolver: zodResolver(sendFormSchema),
    defaultValues: {},
  });
  const { value: msgSent, setValue: setMsgSent } = useContext(msgSentContext);
  const timer = useTimer({
    expiryTimestamp: new Date(),
    autoStart: true,
  });

  const submit = async (data: sendFormSchemaType) => {
    const res = await sendCode(data.phone);

    const _time = new Date(res.data?.resendOn ?? new Date());
    timer.restart(_time);

    if (!res.success) {
      form.setError("phone", {
        type: "server",
        message: res.message,
      });
      return;
    }

    setMsgSent(true);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submit)}
        className="grid grid-row-2 grid-cols-2 gap-2"
      >
        <FormField
          name="phone"
          control={form.control}
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>
                <Phone className="w-4 h-4 inline" /> شماره همراه
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="شماره همراه خود را وارد کنید"
                  {...field}
                  disabled={msgSent}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className="w-full h-full"
          disabled={form.formState.isSubmitting || timer.totalSeconds > 0}
          type="submit"
        >
          {timer.totalSeconds > 0 ? (
            `${timer.totalSeconds.toLocaleString("fa-IR")} ثانیه`
          ) : form.formState.isSubmitSuccessful ? (
            <>
              ارسال مجدد
              <RotateCw className="mr-1 w-4 h-4 inline" />
            </>
          ) : (
            <>
              ارسال <MessageSquareText className="w-4 h-4 inline" />
            </>
          )}
        </Button>
        {msgSent ? (
          <Button
            className="w-full h-full"
            onClick={() => {
              setMsgSent(false);
            }}
          >
            ویرایش
            <Pencil className="w-4 h-4 inline" />
          </Button>
        ) : (
          <div></div>
        )}
      </form>
    </Form>
  );
};
