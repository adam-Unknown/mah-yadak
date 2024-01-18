"use client";
import { removeItemAction } from "@/lib/actions/cart";
import { useRouter } from "next/navigation";
import React from "react";
import { useFormState, useFormStatus } from "react-dom";

const ItemRemoveForm: React.FC<{ partId: string }> = ({ partId }) => {
  const [state, dispatch] = useFormState(removeItemAction, undefined);
  const router = useRouter();

  if (state?.success) router.refresh();
  return (
    <form action={dispatch}>
      <input type="hidden" name="partId" value={partId} />
      {state?.fieldErrors?.partId && <span>{state.fieldErrors.partId}</span>}
      {state?.formErrors && <span>{state.formErrors}</span>}
      <Submit value="Remove" />
    </form>
  );
};

const Submit: React.FC<{ value: string }> = ({ value }) => {
  const { pending } = useFormStatus();
  return <input type="submit" value={pending ? "..." : value} />;
};

export default ItemRemoveForm;
