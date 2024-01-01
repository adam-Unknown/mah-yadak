import { sessionData, userData } from "@/lib/definition";
import { sessionOptions } from "@/session.config";
import { sleep } from "@/utils/helper";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export async function GET() {
  const { user }: { user?: userData } = await getIronSession<sessionData>(
    cookies(),
    sessionOptions
  );

  await sleep(1000);

  if (!user) return;

  return Response.json(user);
}
