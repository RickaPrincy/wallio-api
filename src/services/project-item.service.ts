import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { PaginationParams } from "@wallio/rest/decorator";
import { Criteria } from "@wallio/services/common/criteria";
import { ProjectItem } from "@wallio/entities";
import { findByCriteria } from "@wallio/services/common/find-by-criteria";
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
    });
  }

  async saveAll(items: ProjectItem[]): Promise<ProjectItem[]> {
    return await this.dataSource.transaction(async (manager) => {
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
