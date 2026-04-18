import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { ScheduledStreamsController } from "./controller";
import { requireAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new ScheduledStreamsController(services, workers);

  router.use((req, _, next) => requireAuthentication(req, next, services));

  router.post("/presigned-url", (...args) => controller.getPresignedUrl(...args));
  router.post("/", (...args) => controller.create(...args));
  router.get("/", (...args) => controller.list(...args));
  router.delete("/:id", (...args) => controller.remove(...args));

  return router;
};

export default {
  path: "/scheduled-streams",
  init,
};
