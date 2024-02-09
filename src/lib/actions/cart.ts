"use server";

import { z } from "zod";
import {
  addToCart,
  editCartItem,
  fetchPartAvailability,
  getMongoDbCrudExecutor,
  getUserSession,
  removeCartItem,
} from "../data";
import { ObjectId } from "mongodb";
import { cartItemSchema } from "@/components/cart/edit-cart";

export type ActionResultType = {
  success: boolean;
  message: string;
};

export async function addItemToCart(
  item: z.infer<typeof cartItemSchema>
): Promise<ActionResultType> {
  const {
    user: { phone },
  } = await getUserSession();

  const isAvailable = await fetchPartAvailability({
    belongsTo: phone,
    ...item,
  });

  if (!isAvailable) {
    return {
      success: false,
      message: "متاسفانه در انبار به میزان درخواستی شما موجود نمی باشد.",
    };
  }

  if (!(await addToCart({ belongsTo: phone, ...item })))
    return {
      success: false,
      message: "متاسفانه محصول به سبد خرید شما اضافه نشد.",
    };

  return { success: true, message: "با موفقیت به سبد خرید شما اضافه گردید." };
}

export async function editItemInCart(
  item: z.infer<typeof cartItemSchema>
): Promise<ActionResultType> {
  const {
    user: { phone },
  } = await getUserSession();

  const _fetchPartAvailability = getMongoDbCrudExecutor<
    boolean,
    { belongsTo: string; partId: string; quantity: number }
  >("parts", async (parts, { belongsTo, partId, quantity }) =>
    parts
      .aggregate([
        {
          $match: {
            _id: new ObjectId(partId),
          },
        },
        {
          $lookup: {
            from: "carts",
            let: {
              partId: {
                $toString: "$_id",
              },
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$belongsTo", belongsTo],
                      },
                    ],
                  },
                },
              },
              {
                $unwind: {
                  path: "$items",
                },
              },
              {
                $match: {
                  $expr: {
                    $eq: ["$items.partId", "$$partId"],
                  },
                },
              },
              {
                $project: {
                  quantity: "$items.quantity",
                },
              },
            ],
            as: "withinCart",
          },
        },
        {
          $addFields: {
            withinCart: {
              $sum: ["$withinCart.quantity"],
            },
          },
        },
        {
          $lookup: {
            from: "orders",
            let: {
              partId: {
                $toString: "$_id",
              },
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: [
                      "$status",
                      ["تایید شده و در حال ارسال", "در انتظار تایید"],
                    ],
                  },
                },
              },
              {
                $unwind: {
                  path: "$items",
                },
              },
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$items.partId", "$$partId"],
                      },
                    ],
                  },
                },
              },
              {
                $project: {
                  quantity: "$items.quantity",
                },
              },
            ],
            as: "withinOrderProcessing",
          },
        },
        {
          $addFields: {
            withinOrderProcessing: {
              $sum: ["$withinOrderProcessing.quantity"],
            },
          },
        },
        {
          $project: {
            _id: 0,
            isAvailable: {
              $gte: [
                "$warehouse.stock",
                {
                  $sum: ["$withinOrderProcessing", quantity],
                },
              ],
            },
          },
        },
      ])
      .next()
      .then((r) => !!r?.isAvailable)
  );

  const salable = await _fetchPartAvailability({
    belongsTo: phone,
    ...item,
  });
  if (!salable)
    return {
      success: false,
      message: "متاسفانه در انبار به میزان درخواستی شما موجود نمی باشد.",
    };

  if (
    !(await editCartItem({
      belongsTo: phone,
      ...item,
    }))
  )
    return {
      success: false,
      message: "متاسفانه ویرایش انجام نشد.",
    };

  return {
    success: true,
    message: "ویرایش انجام شد.",
  };
}

export async function removeItemFromCart(
  id: string
): Promise<ActionResultType> {
  const {
    user: { phone },
  } = await getUserSession();

  if (
    !!(await removeCartItem({
      belongsTo: phone,
      partId: id,
    }))
  )
    return {
      success: true,
      message: "با موفقیت از سبد خرید شما حذف گردید.",
    };

  return {
    success: false,
    message: "خطا در حذف از سبد خرید شما.",
  };
}
