import { Body, Controller, Get, Param, Put } from "@nestjs/common";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { ApiPagination, ApiRequiredSpec } from "@wallio/rest/swagger/decorator";
import { WalletService } from "@wallio/services";
import { Wallet as RestWallet } from "@wallio/rest/model";
import { WalletMapper } from "@wallio/rest/mapper";
import { Authenticated } from "@wallio/auth/decorator";
import { AuthenticatedUser } from "@wallio/auth/decorator/retriever";
import { User } from "@wallio/entities";
import { Pagination, PaginationParams } from "../decorator";

@Controller()
@ApiTags("Wallets")
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly walletMapper: WalletMapper
  ) {}

  @Put("/users/:userId/wallets")
  @ApiBody({ type: [RestWallet] })
  @Authenticated({ selfMatcher: "userId" })
  @ApiRequiredSpec({ operationId: "saveAll", type: [RestWallet] })
  async createWallet(
    @Param("userId") _userId: string,
    @AuthenticatedUser() user: User,
    @Body() wallets: RestWallet[]
  ): Promise<RestWallet[]> {
    const domainWallets = await this.walletMapper.toDomainList(wallets, user);

    const createdWallets = await this.walletService.saveAll(domainWallets);

    return this.walletMapper.toRestList(createdWallets);
  }

  @Get("/users/:userId/wallets")
  @Authenticated({ selfMatcher: "userId" })
  @ApiPagination()
  @ApiRequiredSpec({ operationId: "getWalletsByUserId", type: [RestWallet] })
  async getWalletsByUserId(
    @Param("userId") userId: string,
    @Pagination() pagination: PaginationParams
  ): Promise<RestWallet[]> {
    const domainWallets = await this.walletService.findAll(pagination, {
      user: {
        id: userId,
      },
    });

    return this.walletMapper.toRestList(domainWallets);
  }
}
