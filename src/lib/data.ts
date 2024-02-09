"use server";
import { Collection, MongoClient, ObjectId } from "mongodb";
import {
  UserSessionData,
  AggregatedPartSchema,
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
import { cartItemTypeInTable } from "@/components/cart/column-def";
import { ordersInTableType } from "@/components/order/column-def";
import { OrderItemsInTableType } from "../components/order/details/column-def";
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
  accounts
    .findOne({ phone: phone }, { projection: { _id: 0 } })
    .then((r) => UserSchema.parse(r))
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
  z.infer<typeof AggregatedPartSchema>,
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
    .then((res) => AggregatedPartSchema.parse(res[0]))
);

export const deductPart = getMongoDbCrudExecutor<
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
      if (res.modifiedCount !== 0) return true;

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
        .then((res) => !!res.matchedCount || !!res.upsertedCount);
    })
);

export const fetchCart = getMongoDbCrudExecutor<
  z.infer<typeof CartReadSchema>,
  { belongsTo: string }
>("carts", async (carts, { belongsTo }) =>
  carts.findOne({ belongsTo: belongsTo }).then((r) => CartReadSchema.parse(r))
);

export const fetchCartWithDetails = getMongoDbCrudExecutor<
  cartItemTypeInTable[],
  { belongsTo: string }
>(
  "carts",
  async (cart, { belongsTo }) =>
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
                  id: { $toString: "$_id" },
                  imageUrl: { $first: "$imageUrls" },
                  name: {
                    $reduce: {
                      input: {
                        $concatArrays: [
                          {
                            $split: [
                              {
                                $concat: [
                                  {
                                    $cond: {
                                      if: {
                                        $gt: [{ $size: "$model" }, 0],
                                      },
                                      then: {
                                        $first: "$model",
                                      },
                                      else: "",
                                    },
                                  },
                                  " ",
                                ],
                              },
                              "nonexistentSeparator",
                            ],
                          },
                          {
                            $cond: {
                              if: { $ne: ["$properties", ""] },
                              then: {
                                $split: [
                                  {
                                    $concat: ["$properties", " "],
                                  },
                                  "nonexistentSeparator",
                                ],
                              },
                              else: {
                                $split: ["", "nonexistentSeparator"],
                              },
                            },
                          },
                          {
                            $split: [
                              {
                                $concat: [
                                  {
                                    $cond: {
                                      if: {
                                        $gt: [{ $size: "$usedFor" }, 0],
                                      },
                                      then: {
                                        $first: "$usedFor",
                                      },
                                      else: "",
                                    },
                                  },
                                  " ",
                                ],
                              },
                              "nonexistentSeparator",
                            ],
                          },
                          {
                            $cond: {
                              if: { $ne: ["$brand", ""] },
                              then: {
                                $split: [
                                  { $concat: ["$brand", " "] },
                                  "nonexistentSeparator",
                                ],
                              },
                              else: {
                                $split: ["", "nonexistentSeparator"],
                              },
                            },
                          },
                        ],
                      },
                      initialValue: "",
                      in: { $concat: ["$$value", "$$this"] },
                    },
                  },
                  price: {
                    $multiply: ["$sale.buyPrice", "$sale.vat"],
                  },
                  isAvalibale: {
                    $gte: [
                      "$warehouse.stock",
                      { $sum: ["$$item.qty", "$withinOrderProcessing"] },
                    ],
                  },
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
            id: "$partDetails.id",
            isAvalibale: "$partDetails.isAvalibale",
            name: "$partDetails.name",
            imageUrl: "$partDetails.imageUrl",
            price: "$partDetails.price",
            quantity: "$items.quantity",
            total: {
              $multiply: ["$partDetails.price", "$items.quantity"],
            },
          },
        },
      ])
      .toArray() as Promise<cartItemTypeInTable[]>
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

export const fetchCartOrdability = getMongoDbCrudExecutor<
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
        $unwind: {
          path: "$items",
        },
      },
      {
        $lookup: {
          from: "parts",
          let: {
            partId: "$items.partId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    "$_id",
                    {
                      $toObjectId: "$$partId",
                    },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                quantity: {
                  $first: "$warehouse.stock",
                },
              },
            },
          ],
          as: "stock",
        },
      },
      {
        $addFields: {
          stock: "$stock.quantity",
        },
      },
      {
        $unwind: {
          path: "$stock",
        },
      },
      {
        $lookup: {
          from: "orders",
          let: {
            partId: "$items.partId",
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
        $unwind: {
          path: "$withinOrderProcessing",
        },
      },
      {
        $project: {
          isOrdable: {
            $gte: [
              "$stock",
              {
                $sum: ["$withinOrderProcessing", "$items.quantity"],
              },
            ],
          },
        },
      },
    ])
    .toArray()
    .then((r) => r.reduce((acc, cur) => acc && cur.isOrdable, true))
);

