import { SessionData } from "@/lib/definition";
import { sessionOptions } from "@/session.config";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export async function GET(requst: Request) {
  return Response.json({
    timeLeft:
      ((await getIronSession<SessionData>(cookies(), sessionOptions)).sentAt ||
        0) -
      Date.now() +
      30000,
  });
}
