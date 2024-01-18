"use client";
import { logout } from "@/lib/actions/auth";

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
