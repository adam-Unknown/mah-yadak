import { useUser } from "@/hooks/useUser";
import React from "react";

function Account() {
  const { information, signin, signout } = useUser();

  return (
    <div>
      <p>Hi</p>
    </div>
  );
}

export default Account;
