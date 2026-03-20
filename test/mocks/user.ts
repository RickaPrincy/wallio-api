import { User } from "@wallio/entities";
import { JOHN_FIREBASE_USER, JANE_FIREBASE_USER } from "./firebase-user";

export const JOHN: User = {
  id: "john_id",
  email: JOHN_FIREBASE_USER.email,
  firebaseId: JOHN_FIREBASE_USER.uid,
  username: JOHN_FIREBASE_USER.displayName,
  firstName: JOHN_FIREBASE_USER.displayName,
  lastName: JOHN_FIREBASE_USER.displayName,
  avatarUrl: JOHN_FIREBASE_USER.photoURL,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  wallets: [],
};

export const JANE: User = {
  id: "jane_id",
  email: JANE_FIREBASE_USER.email,
  firebaseId: JANE_FIREBASE_USER.uid,
  username: JANE_FIREBASE_USER.displayName,
  firstName: JANE_FIREBASE_USER.displayName,
  lastName: JANE_FIREBASE_USER.displayName,
  avatarUrl: JANE_FIREBASE_USER.photoURL,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  wallets: [],
};
