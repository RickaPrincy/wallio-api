import { FirebaseUser } from "@wallio/services/firebase";
import { ForbiddenException } from "@nestjs/common";

export const createFirebaseMock = (users: FirebaseUser[]) => {
  return {
    verifyTokenId: async (token: string) => {
      const user = users.find((user) => user.uid === token);

      if (!user) {
        throw new ForbiddenException();
      }

      return Promise.resolve({ email: user.email });
    },
    findUserByEmail: async (email: string) => {
      const user = users.find((user) => user.email === email);

      if (!user) {
        throw new ForbiddenException();
      }

      return Promise.resolve(user);
    },
  };
};
