import { RecurringTransaction } from "@wallio/entities";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WalletModule } from "./wallet.module";
import { LabelModule } from "./label.module";
import { RecurringTransactionService } from "@wallio/services";
import { RecurringTransactionController } from "@wallio/rest/controller";
import { RecurringTransactionMapper } from "@wallio/rest/mapper";

@Module({
  imports: [
    TypeOrmModule.forFeature([RecurringTransaction]),
    WalletModule,
    LabelModule,
  ],
  controllers: [RecurringTransactionController],
  providers: [RecurringTransactionService, RecurringTransactionMapper],
  exports: [RecurringTransactionService, RecurringTransactionMapper],
})
export class RecurringTransactionModule {}
