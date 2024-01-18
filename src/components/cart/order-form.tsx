"use client";
import { orderAction } from "@/lib/actions/order";
import React from "react";
import { useFormState, useFormStatus } from "react-dom";

interface Props {}

const OrderForm: React.FC<Props> = () => {
  const [state, dispatch] = useFormState(orderAction, undefined);
  return (
    <>
      <form action={dispatch}>
        {state?.formErrors &&
          state.formErrors.map((error, index) => (
            <React.Fragment key={index}>
              <span className="text-blue-500">{error}</span>
            </React.Fragment>
          ))}

        <label htmlFor="vendorInvoicePrint">vendorInvoicePrint</label>
        <input
          type="checkbox"
          name="vendorInvoicePrint"
          id="vendorInvoicePrint"
        />
        <label htmlFor="customerInvoicePrint">customerInvoicePrint</label>
        <input
          type="checkbox"
          name="customerInvoicePrint"
          id="customerInvoicePrint"
        />
        <Submit value="Order" />
      </form>
    </>
  );
};

const Submit: React.FC<{ value: string }> = ({ value }) => {
  const { pending } = useFormStatus();
  return <input type="submit" value={pending ? "..." : value} />;
};

export default OrderForm;
