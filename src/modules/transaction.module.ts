import { Transaction } from "@wallio/entities";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WalletModule } from "./wallet.module";
import { TransactionService } from "@wallio/services";
import { TransactionController } from "@wallio/rest/controller";
import { TransactionMapper } from "@wallio/rest/mapper";

@Module({
  imports: [TypeOrmModule.forFeature([Transaction]), WalletModule],
  controllers: [TransactionController],
  providers: [TransactionService, TransactionMapper],
  exports: [TransactionService, TransactionMapper],
})
export class TransactionModule {}
