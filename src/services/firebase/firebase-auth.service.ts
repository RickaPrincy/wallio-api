import { Injectable } from "@nestjs/common";
import * as firebaseAdmin from "firebase-admin";

import { FirebaseAppService } from "./firebase-app.service";
import { FirebaseAuth, FirebaseUser } from "./types";

@Injectable()
export class FirebaseAuthService {
  private firebaseAuth: FirebaseAuth;

  constructor(private readonly firebaseAppService: FirebaseAppService) {
    this.firebaseAuth = firebaseAdmin.auth(
      this.firebaseAppService.getAppInstance()
    );
  }

  async verifyTokenId(tokenId: string) {
    return this.firebaseAuth.verifyIdToken(tokenId);
  }

  async deleteUser(uid: string) {
    try {
      await this.firebaseAuth.deleteUser(uid);
    } catch (error) {
      // Already gone: a previous deletion reached Firebase, nothing left to do.
      if (error?.code !== "auth/user-not-found") {
        throw error;
      }
    }
  }

  async findUserByEmail(providedEmail: string): Promise<FirebaseUser> {
    const retrieveUser = await this.firebaseAuth.getUserByEmail(providedEmail);
    return {
      uid: retrieveUser.uid,
      email: retrieveUser.email,
      emailVerified: retrieveUser.emailVerified,
      photoURL: retrieveUser.photoURL,
      displayName: retrieveUser.displayName,
    };
  }
}
