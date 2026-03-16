import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { AuthService } from "./auth.service";
import { User } from "@wallio/entities";
import { Whoami } from "./model";
import { ApiRequiredSpec } from "@wallio/rest/swagger/decorator";
import { Authenticated } from "./decorator";
import {
  AuthenticatedFirebaseUser,
  AuthenticatedUser,
  AuthenticatedUserToken,
} from "./decorator/retriever";
import { FirebaseUser } from "@wallio/services/firebase";

@Controller()
@ApiTags("Security")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("/whoami")
  @Authenticated()
  @ApiRequiredSpec({
    type: Whoami,
    operationId: "whoami",
    operationOptions: {
      description: "Tell who you are",
    },
  })
  async whoami(
    @AuthenticatedUser() user: User,
    @AuthenticatedFirebaseUser() firebaseUser: FirebaseUser,
    @AuthenticatedUserToken() token: string
  ) {
    return this.authService.whoami(token, firebaseUser, user);
  }
}
