import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AuthModule } from "./auth";
import { DatabaseModule } from "./modules/database";
import { FirebaseModule, HealthModule, UserModule } from "./modules";
import {
  BearerTokenSetterMiddleware,
  FirebaseUserSetterMiddleware,
  UserSetterMiddleware,
} from "./auth/middleware";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    FirebaseModule,
    HealthModule,
    UserModule,
    AuthModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        BearerTokenSetterMiddleware,
        FirebaseUserSetterMiddleware,
        UserSetterMiddleware
      )
      .exclude({ path: "ping", method: RequestMethod.ALL })
      .forRoutes("*");
  }
}
