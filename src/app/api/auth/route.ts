import { sessionData } from "@/lib/definition";
import { sessionOptions } from "@/session.config";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export async function DELETE(request: Request) {
  const session = await getIronSession<sessionData>(cookies(), sessionOptions);
  if (session.user && session.verified) {
    session.destroy();
    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  return new Response(JSON.stringify({ success: false }));
}
