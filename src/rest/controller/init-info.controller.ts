import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ApiPagination, ApiRequiredSpec } from "@wallio/rest/swagger/decorator";
import { InitInfoService } from "@wallio/services";
import { Authenticated } from "@wallio/auth/decorator";
import { InitInfo } from "../model";
import { InitInfoMapper } from "../mapper";
import { Pagination, PaginationParams } from "../decorator";

@Controller()
@ApiTags("Init")
export class InitInfosController {
  constructor(
    private readonly initInfoService: InitInfoService,
    private readonly initInfoMapper: InitInfoMapper
  ) {}

  @Get("/users/:id/init")
  @Authenticated({ selfMatcher: "id" })
  @ApiPagination()
  @ApiRequiredSpec({ operationId: "getUserInitInfos", type: InitInfo })
  async getUserInitInfos(
    @Param("id") userId: string,
    @Pagination() pagination: PaginationParams
  ): Promise<InitInfo> {
    const info = await this.initInfoService.getByUserId(userId, pagination);
    return this.initInfoMapper.toRest(info);
  }
}
