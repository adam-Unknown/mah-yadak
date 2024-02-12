"use client";

import { createContext } from "react";

interface ContextType {
  value: boolean;
  setValue: (value: boolean) => void;
}

export const msgSentContext = createContext<ContextType>({
  value: false,
  setValue: () => {},
});
