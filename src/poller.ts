import { client, getCollection } from "./mongo";
import axios from "axios";
import { getStats } from "./stats";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const parseDateString = (date: string): Date => new Date(date + "Z");

const poll = async () => {
  const addEntry = async () => {
    const altitudes = await getCollection("altitudes");
    const {
      data: { last_updated: lastUpdated, altitude },
    } = await axios.get("http://nestio.space/api/satellite/data");
    const lastUpdatedDate = parseDateString(lastUpdated);
    console.log("Adding entry for", lastUpdatedDate, altitude);
    await altitudes.updateOne(
      { lastUpdated: lastUpdatedDate },
      { $set: { altitude } },
      { upsert: true }
    );
  };
  const recordAverage = async () => {
    const averages = await getCollection("averages");
    const { avg } = await getStats();
    await averages.insertOne({ lastUpdated: new Date(), altitude: avg });
  };
  try {
    while (true) {
      addEntry().then(() => recordAverage());
      await delay(10 * 1000);
    }
  } catch (e) {
    console.log(e);
  }
};
poll().finally(() => client.close());
