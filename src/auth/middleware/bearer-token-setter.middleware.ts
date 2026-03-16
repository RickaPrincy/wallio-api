import { ForbiddenException, Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class BearerTokenSetterMiddleware implements NestMiddleware {
  private static readonly BEARER_TOKEN_TYPE = "Bearer";

  async use(request: Request, _res: Response, next: NextFunction) {
    try {
      const bearerToken = await this.extractBearerToken(request);
      request.user = null;
      request.firebaseUser = null;
      request.token = bearerToken;
      next();
    } catch {
      throw new ForbiddenException();
    }
  }

  async extractBearerToken(req: Request): Promise<string> {
    const authHeader = req.headers["authorization"] ?? "";
    const [tokenType, tokenValue] = authHeader.split(" ");

    if (BearerTokenSetterMiddleware.BEARER_TOKEN_TYPE !== tokenType) {
      return "";
    }

    return tokenValue;
  }
}
