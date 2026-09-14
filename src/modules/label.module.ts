import { Label } from "@wallio/entities";
import { LabelMapper } from "@wallio/rest/mapper";
import { LabelService } from "@wallio/services";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LabelController } from "@wallio/rest/controller";

@Module({
  imports: [TypeOrmModule.forFeature([Label])],
  controllers: [LabelController],
  providers: [LabelService, LabelMapper],
  exports: [LabelService, LabelMapper],
})
export class LabelModule {}
