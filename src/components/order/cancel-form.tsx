"use client";
import { cancelOrderAction } from "@/lib/actions/order";
import React from "react";
import { useFormState, useFormStatus } from "react-dom";

interface CancelOrderFormProps {
  orderId: string;
}

const CancelOrderForm: React.FC<CancelOrderFormProps> = ({ orderId }) => {
  const [state, dispatch] = useFormState(cancelOrderAction, undefined);

  return (
    <form action={dispatch}>
      {state?.formErrors &&
        state.formErrors.map((error, index) => (
          <React.Fragment key={index}>
            <span className="text-blue-500">{error}</span>
          </React.Fragment>
        ))}
      <input type="hidden" name="orderId" value={orderId} />
      <Submit value="Cancel" />
    </form>
  );
};

const Submit: React.FC<{ value: string }> = ({ value }) => {
  const { pending } = useFormStatus();
  return <input type="submit" value={pending ? "..." : value} />;
};

export default CancelOrderForm;
