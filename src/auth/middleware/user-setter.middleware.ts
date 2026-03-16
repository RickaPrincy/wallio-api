import { UserService } from "@wallio/services/user";
import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class UserSetterMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    if (!req.firebaseUser) {
      next();
      return;
    }

    const user = await this.userService.findByFirebaseId(req.firebaseUser?.uid);
    if (!user) {
      next();
      return;
    }

    req.user = user;
    next();
  }
}
