import { NextFunction, Request, Response } from "express";
import { BaseController } from "../baseController";
import { CreateSessionInput, createSessionSchema, CreateOauthSessionInput, createOauthSessionSchema } from "./schema";
import { RouteHandler, ValidateSchema, Body } from "@src/decorators";
import { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, TWITCH_REDIRECT_URI } from "@src/configuration/secrets";
import { firebaseAuth } from "@src/utils/firebase";

export class SessionsController extends BaseController {
  @RouteHandler({ statusCode: 201 })
  @ValidateSchema(createSessionSchema)
  public async createSession(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: CreateSessionInput,
  ): Promise<any> {
    const { account, token } = await this.services.account.login(body!, req.useragent);
    return { account, token };
  }

  @RouteHandler({ statusCode: 201 })
  @ValidateSchema(createOauthSessionSchema)
  public async createOauthSession(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: CreateOauthSessionInput,
  ): Promise<any> {
    const { account, token } = await this.services.account.oauthLogin(body!, req.useragent);
    return { account, token };
  }

  @RouteHandler({ statusCode: 200 })
  public async twitchCallback(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { code, redirectUri } = req.body;
    if (!code) {
      throw new Error("Missing code");
    }

    // Exchange code for Twitch token
    const tokenResponse = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        code: code as string,
        grant_type: "authorization_code",
        redirect_uri: redirectUri || TWITCH_REDIRECT_URI,
      }),
    });
    const tokenData: any = await tokenResponse.json();

    if (!tokenData.access_token) {
      throw new Error("Failed to authenticate with Twitch");
    }

    // Fetch Twitch user
    const userResponse = await fetch("https://api.twitch.tv/helix/users", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Client-Id": TWITCH_CLIENT_ID,
      },
    });
    const userData: any = await userResponse.json();
    const twitchUser = userData.data[0];

    if (!twitchUser || !twitchUser.email) {
      throw new Error("Failed to get Twitch email. Please ensure your Twitch account has an email.");
    }

    const email = twitchUser.email;
    const name = twitchUser.display_name;
    const uid = `twitch:${twitchUser.id}`;

    // Create or update user in Firebase Auth
    try {
      await firebaseAuth.getUserByEmail(email);
    } catch {
      await firebaseAuth.createUser({
        uid,
        email,
        displayName: name,
      });
    }

    // Generate Custom Token
    const customToken = await firebaseAuth.createCustomToken(uid);

    return { customToken };
  }

  @RouteHandler({ statusCode: 204 })
  public async deleteSession(req: Request, res: Response, next: NextFunction) {
    await this.services.account.logout(req.session!.id);
    return;
  }
}
