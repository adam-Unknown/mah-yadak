import { PhoneEnterForm } from "@/components/forms/phone-enter";
import { VerificationForm } from "@/components/forms/verification";
import { getMsToResend, getPhone } from "@/lib/actions/auth";

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
