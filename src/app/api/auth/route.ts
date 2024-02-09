import { getSecToResend } from "@/lib/actions/auth";

export async function GET(requst: Request) {
  return Response.json({
    timeLeft: getSecToResend(),
  });
}
