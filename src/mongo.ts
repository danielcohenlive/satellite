import { MongoClient } from "mongodb";

const url =
  process.env.DATABASE_URL ?? "mongodb://root:example@localhost:27017";

export const dbName = "satelite";
export const client = new MongoClient(url);
export const getCollection = async (collectionName: string) => {
  await client.connect();
  const db = client.db(dbName);
  return db.collection(collectionName);
};
