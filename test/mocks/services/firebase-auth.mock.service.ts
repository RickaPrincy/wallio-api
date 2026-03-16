import { FirebaseUser } from "@wallio/services/firebase";
import { ForbiddenException } from "@nestjs/common";

export const createFirebaseMock = (users: FirebaseUser[]) => {
  return {
    verfiyTokenId: (token: string) => {
      const user = users.find((user) => user.uid === token);

      if (!user) {
        throw new ForbiddenException();
      }

      return { email: user.email };
    },
    findUserByEmail: (email: string) => {
      const user = users.find((user) => user.email === email);

      if (!user) {
        throw new ForbiddenException();
      }

      return user;
    },
  };
};
