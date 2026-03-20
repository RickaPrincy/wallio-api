import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { User as DomainUser } from "@wallio/entities";
import { CreateUser, User as RestUser } from "@wallio/rest/model/user";
import { FirebaseUser } from "@wallio/services/firebase";

@Injectable()
export class UserMapper {
  constructor(
    @InjectRepository(DomainUser)
    private readonly userRepository: Repository<DomainUser>
  ) {}

  async toRest(user: DomainUser): Promise<RestUser> {
    if (!user) {
      return null;
    }

    const {
      deletedAt: _deletedAt,
      firebaseId: _firebaseId,
      ...restUser
    } = user;

    return restUser;
  }

  async createToDomain(
    createUser: CreateUser,
    firebaseUser: FirebaseUser
  ): Promise<DomainUser> {
    return this.userRepository.create({
      ...createUser,
      email: firebaseUser.email,
      firebaseId: firebaseUser.uid,
      avatarUrl: firebaseUser?.photoURL,
    });
  }
}
