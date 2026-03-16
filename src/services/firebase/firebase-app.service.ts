import { Injectable } from "@nestjs/common";
import * as firebaseAdmin from "firebase-admin";
import { FirebaseApp } from "./types";
import * as dotenv from "dotenv";
dotenv.config();

@Injectable()
export class FirebaseAppService {
  private firebaseApp: FirebaseApp;

  constructor() {
    this.firebaseApp = firebaseAdmin.initializeApp({
      credential: this.getCredential(),
    });
  }

  getAppInstance(): FirebaseApp {
    return this.firebaseApp;
  }

  private getCredential() {
    return firebaseAdmin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
    });
  }
}
