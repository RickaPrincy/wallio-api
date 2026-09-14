import { DataSource, In, Repository } from "typeorm";
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Project } from "@wallio/entities";
import { Criteria } from "@wallio/services/common/criteria";
import { PaginationParams } from "@wallio/rest/decorator";
import { UPDATED_AT_CREATED_AT_ORDER_BY } from "@wallio/services/common/default-order-by";
import { findByCriteria } from "@wallio/services/common/find-by-criteria";

const MAX_PROJECTS = 100;

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly repository: Repository<Project>,
    private readonly dataSource: DataSource
  ) {}

  async findAll(pagination: PaginationParams, criteria: Criteria<Project>) {
    return await findByCriteria<Project>({
      repository: this.repository,
      criteria,
      pagination,
      order: UPDATED_AT_CREATED_AT_ORDER_BY,
      withDeleted: true,
    });
  }

  async saveAll(projects: Project[]): Promise<Project[]> {
    return await this.dataSource.transaction(async (manager) => {
      return await manager.save(Project, projects);
    });
  }

  async findByIds(userId: string, projectIds: string[]) {
    const uniqueProjectIds = Array.from(new Set(projectIds));

    if (uniqueProjectIds.length > MAX_PROJECTS) {
      throw new BadRequestException("Too many projects requested");
    }

    const projects = await this.findAll(
      { page: 1, pageSize: uniqueProjectIds.length },
      {
        id: In(uniqueProjectIds),
        user: {
          id: userId,
        },
      }
    );

    if (projects.length !== uniqueProjectIds.length) {
      throw new BadRequestException(
        "One or more projects are invalid or do not belong to you"
      );
    }

    return projects;
  }

  async count(criteria?: Criteria<Project>): Promise<number> {
    return await this.repository.count({
      where: criteria as any,
      withDeleted: true,
    });
  }
}
