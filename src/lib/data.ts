"use server";
import { Db, MongoClient } from "mongodb";

export const getMongoDbCrudExecutor =
  <T = unknown>(dbName: string, crud: (db: Db) => Promise<T>) =>
  async (): Promise<T> => {
    const client = new MongoClient(process.env.MONGODB_URL || "none");
      const MongoClient = await client.connect();
      console.log("DB connected!");
      const db = MongoClient.db(dbName);
      client.close();
      return await crud(db);
  };
