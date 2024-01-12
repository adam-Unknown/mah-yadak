"use server";
import { Collection, Db, MongoClient, ObjectId } from "mongodb";
import {
  CartItem,
  AggregatedSuggestionsSchema,
  ICart,
  PartSchema,
  UserSessionData,
  AggregatedPartSchama,
} from "./definition";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { userSessionOptions } from "@/session.config";
import { z } from "zod";

export const getMongoDbCrudExecutor =
  <T = unknown>(
    collection: string,
    crud: (collection: Collection, args?: any) => Promise<T>
  ) =>
  async (args?: any): Promise<T> => {
    const client = new MongoClient(process.env.MONGODB_URL || "none");
    try {
      const MongoClient = await client.connect();
      console.log("Connected successfully to server");
      const db = MongoClient.db("mah-yadak");
      return await crud(db.collection(collection), args);
    } finally {
      await client.close();
      console.log("Disconnect from mongoDB");
    }
  };

export const getCart = async () => {
  const session = await getIronSession<UserSessionData>(
    cookies(),
    userSessionOptions
  );
  if (!session.cart) {
    session.cart = [];
  }

  return session.cart;
};

export const isRegistered = async (phone: string) => {
  return await getMongoDbCrudExecutor("account", async (account) => {
    const doc = await account.findOne(
      { phone: phone },
      { projection: { phone: 1 } }
    );
    return !!doc;
  })();
};

export const fetchPart = getMongoDbCrudExecutor("parts", async (Parts, id) =>
  AggregatedPartSchama.parse(
    (
      await Parts.aggregate([
        {
          $match: {
            $expr: {
              $eq: ["$_id", ObjectId.createFromHexString(id)],
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
            available: {
              $cond: {
                if: {
                  $and: [
                    {
                      $gte: ["$warehouse.stock", 0],
                    },
                  ],
                },
                then: true,
                else: false,
              },
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
      ]).toArray()
    )[0]
  )
);

export const fetchSuggestions = getMongoDbCrudExecutor<
  z.infer<typeof AggregatedSuggestionsSchema>
>("suggestions", async (Suggessions) =>
  AggregatedSuggestionsSchema.parse(
    await Suggessions.aggregate([
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
    ]).toArray()
  )
);
