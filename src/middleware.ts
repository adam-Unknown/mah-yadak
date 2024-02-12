import { getIronSession } from "iron-session";
import { authSessionOptions, userSessionOptions } from "./session.config";
import { AuthSessionData, UserSessionData } from "./lib/definition";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// export default authenticate()
// this function handles the authentication purpose

export default async function middleware(req: NextRequest) {
  const session = await getIronSession<UserSessionData>(
    cookies(),
    userSessionOptions
  );

  if (session.user && req.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/store", req.nextUrl.origin));
  } else if (!session.user) {
    switch (req.nextUrl.pathname) {
      case "/dashboard":
        return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
      case "/dashboard/details":
        return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
      case "/store/order":
        return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
    }
  }

  //   }
  //   if (
  //     (!session.verified || !session.user) &&
  //     req.nextUrl.pathname.endsWith("/dashboard")
  //   ) {
  //     return NextResponse.redirect(new URL("/account/login", req.nextUrl.origin));
  //   }
  //   //   if (req.nextUrl.pathname.startsWith("/api")) {
  //   //     return Response.json({ succ: false, msg: "Unauthorized", status: 401 });
  //   //   }
  //   //   NextResponse.redirect("/singin");
}
