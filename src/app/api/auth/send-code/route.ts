import {
  CODE_EXPIRATION,
  MoblieNumberSchema,
  sessionData,
} from "@/lib/definition";
import { sessionOptions } from "@/session.config";
import { genVrfCode } from "@/utils/auth-utils";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const session = await getIronSession<sessionData>(cookies(), sessionOptions);

  // If the user is already logged in, return 400 Bad Request
  if (session.verified || session.user)
    return new Response("Bad Request!", { status: 400 });

  // validate the user' mobile number schema
  const to: string = request.nextUrl.searchParams.get("to") ?? "";
  if (!MoblieNumberSchema.safeParse(to).success)
    return new Response("Bad Request!", { status: 400 });

  // TODO: check the user's moblie number is already registered

  // check if first time sending code or not
  if (session.vrfCode?.code) {
    if (
      Date.now() - session.vrfCode?.expire - CODE_EXPIRATION <
      2 * 60 * 1000
    ) {
      // if the code is not expired, return 400 Bad Request
      return new Response("Bad Request!", { status: 400 });
    }
  }

  // generate a VRF code and store it in the session
  const code = "321"; // getVrfCode();
  // TODO: send the code to the user's mobile number
  // store in session
  session.vrfCode = { code: "321", expire: Date.now() + 15 * 60 * 1000 };
  await session.save();

  return new Response("Hello World!", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
