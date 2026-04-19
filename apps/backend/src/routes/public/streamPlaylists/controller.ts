import { BaseController } from "@src/routes/baseController";
import { RouteHandler } from "@src/decorators";
import { NextFunction, Request, Response } from "express";

export class PublicStreamPlaylistsController extends BaseController {
  @RouteHandler()
  async getLive(req: Request, _: Response, __: NextFunction): Promise<any> {
    const profileId = req.query.profileId as string;
    if (!profileId) return null;
    return this.services.admin.streamPlaylist.getLiveForProfile(profileId);
  }

  @RouteHandler()
  async advance(req: Request, _: Response, __: NextFunction): Promise<any> {
    const { id } = req.params;
    const { expectedIndex } = req.body;
    return this.services.admin.streamPlaylist.advancePublic(id, expectedIndex);
  }
}
