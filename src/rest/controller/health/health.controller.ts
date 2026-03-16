import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { Dummy as DomainEntity } from "@wallio/entities";
import { ApiPagination, ApiRequiredSpec } from "@wallio/rest/swagger/decorator";
import { Pagination, PaginationParams } from "@wallio/rest/decorator";
import { HealthService } from "@wallio/services/health";

@Controller()
@ApiTags("Health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get("/ping")
  @ApiOperation({
    operationId: "ping",
  })
  @ApiOkResponse({
    content: {
      "text/plain": {
        schema: {
          type: "string",
        },
      },
    },
  })
  async ping() {
    return "pong";
  }

  @Get("/dummies")
  @ApiPagination()
  @ApiRequiredSpec({ operationId: "getDummies", type: [DomainEntity] })
  async getDummies(
    @Pagination() pagination: PaginationParams
  ): Promise<DomainEntity[]> {
    return this.healthService.getDummies(pagination);
  }
}
