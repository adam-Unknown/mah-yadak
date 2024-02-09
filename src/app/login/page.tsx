"use client";
import { createContext, useState } from "react";
import { SendForm } from "./send-form";
import { VerifyForm } from "./verify-form";

export const revalidate = 1;
export const msgSentContext = createContext<{ value: boolean; setValue: any }>({
  value: false,
  setValue: () => {},
});

export default function Login() {
  const [msgSent, setMsgSent] = useState(false);

  return (
    <div>
      <msgSentContext.Provider value={{ value: msgSent, setValue: setMsgSent }}>
        <SendForm />
        <VerifyForm />
      </msgSentContext.Provider>
    </div>
  );
}
