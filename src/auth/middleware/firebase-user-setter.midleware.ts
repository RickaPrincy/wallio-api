import { FirebaseAuthService } from "@wallio/services/firebase";
import { ForbiddenException, Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class FirebaseUserSetterMiddleware implements NestMiddleware {
  constructor(private readonly firebaseAuthService: FirebaseAuthService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const token = req.token;

    if (!token) {
      next();
      return;
    }

    try {
      const { email } = await this.firebaseAuthService.verifyTokenId(token);
      const firebaseUser = await this.firebaseAuthService.findUserByEmail(
        email!
      );
      req.firebaseUser = firebaseUser;
      next();
    } catch {
      throw new ForbiddenException();
    }
  }
}
