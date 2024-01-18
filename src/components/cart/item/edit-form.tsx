"use client";
import { editItemAction } from "@/lib/actions/cart";
import { useRouter } from "next/navigation";
import React from "react";
import { useFormState, useFormStatus } from "react-dom";

interface ItemEditFormProps {
  partId: string;
  quantity: number;
}

const ItemEditForm: React.FC<ItemEditFormProps> = (props) => {
  const [state, dispatch] = useFormState(editItemAction, undefined);
  const router = useRouter();

  if (state?.success) router.refresh();

  return (
    <form action={dispatch}>
      <input type="hidden" name="partId" value={props.partId} />
      {state?.fieldErrors?.partId && <span>{state.fieldErrors.partId}</span>}
      <label htmlFor="quantity">Qty:</label>
      <input
        id="quantity"
        name="quantity"
        type="number"
        defaultValue={props.quantity}
      />
      {state?.fieldErrors?.quantity && (
        <span>{state.fieldErrors.quantity}</span>
      )}
      <Submit value="Edit" />
    </form>
  );
};

const Submit: React.FC<{ value: string }> = ({ value }) => {
  const { pending } = useFormStatus();
  return <input type="submit" value={pending ? "..." : value} />;
};

export default ItemEditForm;
