import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { PublicStreamPlaylistsController } from "./controller";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new PublicStreamPlaylistsController(services, workers);
  router.get("/live", (...args) => controller.getLive(...args));
  router.post("/:id/advance", (...args) => controller.advance(...args));
  return router;
};

export default { path: "/public/stream-playlists", init };
