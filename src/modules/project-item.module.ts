import { ProjectItem } from "@wallio/entities";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProjectModule } from "./project.module";
import { ProjectItemService } from "@wallio/services";
import { ProjectItemController } from "@wallio/rest/controller";
import { ProjectItemMapper } from "@wallio/rest/mapper";

@Module({
  imports: [TypeOrmModule.forFeature([ProjectItem]), ProjectModule],
  controllers: [ProjectItemController],
  providers: [ProjectItemService, ProjectItemMapper],
  exports: [ProjectItemService, ProjectItemMapper],
})
export class ProjectItemModule {}
