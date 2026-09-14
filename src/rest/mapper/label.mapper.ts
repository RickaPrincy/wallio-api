import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Label as DomainLabel, User } from "@wallio/entities";
import { Label as RestLabel } from "@wallio/rest/model";

@Injectable()
export class LabelMapper {
  constructor(
    @InjectRepository(DomainLabel)
    private readonly labelRepository: Repository<DomainLabel>
  ) {}

  async toRestList(labels: DomainLabel[]): Promise<RestLabel[]> {
    return Promise.all(labels.map((label) => this.toRest(label)));
  }

  async toRest(label: DomainLabel): Promise<RestLabel> {
    const { user: _user, ...restLabel } = label;
    return restLabel;
  }

  async toDomainList(labels: RestLabel[], user: User): Promise<DomainLabel[]> {
    return Promise.all(labels.map((label) => this.toDomain(label, user)));
  }

  async toDomain(restLabel: RestLabel, user: User): Promise<DomainLabel> {
    return this.labelRepository.create({ ...restLabel, user });
  }
}
