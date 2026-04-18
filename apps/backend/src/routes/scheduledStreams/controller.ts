import { BaseController } from "@src/routes/baseController";
import { Body, RouteHandler, ValidateSchema } from "@src/decorators";
import { NextFunction, Request, Response } from "express";
import {
  CreateScheduledStreamInput,
  GetPresignedUrlInput,
  createScheduledStreamSchema,
  getPresignedUrlSchema,
} from "./schema";

export class ScheduledStreamsController extends BaseController {
  @RouteHandler()
  @ValidateSchema(getPresignedUrlSchema)
  async getPresignedUrl(
    req: Request,
    _: Response,
    __: NextFunction,
    @Body body?: GetPresignedUrlInput,
  ): Promise<any> {
    return this.services.admin.scheduledStreams.getPresignedUploadUrl(body!.profileId, body!.filename);
  }

  @RouteHandler({ statusCode: 201 })
  @ValidateSchema(createScheduledStreamSchema)
  async create(
    req: Request,
    _: Response,
    __: NextFunction,
    @Body body?: CreateScheduledStreamInput,
  ): Promise<any> {
    return this.services.admin.scheduledStreams.createWithUrl({
      profileId: body!.profileId,
      title: body!.title,
      videoFilename: body!.videoFilename,
      videoUrl: body!.videoUrl,
      scheduledAt: body!.scheduledAt,
    });
  }

  @RouteHandler()
  async list(req: Request, _: Response, __: NextFunction): Promise<any> {
    const profileId = req.query.profileId as string;
    return this.services.admin.scheduledStreams.list(profileId);
  }

  @RouteHandler({ statusCode: 204 })
  async remove(req: Request, _: Response, __: NextFunction): Promise<any> {
    const { id } = req.params;
    const profileId = req.query.profileId as string;
    await this.services.admin.scheduledStreams.delete(id, profileId);
    return null;
  }
}
