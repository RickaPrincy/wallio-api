import { Wallet } from "@wallio/entities";
import { WalletMapper } from "@wallio/rest/mapper";
import { WalletService } from "@wallio/services";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WalletController } from "@wallio/rest/controller";

@Module({
  imports: [TypeOrmModule.forFeature([Wallet])],
  controllers: [WalletController],
  providers: [WalletService, WalletMapper],
  exports: [WalletService, WalletMapper],
})
export class WalletModule {}
