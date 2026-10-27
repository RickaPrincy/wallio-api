import {
  RecurringTransaction,
  RecurringTransactionOccurrence,
} from "@wallio/entities";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WalletModule } from "./wallet.module";
import { LabelModule } from "./label.module";
import {
  RecurringTransactionService,
  RecurringTransactionOccurrenceService,
} from "@wallio/services";
import {
  RecurringTransactionController,
  RecurringTransactionOccurrenceController,
} from "@wallio/rest/controller";
import {
  RecurringTransactionMapper,
  RecurringTransactionOccurrenceMapper,
} from "@wallio/rest/mapper";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecurringTransaction,
      RecurringTransactionOccurrence,
    ]),
    WalletModule,
    LabelModule,
  ],
  controllers: [
    RecurringTransactionController,
    RecurringTransactionOccurrenceController,
  ],
  providers: [
    RecurringTransactionService,
    RecurringTransactionMapper,
    RecurringTransactionOccurrenceService,
    RecurringTransactionOccurrenceMapper,
  ],
  exports: [
    RecurringTransactionService,
    RecurringTransactionMapper,
    RecurringTransactionOccurrenceService,
    RecurringTransactionOccurrenceMapper,
  ],
})
export class RecurringTransactionModule {}
