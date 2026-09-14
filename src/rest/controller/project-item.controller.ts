import { Body, Controller, Get, Param, Put } from "@nestjs/common";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { ApiPagination, ApiRequiredSpec } from "@wallio/rest/swagger/decorator";
import { ProjectItemService, ProjectService } from "@wallio/services";
import { ProjectItem as RestProjectItem } from "@wallio/rest/model";
import { ProjectItemMapper } from "@wallio/rest/mapper";
import { Authenticated } from "@wallio/auth/decorator";
import { AuthenticatedUser } from "@wallio/auth/decorator/retriever";
import { User } from "@wallio/entities";
import { Pagination, PaginationParams } from "../decorator";

@Controller()
@ApiTags("ProjectItems")
export class ProjectItemController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly projectItemService: ProjectItemService,
    private readonly projectItemMapper: ProjectItemMapper
  ) {}

  @Put("/users/:userId/project-items")
  @ApiBody({ type: [RestProjectItem] })
  @Authenticated({ selfMatcher: "userId" })
  @ApiRequiredSpec({
    operationId: "saveAllProjectItems",
    type: [RestProjectItem],
  })
  async createProjectItem(
    @Param("userId") _userId: string,
    @AuthenticatedUser() user: User,
    @Body() items: RestProjectItem[]
  ): Promise<RestProjectItem[]> {
    const projectIds = items.map((item) => item.projectId);
    const projects = await this.projectService.findByIds(user.id, projectIds);

    const domainItems = await this.projectItemMapper.toDomainList(
      items,
      projects
    );
    const createdItems = await this.projectItemService.saveAll(domainItems);

    return this.projectItemMapper.toRestList(createdItems);
  }

  @Get("/users/:userId/project-items")
  @Authenticated({ selfMatcher: "userId" })
  @ApiPagination()
  @ApiRequiredSpec({
    operationId: "getProjectItemsByUserId",
    type: [RestProjectItem],
  })
  async getProjectItemsByUserId(
    @Param("userId") userId: string,
    @Pagination() pagination: PaginationParams
  ): Promise<RestProjectItem[]> {
    const domainItems = await this.projectItemService.findAll(pagination, {
      project: {
        user: {
          id: userId,
        },
      },
    });

    return this.projectItemMapper.toRestList(domainItems);
  }
}
