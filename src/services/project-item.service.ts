import { DataSource, Not, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { PaginationParams } from "@wallio/rest/decorator";
import { Criteria } from "@wallio/services/common/criteria";
import { ProjectItem, Transaction } from "@wallio/entities";
import { findByCriteria } from "@wallio/services/common/find-by-criteria";
import { assertNotOwnedByOthers } from "@wallio/services/common/assert-not-owned-by-others";
import { UPDATED_AT_CREATED_AT_ORDER_BY } from "./common/default-order-by";

@Injectable()
export class ProjectItemService {
  constructor(
    @InjectRepository(ProjectItem)
    private readonly repository: Repository<ProjectItem>,
    private readonly dataSource: DataSource
  ) {}

  async findAll(pagination: PaginationParams, criteria: Criteria<ProjectItem>) {
    return await findByCriteria<ProjectItem>({
      repository: this.repository,
      criteria,
      pagination,
      order: UPDATED_AT_CREATED_AT_ORDER_BY,
      withDeleted: true,
      // project is not eager, but the mapper needs it for projectId.
      relations: { project: true },
    });
  }

  async saveAll(userId: string, items: ProjectItem[]): Promise<ProjectItem[]> {
    return await this.dataSource.transaction(async (manager) => {
      await assertNotOwnedByOthers({
        manager,
        entity: ProjectItem,
        ids: items.map((item) => item.id),
        ownedByOthers: { project: { user: { id: Not(userId) } } },
        name: "project items",
      });

      await assertNotOwnedByOthers({
        manager,
        entity: Transaction,
        ids: items.map((item) => item.transaction?.id),
        ownedByOthers: { wallet: { user: { id: Not(userId) } } },
        name: "transactions",
      });

      return await manager.save(ProjectItem, items);
    });
  }

  async count(criteria?: Criteria<ProjectItem>): Promise<number> {
    return await this.repository.count({
      where: criteria as any,
      withDeleted: true,
    });
  }
}
