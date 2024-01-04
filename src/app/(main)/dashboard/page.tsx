"use client";
import { logout } from "@/lib/actions/auth";
import { userData } from "@/lib/definition";
import { fetchJSON } from "@/utils/helper";

function Dashboard() {
  return (
    <div>
      <form action={logout}>
        <button type="submit">Sign out</button>
      </form>
    </div>
  );
}

export default Dashboard;
