import { FirebaseUser } from "@wallio/services/firebase";

export const JOHN_FIREBASE_USER: FirebaseUser = {
  emailVerified: true,
  uid: "john_uid",
  displayName: "John Doe",
  email: "johndoe@gmail.com",
  photoURL: "https://dummy.com",
};

export const JANE_FIREBASE_USER: FirebaseUser = {
  emailVerified: true,
  uid: "jane_uid",
  displayName: "Jane Dane",
  email: "janedane@gmail.com",
  photoURL: "https://dummy.com",
};

// Not seeded: can create a Wallio account.
export const CAROL_FIREBASE_USER: FirebaseUser = {
  emailVerified: true,
  uid: "carol_uid",
  displayName: "Carol",
  email: "carol@gmail.com",
  photoURL: "https://dummy.com",
};

// Not seeded, email not verified yet.
export const BOB_FIREBASE_USER: FirebaseUser = {
  emailVerified: false,
  uid: "bob_uid",
  displayName: "Bob",
  email: "bob@gmail.com",
  photoURL: "https://dummy.com",
};
