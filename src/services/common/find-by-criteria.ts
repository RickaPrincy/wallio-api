import { FindManyOptions, ObjectLiteral, Repository } from "typeorm";
import { Criteria } from "./criteria";
import { createPagination } from "./create-pagination";
import { PaginationParams } from "@wallio/rest/decorator";

export const findByCriteria = async <T extends ObjectLiteral>({
  pagination,
  repository,
  criteria,
  ...findManyOptions
}: {
  pagination: PaginationParams;
  repository: Repository<T>;
  criteria?: Criteria<T>;
} & FindManyOptions<T>) => {
  const paginationOptions = createPagination(pagination);
  return repository.find({
    where: criteria,
    loadEagerRelations: true,
    ...paginationOptions,
    ...findManyOptions,
  });
};
