import { client, getCollection } from "./mongo";

export const getStats = async () => {
  const altitudes = await getCollection("altitudes");
  var startDate = new Date();
  startDate.setMinutes(startDate.getMinutes() - 5);
  const { avg, min, max, first } = await altitudes
    .aggregate([
      { $match: { lastUpdated: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          avg: { $avg: "$altitude" },
          min: { $min: "$altitude" },
          max: { $max: "$altitude" },
          first: { $min: "$lastUpdated" },
        },
      },
    ])
    .next();
  client.close();
  return { avg, min, max };
};

export const getAverages = async () => {
  const averages = await getCollection("averages");
  var startDate = new Date();
  startDate.setMinutes(startDate.getMinutes() - 2);
  return await averages
    .find({ lastUpdated: { $gte: startDate } })
    .sort({ lastUpdated: -1 })
    .toArray();
};

type HealthMessage =
  | "WARNING: RAPID ORBITAL DECAY IMMINENT"
  | "NO DATA"
  | "Altitude is A-OK"
  | "Sustained Low Earth Orbit Resumed";

export const healthMessage = (
  averages: { altitude: number; lastUpdated: Date }[]
): HealthMessage => {
  const THRESHOLD = 160;
  const BEGIN_DATE = new Date();
  BEGIN_DATE.setMinutes(BEGIN_DATE.getMinutes() - 2);
  const consideredAverages = averages.filter(
    (avg) => avg.lastUpdated >= BEGIN_DATE
  );

  if (consideredAverages.length) {
    let lastBelowThreshold: Date | null = null;
    let isBadFromBeginning = true;
    for (const avg of consideredAverages) {
      if (avg.altitude < THRESHOLD) {
        if (!lastBelowThreshold) {
          lastBelowThreshold = avg.lastUpdated;
        } else {
          if (
            Math.round(
              (lastBelowThreshold.getTime() - avg.lastUpdated.getTime()) / 1000
            ) >= 60
          ) {
            return isBadFromBeginning
              ? "WARNING: RAPID ORBITAL DECAY IMMINENT"
              : "Sustained Low Earth Orbit Resumed";
          }
        }
      } else {
        lastBelowThreshold = null;
        isBadFromBeginning = false;
      }
    }
    return "Altitude is A-OK";
  }
  // this was not in the specifications, but it seems particularly dangerous to say A-OK without data
  return "NO DATA";
};
