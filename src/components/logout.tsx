"use client";
import { logout } from "@/lib/actions/auth";

export const Logout: React.FC = () => {
  "use client";

  return <button onClick={() => logout()}>Logout</button>;
};
