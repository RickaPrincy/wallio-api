import { Body, Controller, Get, Param, Put } from "@nestjs/common";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { ApiPagination, ApiRequiredSpec } from "@wallio/rest/swagger/decorator";
import { ProjectService } from "@wallio/services";
import { Project as RestProject } from "@wallio/rest/model";
import { ProjectMapper } from "@wallio/rest/mapper";
import { Authenticated } from "@wallio/auth/decorator";
import { AuthenticatedUser } from "@wallio/auth/decorator/retriever";
import { User } from "@wallio/entities";
import { Pagination, PaginationParams } from "../decorator";

@Controller()
@ApiTags("Projects")
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly projectMapper: ProjectMapper
  ) {}

  @Put("/users/:userId/projects")
  @ApiBody({ type: [RestProject] })
  @Authenticated({ selfMatcher: "userId" })
  @ApiRequiredSpec({ operationId: "saveAllProjects", type: [RestProject] })
  async createProject(
    @Param("userId") _userId: string,
    @AuthenticatedUser() user: User,
    @Body() projects: RestProject[]
  ): Promise<RestProject[]> {
    const domainProjects = await this.projectMapper.toDomainList(projects, user);

    const createdProjects = await this.projectService.saveAll(domainProjects);

    return this.projectMapper.toRestList(createdProjects);
  }

  @Get("/users/:userId/projects")
  @Authenticated({ selfMatcher: "userId" })
  @ApiPagination()
  @ApiRequiredSpec({ operationId: "getProjectsByUserId", type: [RestProject] })
  async getProjectsByUserId(
    @Param("userId") userId: string,
    @Pagination() pagination: PaginationParams
  ): Promise<RestProject[]> {
    const domainProjects = await this.projectService.findAll(pagination, {
      user: {
        id: userId,
      },
    });

    return this.projectMapper.toRestList(domainProjects);
  }
}
