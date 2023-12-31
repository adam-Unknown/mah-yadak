import { sessionData } from "@/lib/definition";
import { sessionOptions } from "@/session.config";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export default async function useSession() {
  return await getIronSession<sessionData>(cookies(), sessionOptions);
}
