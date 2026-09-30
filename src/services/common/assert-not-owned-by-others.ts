import {
  EntityManager,
  EntityTarget,
  FindOptionsWhere,
  In,
  ObjectLiteral,
} from "typeorm";
import { BadRequestException } from "@nestjs/common";

// The PUT routes upsert on ids chosen by the client. Without this check, sending
// the id of someone else's row would overwrite it and hand it over to the caller.
// Soft deleted rows count too: restoring one must not change its owner either.
export const assertNotOwnedByOthers = async <T extends ObjectLiteral>({
  manager,
  entity,
  ids,
  ownedByOthers,
  name,
}: {
  manager: EntityManager;
  entity: EntityTarget<T>;
  ids: (string | undefined)[];
  ownedByOthers: FindOptionsWhere<T>;
  name: string;
}) => {
  const uniqueIds = Array.from(new Set(ids.filter((id): id is string => !!id)));

  if (uniqueIds.length === 0) {
    return;
  }

  const count = await manager.count(entity, {
    where: { ...ownedByOthers, id: In(uniqueIds) } as FindOptionsWhere<T>,
    withDeleted: true,
  });

  if (count > 0) {
    throw new BadRequestException(`One or more ${name} do not belong to you`);
  }
};
