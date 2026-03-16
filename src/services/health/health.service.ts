import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Dummy } from "@wallio/entities";
import { PaginationParams } from "@wallio/rest/decorator";
import { createPagination } from "@wallio/services/common/create-pagination";

@Injectable()
export class HealthService {
  constructor(
    @InjectRepository(Dummy) private readonly repository: Repository<Dummy>
  ) {}

  async getDummies(pagination: PaginationParams) {
    return this.repository.find(createPagination(pagination));
  }
}
