"use client";
import { redirect } from "next/navigation";

function Dashboard() {
  redirect("/dashboard/details");
}

export default Dashboard;
