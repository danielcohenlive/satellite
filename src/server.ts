// @ts-ignore
import NodeRestServer from "node-rest-server";
import { getAverages, getStats, healthMessage } from "./stats";

const routeConfig = {
  "/stats": {
    method: "GET",
    status: 200,
    controller: async () => {
      return await getStats();
    },
  },
  "/health": {
    method: "GET",
    status: 200,
    controller: async () => {
      const averages = await getAverages();
      return healthMessage(averages);
    },
  },
};

NodeRestServer(routeConfig);
