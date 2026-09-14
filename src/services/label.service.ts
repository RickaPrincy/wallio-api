import { DataSource, In, Repository } from "typeorm";
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Label } from "@wallio/entities";
import { Criteria } from "@wallio/services/common/criteria";
import { PaginationParams } from "@wallio/rest/decorator";
import { UPDATED_AT_CREATED_AT_ORDER_BY } from "@wallio/services/common/default-order-by";
import { findByCriteria } from "@wallio/services/common/find-by-criteria";

const MAX_LABELS = 100;

@Injectable()
export class LabelService {
  constructor(
    @InjectRepository(Label)
    private readonly repository: Repository<Label>,
    private readonly dataSource: DataSource
  ) {}

  async findAll(pagination: PaginationParams, criteria: Criteria<Label>) {
    return await findByCriteria<Label>({
      repository: this.repository,
      criteria,
      pagination,
      order: UPDATED_AT_CREATED_AT_ORDER_BY,
      withDeleted: true,
    });
  }

  async saveAll(labels: Label[]): Promise<Label[]> {
    return await this.dataSource.transaction(async (manager) => {
      return await manager.save(Label, labels);
    });
  }

  async count(criteria?: Criteria<Label>): Promise<number> {
    return await this.repository.count({
      where: criteria as any,
      withDeleted: true,
    });
  }

  async findByIds(userId: string, labelIds: string[]) {
    const uniqueLabelIds = Array.from(new Set(labelIds));

    if (uniqueLabelIds.length === 0) {
      return [];
    }

    if (uniqueLabelIds.length > MAX_LABELS) {
      throw new BadRequestException("Too many labels requested");
    }

    const labels = await this.findAll(
      { page: 1, pageSize: uniqueLabelIds.length },
      {
        id: In(uniqueLabelIds),
        user: {
          id: userId,
        },
      }
    );

    if (labels.length !== uniqueLabelIds.length) {
      throw new BadRequestException(
        "One or more labels are invalid or do not belong to you"
      );
    }

    return labels;
  }
}
