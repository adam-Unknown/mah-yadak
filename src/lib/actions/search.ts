"use server";

import { AutoCompleteItemType } from "@/app/(main)/store/search-bar";
import { getMongoDbCrudExecutor, getUserSession } from "../data";
import { PartSearchResultItemType } from "@/app/(main)/store/search/page";

export default async function fetchAutoComplete(
  query: string
): Promise<AutoCompleteItemType[]> {
  return await getMongoDbCrudExecutor(
    "parts",
    async (parts) =>
      parts
        .aggregate([
          {
            $search: {
              index: "autocomplete",
              compound: {
                should: [
                  { autocomplete: { query: query, path: "model" } },
                  { autocomplete: { query: query, path: "usedFor" } },
                  { autocomplete: { query: query, path: "properties" } },
                  { autocomplete: { query: query, path: "brand" } },
                ],
              },
            },
          },
          {
            $sort: {
              score: -1,
            },
          },
          {
            $limit: 5,
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
            },
          },
        ])
        .toArray() as Promise<AutoCompleteItemType[]>
  )();
}

export async function fetchPartsWithFilter(
  query: string,
  skip: number,
  limit: number
): Promise<any> {
  const session = await getUserSession();
  if (!query || query.length < 2) return [];
  const result = await getMongoDbCrudExecutor("parts", async (parts) =>
    parts
      .aggregate([
        {
          $search: {
            index: "autocomplete",
            compound: {
              should: [
                { text: { query: query, path: "category" } },
                { autocomplete: { query: query, path: "model" } },
                { autocomplete: { query: query, path: "usedFor" } },
                { autocomplete: { query: query, path: "properties" } },
                { autocomplete: { query: query, path: "brand" } },
              ],
            },
          },
        },
        {
          $sort: {
            score: -1,
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
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
            model: { $first: "$model" },
            usedFor: 1,
            brand: 1,
            properties: 1,
            price: session.user
              ? {
                  $multiply: ["$sale.buyPrice", { $sum: ["$sale.vat", 1] }],
                }
              : null,
            available: {
              $gte: [
                { $subtract: ["$warehouse.stock", "$withinOrderProcessing"] },
                1,
              ],
            },
          },
        },
      ])
      .toArray()
  )();

  return result;
}
