import { FirebaseUser } from "@wallio/services/firebase";
import { v4 as uuid } from "uuid";

export const JOHN_FIREBASE_USER: FirebaseUser = {
  emailVerified: true,
  uid: uuid(),
  displayName: "John Doe",
  email: "johndoe@gmail.com",
  photoURL: "https://dummy.com",
};

export const JANE_FIREBASE_USER: FirebaseUser = {
  emailVerified: true,
  uid: uuid(),
  displayName: "Jane Dane",
  email: "janedane@gmail.com",
  photoURL: "https://dummy.com",
};
