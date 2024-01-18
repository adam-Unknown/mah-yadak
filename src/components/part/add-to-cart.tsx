"use client";
import { addItemAction } from "@/lib/actions/cart";
import React from "react";
import { useFormState, useFormStatus } from "react-dom";

interface Props {
  partId: string;
}

const AddToCartForm: React.FC<Props> = ({ partId }) => {
  const [state, dispatch] = useFormState(addItemAction, undefined);

  return (
    <form action={dispatch}>
      {state?.formErrors &&
        state.formErrors.map((error, index) => (
          <React.Fragment key={index}>
            <span>{error}</span>
          </React.Fragment>
        ))}
      <input type="hidden" name="partId" value={partId} />
      {state?.fieldErrors?.partId && <span>{state.fieldErrors.partId}</span>}
      <label htmlFor="quantity">quantity:</label>
      {state?.fieldErrors?.quantity && (
        <span>{state.fieldErrors.quantity}</span>
      )}
      <input type="number" name="quantity" id="quantity" />
      <SubmitButton />
    </form>
  );
};

export default AddToCartForm;

function SubmitButton() {
  const { pending } = useFormStatus();

  return <button type="submit">{pending ? "..." : "Add to Cart"}</button>;
}
