import { getMongoDbCrudExecutor } from "@/lib/data";
import { Document, FindCursor, ObjectId, WithId } from "mongodb";
import React from "react";

type PartListSchema = {
  id: ObjectId;
  name: string;
  // background: {
  //   color: string;
  //   image: string;
  // };
  // description: string;
  parts: string[];
};

const fetchPartListData = async (cursor: FindCursor<WithId<Document>>) =>
  getMongoDbCrudExecutor("mah-yadak", async (db) => {
    await cursor.next();
  });

const PartList: React.FC<{ cursor: FindCursor<WithId<Document>> }> = async ({
  cursor,
}) => {
  const partListData = await fetchPartListData(cursor);
  return <div>{JSON.stringify(partListData)}</div>;
};

export default PartList;
