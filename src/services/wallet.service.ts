import { Repository } from "typeorm";
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Wallet } from "@wallio/entities";
import { Criteria } from "@wallio/services/common/criteria";
import { PaginationParams } from "@wallio/rest/decorator";
import { UPDATED_AT_CREATED_AT_ORDER_BY } from "@wallio/services/common/default-order-by";
import { findByCriteria } from "@wallio/services/common/find-by-criteria";

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet) private readonly repository: Repository<Wallet>
  ) {}

  async findAll(pagination: PaginationParams, criteria: Criteria<Wallet>) {
    return await findByCriteria<Wallet>({
      repository: this.repository,
      criteria,
      pagination,
      order: UPDATED_AT_CREATED_AT_ORDER_BY,
    });
  }

  async findById(id: string, userId: string) {
    return this.repository.findOneBy({ id, user: { id: userId } });
  }

  async createWallet(wallet: Wallet): Promise<Wallet> {
    const existing = await this.findAll({ page: 1, pageSize: 1 }, [
      { id: wallet.id },
    ]);

    if (existing && existing.length > 0) {
      throw new BadRequestException(`Wallet.ID already exists`);
    }

    const walletToCreate = this.repository.create(wallet);
    return this.repository.save(walletToCreate);
  }
}
