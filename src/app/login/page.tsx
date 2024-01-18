import { PhoneEnterForm } from "@/components/login/phone-enter-form";
import { VerificationForm } from "@/components/login/verification-form";
import { getPhone } from "../../lib/actions/auth";
import { getMsToResend } from "../../lib/actions/auth";

export default async function Login() {
  const phone = await getPhone();
  const msToResend = await getMsToResend();
  return (
    <div>
      <PhoneEnterForm phone={phone} _msToResend={msToResend} />
      <VerificationForm phone={phone} />
    </div>
  );
}
