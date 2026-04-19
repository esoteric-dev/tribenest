import { BaseController } from "@src/routes/baseController";
import { RouteHandler } from "@src/decorators";
import { NextFunction, Request, Response } from "express";

export class PublicScheduledStreamsController extends BaseController {
  @RouteHandler()
  async getLive(req: Request, _: Response, __: NextFunction): Promise<any> {
    const profileId = req.query.profileId as string;
    if (!profileId) return null;
    return this.services.admin.scheduledStreams.getLiveStream(profileId);
  }

  @RouteHandler()
  async getPlaylist(req: Request, _: Response, __: NextFunction): Promise<any> {
    const profileId = req.query.profileId as string;
    if (!profileId) return [];
    return this.services.admin.scheduledStreams.getPlaylist(profileId);
  }
}
