import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Project as DomainProject, User } from "@wallio/entities";
import { Project as RestProject } from "@wallio/rest/model";

@Injectable()
export class ProjectMapper {
  constructor(
    @InjectRepository(DomainProject)
    private readonly projectRepository: Repository<DomainProject>
  ) {}

  async toRestList(projects: DomainProject[]): Promise<RestProject[]> {
    return Promise.all(projects.map((project) => this.toRest(project)));
  }

  async toRest(project: DomainProject): Promise<RestProject> {
    const { user: _user, items: _items, ...restProject } = project;
    return restProject;
  }

  async toDomainList(
    projects: RestProject[],
    user: User
  ): Promise<DomainProject[]> {
    return Promise.all(projects.map((project) => this.toDomain(project, user)));
  }

  async toDomain(restProject: RestProject, user: User): Promise<DomainProject> {
    return this.projectRepository.create({ ...restProject, user });
  }
}
