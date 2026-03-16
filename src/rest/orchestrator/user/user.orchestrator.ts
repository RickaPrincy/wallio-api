import { Injectable } from "@nestjs/common";

import { CreateUser } from "@wallio/rest/model/user";
import { User as DomainUser } from "@wallio/entities";
import { UserMapper } from "@wallio/rest/mapper/user";
import { FirebaseUser } from "@wallio/services/firebase";

@Injectable()
export class UserOrchestrator {
  constructor(private readonly userMapper: UserMapper) {}

  async createToDomain(
    user: CreateUser,
    firebaseUser: FirebaseUser
  ): Promise<DomainUser> {
    return this.userMapper.createToDomain(user, firebaseUser);
  }
}
