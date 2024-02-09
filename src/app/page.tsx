"use server";
import { logout } from "@/lib/actions/auth";
import { getUserSession } from "@/lib/data";
import { UserSessionData } from "@/lib/definition";
import { userSessionOptions } from "@/session.config";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export default async function index() {
  const { user } = await getUserSession();
  // console.log(user);
  return (
    <>
      {/* TEST */}
      {user ? <p>{user.fullname}</p> : <a href="/login">login</a>}
      {/* TEST */}
      <h1>سلام دنیا</h1>
      <p>معرفی سایت</p>
      <a>ورود به فروشگاه</a>
      <div>
        <h1>Test</h1>
      </div>
      <input
        type="text"
        placeholder="جستوجو محصول در میان هزاران محصول موجود در فروشگاه"
      />
    </>
  );
}
