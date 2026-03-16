import { User } from "@wallio/entities";
import { UserController } from "@wallio/rest/controller/user";
import { UserMapper } from "@wallio/rest/mapper/user";
import { UserOrchestrator } from "@wallio/rest/orchestrator/user";
import { UserService } from "@wallio/services/user";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, UserMapper, UserOrchestrator],
  exports: [UserService, UserMapper, UserOrchestrator],
})
export class UserModule {}
