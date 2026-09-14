import { ConfigService } from "@nestjs/config";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import {
  Dummy,
  User,
  Wallet,
  Transaction,
  Project,
  ProjectItem,
  Label,
} from "@wallio/entities";

export const ENTITIES = [
  Dummy,
  User,
  Wallet,
  Transaction,
  Project,
  ProjectItem,
  Label,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        entities: ENTITIES,
        url: configService.get("DATABASE_URL"),
        synchronize: true, //WARNING: remove synchronize on prod
      }),
    }),
  ],
})
export class DatabaseModule {}
