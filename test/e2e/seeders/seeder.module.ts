import { Module } from "@nestjs/common";
import { DataSource } from "typeorm";

import { DummySeeder } from "./dummy.seeder";

export const SEEDER_NAME = "SEEDER";
export type SeederRunnable = {
  run: () => Promise<void>;
};

@Module({
  providers: [
    {
      provide: SEEDER_NAME,
      useFactory: (datasource: DataSource) => ({
        run: async () => {
          await new DummySeeder(datasource).run();
        },
      }),
      inject: [DataSource],
    },
  ],
  exports: [SEEDER_NAME],
})
export class SeederModule {}
