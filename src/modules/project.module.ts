import { Project } from "@wallio/entities";
import { ProjectMapper } from "@wallio/rest/mapper";
import { ProjectService } from "@wallio/services";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProjectController } from "@wallio/rest/controller";

@Module({
  imports: [TypeOrmModule.forFeature([Project])],
  controllers: [ProjectController],
  providers: [ProjectService, ProjectMapper],
  exports: [ProjectService, ProjectMapper],
})
export class ProjectModule {}
