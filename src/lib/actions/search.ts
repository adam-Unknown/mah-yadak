"use server";

import { AutoCompleteItemType } from "@/app/(main)/store/search-bar";
import { getMongoDbCrudExecutor } from "../data";

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
