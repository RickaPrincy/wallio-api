import { DataSource, Repository } from "typeorm";
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { User } from "@wallio/entities";
import { Criteria } from "@wallio/services/common/criteria";
import { PaginationParams } from "@wallio/rest/decorator";
import { UPDATED_AT_CREATED_AT_ORDER_BY } from "@wallio/services/common/default-order-by";
import { findByCriteria } from "@wallio/services/common/find-by-criteria";
import { FirebaseAuthService } from "@wallio/services/firebase";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly firebaseAuthService: FirebaseAuthService
  ) {}

  async findAll(pagination: PaginationParams, criteria?: Criteria<User>) {
    return await findByCriteria<User>({
      repository: this.repository,
      criteria,
      pagination,
      order: UPDATED_AT_CREATED_AT_ORDER_BY,
    });
  }

  async findById(id: string) {
    return this.repository.findOneBy({ id });
  }

  async findByFirebaseId(firebaseId: string) {
    return this.repository.findOneBy({ firebaseId });
  }

  async createUser(user: User): Promise<User> {
    const existing = await this.findAll({ page: 1, pageSize: 1 }, [
      { id: user.id },
      { email: user.email },
      { firebaseId: user.firebaseId },
    ]);

    if (existing && existing.length > 0) {
      throw new BadRequestException(
        `User with username or email already exists`
      );
    }

    const userToCreate = this.repository.create(user);
    return this.repository.save(userToCreate);
  }

  // Hard delete: wallets, labels and projects cascade from the user, then
  // transactions and project items cascade from them. The Firebase account goes
  // last, inside the transaction, so a Firebase failure keeps the data intact
  // and the user can simply retry.
  async deleteUser(user: User): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(User, { id: user.id });
      await this.firebaseAuthService.deleteUser(user.firebaseId);
    });
  }
}
