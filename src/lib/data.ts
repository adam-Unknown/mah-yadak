"use server";
import { Collection, MongoClient, ObjectId } from "mongodb";
import {
  UserSessionData,
  AggregatedPartSchama,
  UserSchema,
  OrderCreateSchema,
  CartItemEditForm,
  AggregatedCartSchema,
  AggregatedOrderSchema,
  CartReadSchema,
  OrdersReadSchema,
  OrderStatus,
} from "./definition";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { userSessionOptions } from "@/session.config";
import { AggregatedSuggestionsSchema } from "./definition";
import { z } from "zod";
export const getMongoDbCrudExecutor =
  <T = any, U = void>(
    collection: string,
    crud: (collection: Collection, args: U) => Promise<T>
  ) =>
  async (args: U): Promise<T> => {
    const client = new MongoClient(process.env.MONGODB_URL ?? "");
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      return await crud(client.db("mah_yadak").collection(collection), args);
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
    return await crud(client.db("mah_yadak").collection(collection), args);
  };

export const fetchUser = getMongoDbCrudExecutor<
  z.infer<typeof UserSchema>,
  string
>("accounts", async (accounts, phone) =>
  UserSchema.parse(
    await accounts.findOne({ phone: phone }, { projection: { _id: 0 } })
  )
);

export const getUserSession = async () =>
  await getIronSession<UserSessionData>(cookies(), userSessionOptions);

export const isRegistered = getMongoDbCrudExecutor<boolean, string>(
  "accounts",
  async (account, phone) =>
    account
      .findOne({ phone: phone }, { projection: { phone: 1 } })
      .then((r) => !!r)
);

export const fetchPart = getMongoDbCrudExecutor<
  z.infer<typeof AggregatedPartSchama>,
  { belongsTo?: string; partId: string }
>("parts", async (Parts, { belongsTo, partId }) =>
  Parts.aggregate([
    {
      $match: {
        $expr: {
          $eq: ["$_id", { $toObjectId: partId }],
        },
      },
    },
    {
      $addFields: {
        id: {
          $toString: "$_id",
        },
        price: {
          $multiply: ["$sale.purchasePrice", "$sale.interestRates"],
        },
        isInStock: {
          $gte: ["$warehouse.stock", 1],
        },
      },
    },
    {
      $project: {
        _id: 0,
        warehouse: 0,
        sale: 0,
      },
    },
  ])
    .toArray()
    .then((res) => AggregatedPartSchama.parse(res[0]))
);

export const updatePart = getMongoDbCrudExecutor<
  boolean,
  { partId: string; quantity: number }
>("parts", async (parts, { partId, quantity }) =>
  parts
    .updateOne(
      {
        _id: {
          $eq: new ObjectId(partId),
        },
      },
      {
        $inc: { "warehouse.stock": -quantity },
      }
    )
    .then((r) => !!r.modifiedCount)
);

export const fetchSuggestions = getMongoDbCrudExecutor(
  "suggestions",
  async (Suggessions) =>
    Suggessions.aggregate([
      {
        $lookup: {
          from: "parts",
          let: {
            suggestion_part_ids: "$partIds",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: [
                    "$_id",
                    {
                      $map: {
                        input: "$$suggestion_part_ids",
                        as: "partId",
                        in: {
                          $toObjectId: "$$partId",
                        },
                      },
                    },
                  ],
                },
              },
            },
            {
              $project: {
                id: { $toString: "$_id" },
                imageUrl: { $arrayElemAt: ["$imageUrls", 0] },
                category: 1,
                model: 1,
                brand: 1,
                "sale.salesPrice": 1,
                usedFor: 1,
                suitableFor: 1,
              },
            },
          ],
          as: "parts",
        },
      },
    ])
      .toArray()
      .then((r) => AggregatedSuggestionsSchema.parse(r))
);

export const fetchPartAvailability = getMongoDbCrudExecutor<
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
                  $and: [
                    {
                      $ne: ["$status", "COMPLETED"],
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
                $sum: ["$withinCart", "$withinOrderProcessing", quantity],
              },
            ],
          },
        },
      },
    ])
    .next()
    .then((r) => !!r?.isAvailable)
);

