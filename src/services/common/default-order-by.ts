import { FindOptionsOrder } from "typeorm";

// id last: rows saved together share their dates (both legs of a transfer,
// a cascade...), and offset pages need one stable order or a row on a page
// boundary is returned twice or never.
export const UPDATED_AT_CREATED_AT_ORDER_BY: FindOptionsOrder<{
  id: string;
  createdAt: string;
  updatedAt: string;
}> = {
  updatedAt: "DESC",
  createdAt: "DESC",
  id: "ASC",
};
