"use server";

import { sessionOptions } from "@/session.config";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { PartShcema, SessionData } from "../definition";
import { ObjectId } from "mongodb";
import { getMongoDbCrudExecutor } from "../data";
import { z } from "zod";
import { sleep } from "@/lib/utils/helper";

const fetchPart = getMongoDbCrudExecutor<PartShcema>(
  "parts",
  async (db, arg: { _id: ObjectId }) =>
    (await db.collection("parts").findOne(arg)) as PartShcema
);

interface State {
  formErrors?: string;
  fieldErrors?: { id?: string[]; quantity?: string[] };
}

export const addItem = async (
  prevState: State | undefined,
  formData: FormData
): Promise<State | undefined> => {
  //  validating the formData
  const validatedFields = AddToCartFormSchema.safeParse({
    id: formData.get("id"),
    quantity: formData.get("quantity"),
  });

  if (!validatedFields.success)
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };

  const { id, quantity } = validatedFields.data;
  //  checking if the part exists
  if (fetchPart(new ObjectId(id)) == null) {
    return {};
  }

  //  reading the session and..
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  if (!session.cart) {
    session.cart = [];
  }

  session.cart.push({
    _id: new ObjectId(id),
    quantity: quantity,
  });

  await session.save();

  //  Mutate the cart by tag with nextjs
};
