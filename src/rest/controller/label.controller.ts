import { Body, Controller, Get, Param, Put } from "@nestjs/common";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { ApiPagination, ApiRequiredSpec } from "@wallio/rest/swagger/decorator";
import { LabelService } from "@wallio/services";
import { Label as RestLabel } from "@wallio/rest/model";
import { LabelMapper } from "@wallio/rest/mapper";
import { Authenticated } from "@wallio/auth/decorator";
import { AuthenticatedUser } from "@wallio/auth/decorator/retriever";
import { User } from "@wallio/entities";
import { Pagination, PaginationParams } from "../decorator";

@Controller()
@ApiTags("Labels")
export class LabelController {
  constructor(
    private readonly labelService: LabelService,
    private readonly labelMapper: LabelMapper
  ) {}

  @Put("/users/:userId/labels")
  @ApiBody({ type: [RestLabel] })
  @Authenticated({ selfMatcher: "userId" })
  @ApiRequiredSpec({ operationId: "saveAllLabels", type: [RestLabel] })
  async createLabel(
    @Param("userId") _userId: string,
    @AuthenticatedUser() user: User,
    @Body() labels: RestLabel[]
  ): Promise<RestLabel[]> {
    const domainLabels = await this.labelMapper.toDomainList(labels, user);

    const createdLabels = await this.labelService.saveAll(domainLabels);

    return this.labelMapper.toRestList(createdLabels);
  }

  @Get("/users/:userId/labels")
  @Authenticated({ selfMatcher: "userId" })
  @ApiPagination()
  @ApiRequiredSpec({ operationId: "getLabelsByUserId", type: [RestLabel] })
  async getLabelsByUserId(
    @Param("userId") userId: string,
    @Pagination() pagination: PaginationParams
  ): Promise<RestLabel[]> {
    const domainLabels = await this.labelService.findAll(pagination, {
      user: {
        id: userId,
      },
    });

    return this.labelMapper.toRestList(domainLabels);
  }
}
