import { User } from "@wallio/entities";
import { UserController } from "@wallio/rest/controller";
import { UserMapper } from "@wallio/rest/mapper";
import { UserService } from "@wallio/services";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FirebaseModule } from "./firebase.module";

@Module({
  imports: [TypeOrmModule.forFeature([User]), FirebaseModule],
  controllers: [UserController],
  providers: [UserService, UserMapper],
  exports: [UserService, UserMapper],
})
export class UserModule {}
