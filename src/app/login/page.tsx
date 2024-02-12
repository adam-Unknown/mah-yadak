"use client";
import { createContext, useState } from "react";
import { SendForm } from "./send-form";
import { VerifyForm } from "./verify-form";
import { msgSentContext } from "./context";

export default function Login() {
  const [msgSent, setMsgSent] = useState<boolean>(false);
  return (
    <div>
      <msgSentContext.Provider value={{ value: msgSent, setValue: setMsgSent }}>
        <SendForm />
        <VerifyForm />
      </msgSentContext.Provider>
    </div>
  );
}
