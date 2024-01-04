import { Db, MongoClient } from "mongodb";

export const performMongoDbCRUD = async <T = unknown>(
  crud: (db: Db) => Promise<T>
): Promise<T> => {
  const client = new MongoClient(process.env.MONGODB_URL || "none");
  try {
    const MongoClient = await client.connect();
    const db = MongoClient.db("mah-yadak");
    return await crud(db);
  } finally {
    await client.close();
  }
};
