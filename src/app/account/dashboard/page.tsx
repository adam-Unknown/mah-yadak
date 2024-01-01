"use client";
import { logout } from "@/lib/actions/auth";
import { userData } from "@/lib/definition";
import { fetchJSON } from "@/utils/helper";
import useSWR from "swr";

function Dashboard() {
  const { data: user, error } = useSWR<userData>("/api/user", fetchJSON);
  return (
    <div>
      {error ? <div>failed to load</div> : <h1>Hi {user?.name}!</h1>}
      <form action={logout}>
        <button type="submit">Sign out</button>
      </form>
    </div>
  );
}

export default Dashboard;
