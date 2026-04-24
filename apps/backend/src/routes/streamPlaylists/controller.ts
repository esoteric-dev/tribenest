import { BaseController } from "@src/routes/baseController";
import { RouteHandler } from "@src/decorators";
import { NextFunction, Request, Response } from "express";

export class StreamPlaylistsController extends BaseController {
  @RouteHandler()
  async getPresignedUrl(req: Request, _: Response, __: NextFunction): Promise<any> {
    const { profileId, filename } = req.body;
    return this.services.admin.streamPlaylist.getPresignedUploadUrl(profileId, filename);
  }

  @RouteHandler()
  async multipartStart(req: Request, _: Response, __: NextFunction): Promise<any> {
    const { profileId, filename } = req.body;
    return this.services.admin.streamPlaylist.initiateMultipartUpload(profileId, filename);
  }

  @RouteHandler()
  async multipartPartUrl(req: Request, _: Response, __: NextFunction): Promise<any> {
    const { profileId, key, uploadId, partNumber } = req.body;
    return this.services.admin.streamPlaylist.getPresignedPartUrl(profileId, key, uploadId, partNumber);
  }

  @RouteHandler()
  async multipartComplete(req: Request, _: Response, __: NextFunction): Promise<any> {
    const { profileId, key, uploadId } = req.body;
    return this.services.admin.streamPlaylist.completeMultipartUpload(profileId, key, uploadId);
  }

  @RouteHandler({ statusCode: 204 })
  async multipartAbort(req: Request, _: Response, __: NextFunction): Promise<any> {
    const { profileId, key, uploadId } = req.body;
    await this.services.admin.streamPlaylist.abortMultipartUpload(profileId, key, uploadId);
    return null;
  }

  @RouteHandler({ statusCode: 201 })
  async create(req: Request, _: Response, __: NextFunction): Promise<any> {
    const { profileId, title, repeatCount, scheduledStartAt, scheduledEndAt } = req.body;
    return this.services.admin.streamPlaylist.create({ profileId, title, repeatCount, scheduledStartAt, scheduledEndAt });
  }

  @RouteHandler()
  async list(req: Request, _: Response, __: NextFunction): Promise<any> {
    const profileId = req.query.profileId as string;
    return this.services.admin.streamPlaylist.list(profileId);
  }

  @RouteHandler()
  async getOne(req: Request, _: Response, __: NextFunction): Promise<any> {
    const profileId = req.query.profileId as string;
    return this.services.admin.streamPlaylist.getWithItems(req.params.id, profileId);
  }

  @RouteHandler()
  async update(req: Request, _: Response, __: NextFunction): Promise<any> {
    const profileId = req.query.profileId as string;
    return this.services.admin.streamPlaylist.update(req.params.id, profileId, req.body);
  }

  @RouteHandler({ statusCode: 204 })
  async remove(req: Request, _: Response, __: NextFunction): Promise<any> {
    const profileId = req.query.profileId as string;
    await this.services.admin.streamPlaylist.delete(req.params.id, profileId);
    return null;
  }

  @RouteHandler({ statusCode: 201 })
  async addVideo(req: Request, _: Response, __: NextFunction): Promise<any> {
    const profileId = req.query.profileId as string;
    const { title, videoUrl, videoFilename, description } = req.body;
    return this.services.admin.streamPlaylist.addVideo(req.params.id, profileId, { title, videoUrl, videoFilename, description: description ?? null });
  }

  @RouteHandler()
  async updateVideo(req: Request, _: Response, __: NextFunction): Promise<any> {
    const profileId = req.query.profileId as string;
    const { title, description } = req.body;
    return this.services.admin.streamPlaylist.updateVideo(req.params.videoId, req.params.id, profileId, { title, description });
  }

  @RouteHandler({ statusCode: 204 })
  async removeVideo(req: Request, _: Response, __: NextFunction): Promise<any> {
    const profileId = req.query.profileId as string;
    await this.services.admin.streamPlaylist.removeVideo(req.params.videoId, req.params.id, profileId);
    return null;
  }

  @RouteHandler()
  async start(req: Request, _: Response, __: NextFunction): Promise<any> {
    const profileId = req.query.profileId as string;
    return this.services.admin.streamPlaylist.start(req.params.id, profileId);
  }

  @RouteHandler()
  async stop(req: Request, _: Response, __: NextFunction): Promise<any> {
    const profileId = req.query.profileId as string;
    return this.services.admin.streamPlaylist.stop(req.params.id, profileId);
  }

  @RouteHandler()
  async pause(req: Request, _: Response, __: NextFunction): Promise<any> {
    const profileId = req.query.profileId as string;
    return this.services.admin.streamPlaylist.pause(req.params.id, profileId);
  }

  @RouteHandler()
  async resume(req: Request, _: Response, __: NextFunction): Promise<any> {
    const profileId = req.query.profileId as string;
    return this.services.admin.streamPlaylist.resume(req.params.id, profileId);
  }

  @RouteHandler()
  async advance(req: Request, _: Response, __: NextFunction): Promise<any> {
    const profileId = req.query.profileId as string;
    return this.services.admin.streamPlaylist.advance(req.params.id, profileId);
  }
}
