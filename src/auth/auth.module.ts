import { Global, Module } from "@nestjs/common";

import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { FirebaseGuard, SelfMatcherGuard } from "./guards";
import { FirebaseModule, UserModule } from "@wallio/modules";
import {
  BearerTokenSetterMiddleware,
  FirebaseUserSetterMiddleware,
  UserSetterMiddleware,
} from "./middleware";

@Global()
@Module({
  imports: [UserModule, FirebaseModule],
  providers: [
    BearerTokenSetterMiddleware,
    FirebaseUserSetterMiddleware,
    UserSetterMiddleware,
    FirebaseGuard,
    AuthService,
    SelfMatcherGuard,
  ],
  controllers: [AuthController],
  exports: [
    BearerTokenSetterMiddleware,
    FirebaseUserSetterMiddleware,
    UserSetterMiddleware,
    FirebaseGuard,
    AuthService,
    SelfMatcherGuard,
  ],
})
export class AuthModule {}
