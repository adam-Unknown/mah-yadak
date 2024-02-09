"use client";
import { createContext, useState } from "react";
import { SendForm } from "./send-form";
import { VerifyForm } from "./verify-form";

interface ContextType {
  value: boolean;
  setValue: (value: boolean) => void;
}

export const msgSentContext = createContext<ContextType>({
  value: false,
  setValue: () => {},
});

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
