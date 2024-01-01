"use client";
import {
  AuthViaSmsFormSchema,
  AuthViaSmsFormData,
  ActionError,
} from "@/lib/definition";
import { login, sendCode } from "@/lib/actions/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { sleep } from "@/utils/helper";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [showGreeting, setShowGreeting] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    clearErrors,
    watch,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<AuthViaSmsFormData>({
    resolver: zodResolver(AuthViaSmsFormSchema),
    defaultValues: { mobileNumber: "", vrfCode: "" },
  });

  const showError = (errors?: ActionError) => {
    for (const err of errors ?? []) {
      setError(err.path, {
        type: "server",
        message: err.msg,
      });
      setFocus(err.path === "root" ? "mobileNumber" : err.path);
    }
  };

  const sendCodeTo = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const result = await sendCode(watch("mobileNumber"));
    if (result.succ) {
      clearErrors("root");
      // TODO: show a toast to user
      return;
    }

    showError(result.err);
  };

  const submit = async (data: AuthViaSmsFormData) => {
    const result = await login(data);
    if (result.succ) {
      sleep(2000).then(() => router.push("/account/dashboard"));
      setShowGreeting(true);
      // TODO: say your welcome Adam to user with a toast
      return;
    }

    showError(result.err);
  };

  return (
    <form onSubmit={handleSubmit(submit)}>
      {showGreeting && <h1>Welcome!</h1>}
      {errors.root && (
        <span className="text-red-400 block">
          Root error: {errors.root.message}
        </span>
      )}
      <label htmlFor="mobileNumber">Moblie number:</label>
      <input
        id="mobileNumber"
        type="text"
        {...register("mobileNumber")}
        className="block disabled:bg-gray-200 disabled:cursor-not-allowed"
      />
      {errors.mobileNumber && (
        <span className="text-red-400">
          {errors.mobileNumber.message as string}
        </span>
      )}
      <div>
        <button onClick={sendCodeTo}>Send</button>
      </div>
      <label htmlFor="vrfCode">Vrf code:</label>
      <input
        type="text"
        {...register("vrfCode")}
        className="block disabled:bg-gray-200 disabled:cursor-not-allowed"
      />
      {errors.vrfCode && (
        <span className="text-red-400">{errors.vrfCode.message as string}</span>
      )}
      <input type="submit" value="Submit" />
    </form>
  );
}
