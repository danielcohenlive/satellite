import { client, getCollection } from "./mongo";

const migrate = async () => {
  const altitudes = await getCollection("altitudes");
  const averages = await getCollection("averages");
  await altitudes.createIndex({ lastUpdated: 1 }, { expireAfterSeconds: 5 * 60 });
  await averages.createIndex({ lastUpdated: 1 }, { expireAfterSeconds: 5 * 60 });
  console.log("Migrations ran successfully");
};

migrate().finally(() => {client.close(); process.exit(0)});
