import * as firebase from "firebase-admin";

export type FirebaseApp = firebase.app.App;
export type FirebaseAuth = firebase.auth.Auth;
export type FirebaseUser = Pick<
  firebase.auth.UserRecord,
  "uid" | "photoURL" | "email" | "displayName" | "emailVerified"
>;
