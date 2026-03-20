import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ApiPagination, ApiRequiredSpec } from "@wallio/rest/swagger/decorator";
import { WalletService } from "@wallio/services";
import { Wallet as RestWallet } from "@wallio/rest/model/wallet";
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

  @Get("/users/:userId/wallets/:id")
  @Authenticated({ selfMatcher: "userId" })
  @ApiRequiredSpec({ operationId: "getWalletById", type: RestWallet })
  async getWalletById(
    @Param("userId") userId: string,
    @Param("id") walletId: string
  ): Promise<RestWallet> {
    const domainWallet = await this.walletService.findById(walletId, userId);
    if (!domainWallet) {
      throw new NotFoundException(`The wallet ${walletId} does not exist.`);
    }
    return this.walletMapper.toRest(domainWallet);
  }

  @Post("/users/:userId/wallets")
  @Authenticated({ selfMatcher: "userId" })
  @ApiRequiredSpec({ operationId: "createWallet", type: RestWallet })
  async createWallet(
    @AuthenticatedUser() user: User,
    @Body() createWallet: RestWallet
  ): Promise<RestWallet> {
    const domainWallet = await this.walletMapper.createToDomain(
      createWallet,
      user
    );
    const createdWallet = await this.walletService.createWallet(domainWallet);

    return this.walletMapper.toRest(createdWallet);
  }

  @Get("/users/:userId/wallets")
  @Authenticated({ selfMatcher: "userId" })
  @ApiPagination()
  @ApiRequiredSpec({ operationId: "getWalletsByUserId", type: RestWallet })
  async getWalletsByUserId(
    @Param("userId") userId: string,
    @Pagination() pagination: PaginationParams
  ): Promise<RestWallet[]> {
    const domainWallets = await this.walletService.findAll(pagination, {
      user: {
        id: userId,
      },
    });
    return Promise.all(
      domainWallets.map(
        async (domainWallet) => await this.walletMapper.toRest(domainWallet)
      )
    );
  }
}
