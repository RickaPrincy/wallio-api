import { User } from "@wallio/entities";
import { UserController } from "@wallio/rest/controller";
import { UserMapper } from "@wallio/rest/mapper";
import { UserService } from "@wallio/services";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, UserMapper],
  exports: [UserService, UserMapper],
})
export class UserModule {}
