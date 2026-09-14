import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import {
  ProjectItem as DomainProjectItem,
  Project,
  Transaction,
} from "@wallio/entities";
import { ProjectItem as RestProjectItem } from "@wallio/rest/model";

@Injectable()
export class ProjectItemMapper {
  constructor(
    @InjectRepository(DomainProjectItem)
    private readonly projectItemRepository: Repository<DomainProjectItem>
  ) {}

  async toRestList(items: DomainProjectItem[]): Promise<RestProjectItem[]> {
    return Promise.all(items.map((item) => this.toRest(item)));
  }

  async toRest(item: DomainProjectItem): Promise<RestProjectItem> {
    const { project, transaction, ...restItem } = item;
    return {
      ...restItem,
      projectId: project.id,
      transactionId: transaction?.id,
    };
  }

  async toDomainList(
    restItems: RestProjectItem[],
    projects: Project[]
  ): Promise<DomainProjectItem[]> {
    return Promise.all(
      restItems.map((restItem) => this.toDomain(restItem, projects))
    );
  }

  async toDomain(
    restItem: RestProjectItem,
    projects: Project[]
  ): Promise<DomainProjectItem> {
    const project = projects.find((project) => project.id === restItem.projectId)!;
    const transaction = restItem.transactionId
      ? ({ id: restItem.transactionId } as Transaction)
      : undefined;

    return this.projectItemRepository.create({
      ...restItem,
      project,
      transaction,
    });
  }
}