export const addToCart = getMongoDbCrudExecutor<
  boolean,
  { belongsTo: string; partId: string; quantity: number }
>("carts", async (carts, { belongsTo, partId, quantity }) =>
  carts
    .updateOne(
      { belongsTo: belongsTo, "items.partId": partId },
      {
        $inc: {
          "items.$.quantity": quantity,
        },
      }
    )
    .then((res) => {
      if (!res.acknowledged) return false;
      if (res.matchedCount !== 0) return true;

      return carts
        .updateOne(
          { belongsTo: belongsTo },
          {
            $push: {
              items: {
                partId: partId,
                quantity: quantity,
              },
            },
          },
          {
            upsert: true,
          }
        )
        .then((res) => !!res.modifiedCount);
    })
);

export const fetchCart = getMongoDbCrudExecutor<
  z.infer<typeof CartReadSchema>,
  { belongsTo: string }
>("carts", async (carts, { belongsTo }) =>
  carts.findOne({ belongsTo: belongsTo }).then((r) => CartReadSchema.parse(r))
);

export const fetchCartWithDetails = getMongoDbCrudExecutor<
  z.infer<typeof AggregatedCartSchema>,
  { belongsTo: string }
>("carts", async (cart, { belongsTo }) =>
  cart
    .aggregate([
      {
        $match: {
          belongsTo: belongsTo,
        },
      },
      {
        $unwind: {
          path: "$items",
        },
      },
      {
        $lookup: {
          from: "parts",
          let: {
            item: {
              partId: {
                $toObjectId: "$items.partId",
              },
              qty: "$items.quantity",
            },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$item.partId"],
                },
              },
            },
            {
              $project: {
                _id: 0,
                id: { $toString: "$_id" },
                brand: 1,
                price: {
                  $multiply: ["$sale.purchasePrice", "$sale.interestRates"],
                },
                imageUrl: {
                  $arrayElemAt: ["$imageUrls", 0],
                },
                model: {
                  $arrayElemAt: ["$model", 0],
                },
                usedFor: {
                  $arrayElemAt: ["$usedFor", 0],
                },
                suitableFor: {
                  $arrayElemAt: ["$suitableFor", 0],
                },
                isInStock: { $gte: ["$warehouse.stock", "$$item.qty"] },
              },
            },
          ],
          as: "partDetails",
        },
      },
      {
        $unwind: {
          path: "$partDetails",
        },
      },
      {
        $project: {
          _id: 0,
          partDetails: 1,
          quantity: "$items.quantity",
          totalPrice: {
            $multiply: ["$partDetails.price", "$items.quantity"],
          },
        },
      },
    ])
    .toArray()
    .then((cart) => AggregatedCartSchema.parse(cart))
);

export const editCartItem = getMongoDbCrudExecutor<
  boolean,
  { belongsTo: string; partId: string; quantity: number }
>("carts", async (carts, { belongsTo, partId, quantity }) =>
  carts
    .updateOne(
      {
        belongsTo: belongsTo,
      },
      {
        $set: {
          "items.$[item].quantity": quantity,
        },
      },
      {
        arrayFilters: [{ "item.partId": { $eq: partId } }],
      }
    )
    .then((res) => !!res.modifiedCount)
);

export const removeCartItem = getMongoDbCrudExecutor<
  boolean,
  { belongsTo: string; partId: string }
>("carts", async (carts, { belongsTo, partId }) =>
  carts
    .updateOne(
      {
        belongsTo: belongsTo,
      },
      {
        $pull: { items: { partId: { $eq: partId } } },
      }
    )
    .then((res) => !!res.modifiedCount)
);

export const fetchOrderable = getMongoDbCrudExecutor<
  boolean,
  { belongsTo: string }
