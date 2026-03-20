import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ApiRequiredSpec } from "@wallio/rest/swagger/decorator";
import { UserService } from "@wallio/services";
import { User as RestUser, CreateUser } from "@wallio/rest/model/user";
import { AuthenticatedFirebaseUser } from "@wallio/auth/decorator/retriever";
import { UserMapper } from "@wallio/rest/mapper";
import { FirebaseUser } from "@wallio/services/firebase";
import { Authenticated } from "@wallio/auth/decorator";

@Controller()
@ApiTags("Users")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userMapper: UserMapper
  ) {}

  @Get("/users/:id")
  @Authenticated({ selfMatcher: "id" })
  @ApiRequiredSpec({ operationId: "getUserById", type: RestUser })
  async getUserById(@Param("id") userId: string): Promise<RestUser> {
    const domainUser = await this.userService.findById(userId);
    if (!domainUser) {
      throw new NotFoundException(`The user ${userId} does not exist.`);
    }
    return this.userMapper.toRest(domainUser);
  }

  @Post("/users")
  @Authenticated()
  @ApiRequiredSpec({ operationId: "createUser", type: RestUser })
  async createUser(
    @AuthenticatedFirebaseUser() firebaseUser: FirebaseUser,
    @Body() createUser: CreateUser
  ): Promise<RestUser> {
    const domainUser = await this.userMapper.createToDomain(
      createUser,
      firebaseUser
    );
    const createdUser = await this.userService.createUser(domainUser);

    return this.userMapper.toRest(createdUser);
  }
}
