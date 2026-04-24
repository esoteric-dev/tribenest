import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { StreamPlaylistsController } from "./controller";
import { requireAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new StreamPlaylistsController(services, workers);

  router.use((req, _, next) => requireAuthentication(req, next, services));

  // Presigned URL for video upload (legacy single-PUT)
  router.post("/presigned-url", (...args) => controller.getPresignedUrl(...args));
  // Multipart upload for large files
  router.post("/multipart/start", (...args) => controller.multipartStart(...args));
  router.post("/multipart/part-url", (...args) => controller.multipartPartUrl(...args));
  router.post("/multipart/complete", (...args) => controller.multipartComplete(...args));
  router.post("/multipart/abort", (...args) => controller.multipartAbort(...args));
  // CRUD
  router.post("/", (...args) => controller.create(...args));
  router.get("/", (...args) => controller.list(...args));
  router.get("/:id", (...args) => controller.getOne(...args));
  router.patch("/:id", (...args) => controller.update(...args));
  router.delete("/:id", (...args) => controller.remove(...args));
  // Video management
  router.post("/:id/videos", (...args) => controller.addVideo(...args));
  router.patch("/:id/videos/:videoId", (...args) => controller.updateVideo(...args));
  router.delete("/:id/videos/:videoId", (...args) => controller.removeVideo(...args));
  // Playback control
  router.post("/:id/start", (...args) => controller.start(...args));
  router.post("/:id/stop", (...args) => controller.stop(...args));
  router.post("/:id/pause", (...args) => controller.pause(...args));
  router.post("/:id/resume", (...args) => controller.resume(...args));
  router.post("/:id/advance", (...args) => controller.advance(...args));

  return router;
};

export default { path: "/stream-playlists", init };
