import { Body, Controller, Get, Param, Put } from "@nestjs/common";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { ApiPagination, ApiRequiredSpec } from "@wallio/rest/swagger/decorator";
import {
  RecurringTransactionService,
  WalletService,
  LabelService,
} from "@wallio/services";
import { RecurringTransaction as RestRecurringTransaction } from "@wallio/rest/model";
import { RecurringTransactionMapper } from "@wallio/rest/mapper";
import { Authenticated } from "@wallio/auth/decorator";
import { AuthenticatedUser } from "@wallio/auth/decorator/retriever";
import { User } from "@wallio/entities";
import { Pagination, PaginationParams } from "../decorator";

@Controller()
@ApiTags("RecurringTransactions")
export class RecurringTransactionController {
  constructor(
    private readonly walletService: WalletService,
    private readonly labelService: LabelService,
    private readonly recurringTransactionService: RecurringTransactionService,
    private readonly recurringTransactionMapper: RecurringTransactionMapper
  ) {}

  @Put("/users/:userId/recurring-transactions")
  @ApiBody({ type: [RestRecurringTransaction] })
  @Authenticated({ selfMatcher: "userId" })
  @ApiRequiredSpec({
    operationId: "saveAllRecurringTransactions",
    type: [RestRecurringTransaction],
  })
  async createRecurringTransaction(
    @Param("userId") _userId: string,
    @AuthenticatedUser() user: User,
    @Body() recurringTransactions: RestRecurringTransaction[]
  ): Promise<RestRecurringTransaction[]> {
    const walletIds = recurringTransactions.map(
      (recurringTransaction) => recurringTransaction.walletId
    );
    const wallets = await this.walletService.findByIds(user.id, walletIds);

    const labelIds = recurringTransactions
      .map((recurringTransaction) => recurringTransaction.labelId)
      .filter((labelId): labelId is string => !!labelId);
    const labels = await this.labelService.findByIds(user.id, labelIds);

    const domainRecurringTransactions =
      await this.recurringTransactionMapper.toDomainList(
        recurringTransactions,
        wallets,
        labels
      );
    const createdRecurringTransactions =
      await this.recurringTransactionService.saveAll(
        user.id,
        domainRecurringTransactions
      );

    return this.recurringTransactionMapper.toRestList(
      createdRecurringTransactions
    );
  }

  @Get("/users/:userId/recurring-transactions")
  @Authenticated({ selfMatcher: "userId" })
  @ApiPagination()
  @ApiRequiredSpec({
    operationId: "getRecurringTransactionsByUserId",
    type: [RestRecurringTransaction],
  })
  async getRecurringTransactionsByUserId(
    @Param("userId") userId: string,
    @Pagination() pagination: PaginationParams
  ): Promise<RestRecurringTransaction[]> {
    const domainRecurringTransactions =
      await this.recurringTransactionService.findAll(pagination, {
        wallet: {
          user: {
            id: userId,
          },
        },
      });

    return this.recurringTransactionMapper.toRestList(
      domainRecurringTransactions
    );
  }
}