export const createOrder = getMongoDbCrudExecutor<
  string,
  {
    cart: z.infer<typeof CartReadSchema>;
    invoicesToPrint: { orderer: boolean; customer: boolean };
  }
>("orders", async (orders, { cart, invoicesToPrint }) =>
  orders
    .insertOne({
      ...cart,
      status: "در انتظار تایید",
      createdAt: new Date(),
      updatedAt: new Date(),
      customerInvoiceToPrint: invoicesToPrint.customer,
      ordererInvoiceToPrint: invoicesToPrint.orderer,
    })
    .then((r) => r.insertedId.toHexString())
);

export const fetchOrderDetails = getMongoDbCrudExecutor<
  any,
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
                id: { $toString: "$_id" },
                imageUrl: { $first: "$imageUrls" },
                name: {
                  $reduce: {
                    input: {
                      $concatArrays: [
                        {
                          $split: [
                            {
                              $concat: [
                                {
                                  $cond: {
                                    if: {
                                      $gt: [{ $size: "$model" }, 0],
                                    },
                                    then: {
                                      $first: "$model",
                                    },
                                    else: "",
                                  },
                                },
                                " ",
                              ],
                            },
                            "nonexistentSeparator",
                          ],
                        },
                        {
                          $cond: {
                            if: { $ne: ["$properties", ""] },
                            then: {
                              $split: [
                                {
                                  $concat: ["$properties", " "],
                                },
                                "nonexistentSeparator",
                              ],
                            },
                            else: {
                              $split: ["", "nonexistentSeparator"],
                            },
                          },
                        },
                        {
                          $split: [
                            {
                              $concat: [
                                {
                                  $cond: {
                                    if: {
                                      $gt: [{ $size: "$usedFor" }, 0],
                                    },
                                    then: {
                                      $first: "$usedFor",
                                    },
                                    else: "",
                                  },
                                },
                                " ",
                              ],
                            },
                            "nonexistentSeparator",
                          ],
                        },
                        {
                          $cond: {
                            if: { $ne: ["$brand", ""] },
                            then: {
                              $split: [
                                { $concat: ["$brand", " "] },
                                "nonexistentSeparator",
                              ],
                            },
                            else: {
                              $split: ["", "nonexistentSeparator"],
                            },
                          },
                        },
                      ],
                    },
                    initialValue: "",
                    in: { $concat: ["$$value", "$$this"] },
                  },
                },
                quantity: "$$item.quantity",
                price: {
                  $multiply: ["$sale.buyPrice", "$sale.vat"],
                },
                total: {
                  $multiply: ["$sale.buyPrice", "$sale.vat", "$$item.quantity"],
                },
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
          totalPrice: { $sum: "$items.total" },
          customerInvoiceToPrint: { $first: "$customerInvoiceToPrint" },
          ordererInvoiceToPrint: { $first: "$ordererInvoiceToPrint" },
        },
      },
    ])
    .next()
);

export const fetchOrders = getMongoDbCrudExecutor<
  ordersInTableType[],
  { belongsTo: string; skip: number; limit: number }
>(
  "orders",
  async (orders, { belongsTo, skip, limit }) =>
    orders
      .find({
        belongsTo: belongsTo,
      })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .project({
        _id: 0,
        id: { $toString: "$_id" },
        status: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .toArray() as Promise<ordersInTableType[]>
);

export const isCancelableOrder = getMongoDbCrudExecutor<boolean, string>(
  "orders",
  async (orders, orderId) =>
    orders
      .findOne({ _id: new ObjectId(orderId) })
      .then((r) => OrderStatus.parse(r?.status) === "در انتظار تایید")
);

export const updateOrderCancelation = getMongoDbCrudExecutor<
  boolean,
  { belongsTo: string; orderId: string }
>("orders", async (orders, { belongsTo, orderId }) =>
  orders
    .updateOne(
      { _id: new ObjectId(orderId), belongsTo },
      {
        $set: {
          status: OrderStatus.Values["لغو شده توسط مشتری"],
          updatedAt: new Date(),
        },
      }
    )
    .then((r) => !!r.modifiedCount)
);

export const fetchStoreStatus = getMongoDbCrudExecutor(
  "store-status",
  async (storeStatus) =>
    storeStatus
      .findOne({})
      .then((r) => r as { store?: boolean; servicing?: boolean })
);
