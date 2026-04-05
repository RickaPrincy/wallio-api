import { Body, Controller, Get, Param, Put } from "@nestjs/common";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { ApiPagination, ApiRequiredSpec } from "@wallio/rest/swagger/decorator";
import { TransactionService, WalletService } from "@wallio/services";
import { Transaction as RestTransaction } from "@wallio/rest/model";
import { TransactionMapper } from "@wallio/rest/mapper";
import { Authenticated } from "@wallio/auth/decorator";
import { AuthenticatedUser } from "@wallio/auth/decorator/retriever";
import { User } from "@wallio/entities";
import { Pagination, PaginationParams } from "../decorator";

@Controller()
@ApiTags("Transactions")
export class TransactionController {
  constructor(
    private readonly walletService: WalletService,
    private readonly transactionService: TransactionService,
    private readonly transactionMapper: TransactionMapper
  ) {}

  @Put("/users/:userId/transactions")
  @ApiBody({ type: [RestTransaction] })
  @Authenticated({ selfMatcher: "userId" })
  @ApiRequiredSpec({ operationId: "saveAll", type: [RestTransaction] })
  async createTransaction(
    @Param("userId") _userId: string,
    @AuthenticatedUser() user: User,
    @Body() transactions: RestTransaction[]
  ): Promise<RestTransaction[]> {
    const walletIds = transactions.map((transaction) => transaction.walletId);
    const wallets = await this.walletService.findByIds(user.id, walletIds);

    const domainTransactions = await this.transactionMapper.toDomainList(
      transactions,
      wallets
    );
    const createdTransactions =
      await this.transactionService.saveAll(domainTransactions);

    return this.transactionMapper.toRestList(createdTransactions);
  }

  @Get("/users/:userId/transactions")
  @Authenticated({ selfMatcher: "userId" })
  @ApiPagination()
  @ApiRequiredSpec({
    operationId: "getTransactionsByUserId",
    type: [RestTransaction],
  })
  async getTransactionsByUserId(
    @Param("userId") userId: string,
    @Pagination() pagination: PaginationParams
  ): Promise<RestTransaction[]> {
    const domainTransactions = await this.transactionService.findAll(
      pagination,
      {
        wallet: {
          user: {
            id: userId,
          },
        },
      }
    );

    return this.transactionMapper.toRestList(domainTransactions);
  }
}
