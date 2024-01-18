"use client";
import { verify } from "@/lib/actions/auth";
import { useFormState, useFormStatus } from "react-dom";

export const VerificationForm: React.FC<{ phone?: string }> = ({ phone }) => {
  const [state, dispatch] = useFormState(verify, undefined);

  return (
    <form action={dispatch}>
      <label htmlFor="code">Code: </label>
      <input
        type="text"
        name="code"
        defaultValue=""
        disabled={phone ? false : true}
        className="block disabled:bg-gray-200 disabled:cursor-not-allowed"
      />
      {state?.fieldErrors?.code && (
        <span className="">{state?.fieldErrors?.code}</span>
      )}
      {state?.formErrors && <span className="">{state?.formErrors}</span>}

      <Submit />
    </form>
  );
};

const Submit: React.FC = () => {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} type="submit">
      {pending ? "Verifying..." : "Verify"}
    </button>
  );
};
