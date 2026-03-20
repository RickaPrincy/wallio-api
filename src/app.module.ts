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
import { WalletModule } from "./modules/wallet.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    FirebaseModule,
    HealthModule,
    UserModule,
    WalletModule,
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
