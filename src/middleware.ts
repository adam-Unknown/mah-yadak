import { getIronSession } from "iron-session";
import { sessionOptions } from "./session.config";
import { sessionData } from "./lib/definition";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// export default authenticate()
// this function handles the authentication purpose

export default async function middleware(req: NextRequest) {
  const session = await getIronSession<sessionData>(cookies(), sessionOptions);
  // user is already authenticated, then we don't need to do anything
  if (
    session.verified &&
    session.user &&
    req.nextUrl.pathname.endsWith("/login")
  ) {
    return NextResponse.redirect(
      new URL("/account/dashboard", req.nextUrl.origin)
    );
  }

  if (
    (!session.verified || !session.user) &&
    req.nextUrl.pathname.endsWith("/dashboard")
  ) {
    return NextResponse.redirect(new URL("/account/login", req.nextUrl.origin));
  }

  //   if (req.nextUrl.pathname.startsWith("/api")) {
  //     return Response.json({ succ: false, msg: "Unauthorized", status: 401 });
  //   }

  //   NextResponse.redirect("/singin");
}
