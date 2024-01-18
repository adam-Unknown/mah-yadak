"user client";
import React from "react";
import Image from "next/image";
import ItemEditForm from "./edit-form";
import ItemRemoveForm from "./remove-form";

export const revalidate = 3;

interface CartItemProps {
  index: number;
  id: string;
  quantity: number;
  brand: string;
  model: string;
  usedFor: string;
  imageUrl: string;
  isInStock: boolean;
  total: number;
}

const CartItem: React.FC<CartItemProps> = (props) => {
  return (
    <div className={`${!props.isInStock && "bg-orange-400"}`}>
      {!props.isInStock && <p>Out of Stock(edit the quantity or remove)</p>}
      <span>{props.index + 1}</span>
      <Image width={50} height={50} src={props.imageUrl} alt="x" />
      <span>{`
          ${props.brand} 
          ${props.model} 
          ${props.usedFor}
          `}</span>
      <span>{props.total} toman</span>
      <ItemEditForm partId={props.id} quantity={props.quantity} />
      <ItemRemoveForm partId={props.id} />
    </div>
  );
};

export default CartItem;
