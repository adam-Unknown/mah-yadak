import PartList from "@/components/part-list";
import CardList from "@/components/part-list";
import { getMongoDbCrudExecutor } from "@/lib/data";
import { Document, FindCursor, WithId } from "mongodb";
import React, { Suspense } from "react";

const fetchPartListIdAll = getMongoDbCrudExecutor<FindCursor<WithId<Document>>>(
  "mah-yadak",
  async (db) => {
    return await db
      .collection("suggestions")
      .find({}, { projection: { _id: 1 } });
  }
);

// This store compoenent ui going to be smilar to Digikala ui
const Store: React.FC = async () => {
  const partListCursor = await fetchPartListIdAll();

  return (
    <div>
      <h1>Hello there!</h1>
      {(await partListCursor.hasNext()) && (
        <Suspense fallback={<p>Loadding...</p>}>
          <PartList cursor={partListCursor} />
        </Suspense>
      )}
    </div>
  );
};

export default Store;
