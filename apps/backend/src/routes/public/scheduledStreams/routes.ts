import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { PublicScheduledStreamsController } from "./controller";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new PublicScheduledStreamsController(services, workers);

  // Returns the currently live scheduled stream for a profile (no auth)
  router.get("/live", (...args) => controller.getLive(...args));

  return router;
};

export default {
  path: "/public/scheduled-streams",
  init,
};
