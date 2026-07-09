import { Module } from "@nestjs/common";
import { InitInfoService } from "@wallio/services";
import { WalletModule } from "./wallet.module";
import { TransactionModule } from "./transaction.module";
import { InitInfosController } from "@wallio/rest/controller";
import { InitInfoMapper } from "@wallio/rest/mapper";

@Module({
  imports: [WalletModule, TransactionModule],
  controllers: [InitInfosController],
  providers: [InitInfoService, InitInfoMapper],
  exports: [InitInfoService],
})
export class InitInfoModule {}
