import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Wallet as DomainWallet, User } from "@wallio/entities";
import { Wallet as RestWallet } from "@wallio/rest/model/wallet";

@Injectable()
export class WalletMapper {
  constructor(
    @InjectRepository(DomainWallet)
    private readonly walletRepository: Repository<DomainWallet>
  ) {}

  async toRest(wallet: DomainWallet): Promise<RestWallet> {
    if (!wallet) {
      return null;
    }

    const { user: _user, ...restWallet } = wallet;
    return restWallet;
  }

  async createToDomain(
    createWallet: RestWallet,
    user: User
  ): Promise<DomainWallet> {
    return this.walletRepository.create({ ...createWallet, user });
  }
}
