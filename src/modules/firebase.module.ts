import {
  FirebaseAppService,
  FirebaseAuthService,
} from "@wallio/services/firebase";
import { Module } from "@nestjs/common";

@Module({
  providers: [FirebaseAppService, FirebaseAuthService],
  exports: [FirebaseAppService, FirebaseAuthService],
})
export class FirebaseModule {}
