import { Injectable } from "@nestjs/common";

import { User as DomainUser } from "@wallio/entities";
import { Whoami } from "./model";
import { User as RestUser } from "@wallio/rest/model/user";
import { UserMapper } from "@wallio/rest/mapper";
import { FirebaseUser } from "@wallio/services/firebase";

@Injectable()
export class AuthService {
  constructor(private readonly userMapper: UserMapper) {}

  async whoami(
    token: string,
    firebaseUser: FirebaseUser,
    user: DomainUser
  ): Promise<Whoami> {
    let restUser: RestUser = await this.userMapper.toRest(user);

    if (restUser === null) {
      restUser = {
        firstName: firebaseUser.displayName,
        email: firebaseUser.email,
      } as any;
    }

    return { user: restUser, token, isVerified: Boolean(user) };
  }
}
