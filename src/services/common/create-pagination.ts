import { FindManyOptions } from "typeorm";
import { PaginationParams } from "@wallio/rest/decorator";

export function createPagination(
  pagination: PaginationParams
): Pick<FindManyOptions, "take" | "skip"> {
  return {
    take: pagination.pageSize,
    skip: (pagination.page - 1) * pagination.pageSize,
  };
}
