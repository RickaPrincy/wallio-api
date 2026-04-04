import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from "@nestjs/common";

import { ApiBody, ApiTags } from "@nestjs/swagger";
import { ApiPagination, ApiRequiredSpec } from "@wallio/rest/swagger/decorator";
import { BalanceHistoryService, WalletService } from "@wallio/services";
import {
  CreateBalanceHistory,
  BalanceHistory as RestBalanceHistory,
} from "@wallio/rest/model/balance";
import { BalanceHistoryMapper } from "@wallio/rest/mapper";
import { Authenticated } from "@wallio/auth/decorator";
import { AuthenticatedUser } from "@wallio/auth/decorator/retriever";
import { User } from "@wallio/entities";
import { Pagination, PaginationParams } from "../decorator";

@Controller()
@ApiTags("Wallets")
export class BalanceHistoryController {
  constructor(
    private readonly walletService: WalletService,
    private readonly balanceHistoryService: BalanceHistoryService,
    private readonly balanceHistoryMapper: BalanceHistoryMapper
  ) {}

  @Post("/users/:userId/wallets/:walletId/balances")
  @Authenticated({ selfMatcher: "userId" })
  @ApiRequiredSpec({
    operationId: "createBalances",
    type: [RestBalanceHistory],
  })
  @ApiBody({ type: [CreateBalanceHistory], required: true })
  async createBalanceHistory(
    @Param("userId") _userId: string,
    @Param("walletId") walletId: string,
    @AuthenticatedUser() user: User,
    @Body() balances: CreateBalanceHistory[]
  ): Promise<RestBalanceHistory[]> {
    const wallet = await this.walletService.findById(walletId, user.id);
    if (!wallet) {
      throw new NotFoundException(
        `Wallet with id ${walletId} not found for user ${user.id}`
      );
    }

    const domainBalances = await this.balanceHistoryMapper.createToDomains(
      balances,
      wallet
    );

    const createdBalances =
      await this.balanceHistoryService.saveAll(domainBalances);
    return this.balanceHistoryMapper.toRestList(createdBalances);
  }

  @Get("/users/:userId/wallets/:walletId/balances")
  @Authenticated({ selfMatcher: "userId" })
  @ApiPagination()
  @ApiRequiredSpec({
    operationId: "getBalancesByWalletId",
    type: [RestBalanceHistory],
  })
  async getBalanceHistorysByUserId(
    @Param("walletId") walletId: string,
    @AuthenticatedUser() user: User,
    @Pagination() pagination: PaginationParams
  ): Promise<RestBalanceHistory[]> {
    const balances = await this.balanceHistoryService.findAll(pagination, {
      wallet: {
        user: {
          id: user.id,
        },
        id: walletId,
      },
    });
    return this.balanceHistoryMapper.toRestList(balances);
  }
}
