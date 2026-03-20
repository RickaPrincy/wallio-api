import { Dummy } from "@wallio/entities";
import { HealthController } from "@wallio/rest/controller";
import { HealthService } from "@wallio/services";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([Dummy])],
  providers: [HealthService],
  controllers: [HealthController],
})
export class HealthModule {}