>("carts", async (carts, { belongsTo }) =>
  carts
    .aggregate([
      {
        $match: {
          belongsTo: belongsTo,
        },
      },
      {
        $unwind: { path: "$items" },
      },
      {
        $lookup: {
          from: "parts",
          let: {
            item: {
              partId: {
                $toObjectId: "$items.partId",
              },
              qty: "$items.quantity",
            },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$item.partId"],
                },
              },
            },
            {
              $project: {
                _id: 0,
                salable: { $gte: ["$warehouse.stock", "$$item.qty"] },
              },
            },
          ],
          as: "status",
        },
      },
      {
        $project: {
          status: 1,
        },
      },
      {
        $unwind: { path: "$status" },
      },
    ])
    .toArray()
    .then((res) => {
      return res.every((r) => r.status.salable);
    })
);

export const createOrder = getMongoDbCrudExecutor<
  string,
  {
    cart: z.infer<typeof CartReadSchema>;
    invoicesPrint: { cooperate: boolean; customer: boolean };
  }
>("orders", async (orders, { cart, invoicesPrint }) =>
  orders
    .insertOne({
      ...cart,
      status: "CONFIRMING",
      createdAt: new Date(),
      updatedAt: new Date(),
      cooperatesInvoicePrint: invoicesPrint.cooperate,
      customerInvoicePrint: invoicesPrint.customer,
    } satisfies z.infer<typeof OrderCreateSchema>)
    .then((r) => r.insertedId.toHexString())
);

export const fetchOrderDetails = getMongoDbCrudExecutor<
  z.infer<typeof AggregatedOrderSchema>,
  { belongsTo: string; orderId: string }
>("orders", async (orders, { belongsTo, orderId }) =>
  orders
    .aggregate([
      {
        $match: {
          $and: [
            {
              _id: new ObjectId(orderId),
            },
            {
              belongsTo: belongsTo,
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$items",
        },
      },
      {
        $lookup: {
          from: "parts",
          let: {
            item: {
              partId: {
                $toObjectId: "$items.partId",
              },
              quantity: "$items.quantity",
            },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$item.partId"],
                },
              },
            },
            {
              $project: {
                _id: 0,
                id: {
                  $toString: "$_id",
                },
                brand: 1,
                price: {
                  $multiply: ["$sale.purchasePrice", "$sale.interestRates"],
                },
                imageUrl: {
                  $arrayElemAt: ["$imageUrls", 0],
                },
                model: {
                  $arrayElemAt: ["$model", 0],
                },
                usedFor: {
                  $arrayElemAt: ["$usedFor", 0],
                },
                suitableFor: {
                  $arrayElemAt: ["$suitableFor", 0],
                },
                quantity: "$$item.quantity",
              },
            },
          ],
          as: "items",
        },
      },
      {
        $unwind: { path: "$items" },
      },
      {
        $group: {
          _id: "$_id",
          items: { $push: "$items" },
          status: { $first: "$status" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          cooperatesInvoicePrint: { $first: "$cooperatesInvoicePrint" },
          customerInvoicePrint: { $first: "$customerInvoicePrint" },
        },
      },
    ])
    .next()
    .then((order) => {
      return AggregatedOrderSchema.parse(order);
    })
);

export const fetchOrders = getMongoDbCrudExecutor<
  z.infer<typeof OrdersReadSchema>,
  { belongsTo: string }
>("orders", async (orders, { belongsTo }) =>
  orders
    .aggregate([
      {
        $match: {
          belongsTo: belongsTo,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ])
    .toArray()
    .then((orders) =>
      OrdersReadSchema.parse(
        orders.map((order) => ({ ...order, id: order._id.toString() }))
      )
    )
);

export const isCancelableOrder = getMongoDbCrudExecutor<
  boolean,
  { orderId: string }
>("orders", async (orders, { orderId }) =>
  orders
    .findOne({ _id: new ObjectId(orderId) })
    .then((r) => OrderStatus.parse(r?.status) === "CONFIRMING")
);

export const cancelOrder = getMongoDbCrudExecutor<
  boolean,
  { belongsTo: string; orderId: string }
>("orders", async (orders, { belongsTo, orderId }) =>
  orders
    .deleteOne({ _id: new ObjectId(orderId), belongsTo })
    .then((r) => !!r.deletedCount)
);
