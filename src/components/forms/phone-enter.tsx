"use client";
import { editPhone, sendCode } from "@/lib/actions/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

export const revalidate = 1;

const msToResendContext = createContext(0);

export const PhoneEnterForm: React.FC<{
  phone?: string;
  _msToResend?: number;
}> = ({ phone, _msToResend }) => {
  const [state, dispatch] = useFormState(sendCode, undefined);
  const [msToResend, setMsToResend] = useState(_msToResend ?? 0);

  useEffect(() => {
    if (state?.succ) {
      setMsToResend(state.data?.msToResend ?? 0);
      state.succ = false;
    } else if (phone) {
      const timer = setInterval(() => {
        if (msToResend <= 0) return;
        setMsToResend((prev) => prev - 1000);
        console.log(msToResend);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [msToResend, state, phone]);

  useEffect(() => {
    const phoneInput = document.getElementsByName(
      "phone"
    )[0] as HTMLInputElement;
    phoneInput.value = phone ?? "";
  }, [phone]);

  return (
    <form action={dispatch}>
      <label htmlFor="phone">Phone: </label>
      <input
        name="phone"
        type="tel"
        defaultValue={phone}
        aria-disabled={phone ? true : false}
        className="block aria-disabled:bg-gray-200 aria-disabled:cursor-not-allowed aria-disabled:pointer-events-none aria-disabled:select-none"
      />
      {state?.fieldErrors?.phone && <span>{state.fieldErrors.phone}</span>}
      {state?.formErrors && <span>{state.formErrors}</span>}
      {state?.ResendError && <span>{state.ResendError}</span>}
      <msToResendContext.Provider value={msToResend}>
        <Submit phone={phone} />
      </msToResendContext.Provider>
      {phone && <Edit />}
    </form>
  );
};

const Submit: React.FC<{ phone?: string }> = ({ phone }) => {
  const msToResend = useContext(msToResendContext);
  const { pending } = useFormStatus();

  return (
    <input
      disabled={msToResend > 0 ? true : pending}
      type="submit"
      value={
        pending
          ? "Sending..."
          : phone
          ? msToResend > 0
            ? `Resend in ${msToResend}`
            : "Resend"
          : "Send"
      }
      className="block disabled:bg-gray-200 disabled:cursor-not-allowed"
    />
  );
};

const Edit: React.FC = () => {
  return (
    <button
      type="button"
      onClick={async () => {
        await editPhone();
        console.log("editPhone");
      }}
    >
      Edit
    </button>
  );
};
