import { User } from "@wallio/entities";
import { FirebaseUser } from "@wallio/services/firebase";
import "express";

declare module "express" {
  interface Request {
    token?: string;
    firebaseUser?: FirebaseUser;
    user?: User;
  }
}
