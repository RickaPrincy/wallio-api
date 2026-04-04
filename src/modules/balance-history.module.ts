import { BalanceHistory } from "@wallio/entities";
import { BalanceHistoryService } from "@wallio/services";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BalanceHistoryMapper } from "@wallio/rest/mapper";
import { BalanceHistoryController } from "@wallio/rest/controller";
import { WalletModule } from "./wallet.module";

@Module({
  imports: [TypeOrmModule.forFeature([BalanceHistory]), WalletModule],
  controllers: [BalanceHistoryController],
  providers: [BalanceHistoryService, BalanceHistoryMapper],
  exports: [BalanceHistoryService],
})
export class BalanceHistoryModule {}
