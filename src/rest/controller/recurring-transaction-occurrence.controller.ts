import { Body, Controller, Param, Put } from "@nestjs/common";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { ApiRequiredSpec } from "@wallio/rest/swagger/decorator";
import { RecurringTransactionOccurrenceService } from "@wallio/services";
import { RecurringTransactionOccurrence as RestOccurrence } from "@wallio/rest/model";
import { RecurringTransactionOccurrenceMapper } from "@wallio/rest/mapper";
import { Authenticated } from "@wallio/auth/decorator";
import { AuthenticatedUser } from "@wallio/auth/decorator/retriever";
import { User } from "@wallio/entities";

@Controller()
@ApiTags("RecurringTransactions")
export class RecurringTransactionOccurrenceController {
  constructor(
    private readonly occurrenceService: RecurringTransactionOccurrenceService,
    private readonly occurrenceMapper: RecurringTransactionOccurrenceMapper
  ) {}

  @Put("/users/:userId/recurring-transaction-occurrences")
  @ApiBody({ type: [RestOccurrence] })
  @Authenticated({ selfMatcher: "userId" })
  @ApiRequiredSpec({
    operationId: "saveAllRecurringTransactionOccurrences",
    type: [RestOccurrence],
  })
  async saveAll(
    @Param("userId") _userId: string,
    @AuthenticatedUser() user: User,
    @Body() occurrences: RestOccurrence[]
  ): Promise<RestOccurrence[]> {
    const saved = await this.occurrenceService.saveAll(
      user.id,
      this.occurrenceMapper.toDomainList(occurrences)
    );
    return this.occurrenceMapper.toRestList(saved);
  }
}
