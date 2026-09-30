import { Repository } from "typeorm";
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Wallet as DomainWallet, User } from "@wallio/entities";
import { Wallet as RestWallet } from "@wallio/rest/model/wallet";

@Injectable()
export class WalletMapper {
  constructor(
    @InjectRepository(DomainWallet)
    private readonly walletRepository: Repository<DomainWallet>
  ) {}

  async toRestList(wallets: DomainWallet[]): Promise<RestWallet[]> {
    return Promise.all(wallets.map((wallet) => this.toRest(wallet)));
  }

  async toRest(wallet: DomainWallet): Promise<RestWallet> {
    const { user: _user, ...restWallet } = wallet;
    return restWallet;
  }

  async toDomainList(
    wallets: RestWallet[],
    user: User
  ): Promise<DomainWallet[]> {
    return Promise.all(wallets.map((wallet) => this.toDomain(wallet, user)));
  }

  async toDomain(restWallet: RestWallet, user: User): Promise<DomainWallet> {
    // Array bodies skip the ValidationPipe, so the class-validator rule on
    // currency never runs: check it here instead of letting the DB throw.
    if (restWallet.currency && !/^[A-Z]{3}$/.test(restWallet.currency)) {
      throw new BadRequestException(
        `Invalid currency "${restWallet.currency}", expected an ISO 4217 code`
      );
    }
    return this.walletRepository.create({ ...restWallet, user });
  }
}
