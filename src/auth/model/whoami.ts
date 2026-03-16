import { User } from "@wallio/rest/model/user";
import { ApiProperty } from "@nestjs/swagger";

export class Whoami {
  @ApiProperty()
  token: string;

  @ApiProperty()
  user: User;

  @ApiProperty()
  isVerified: boolean;
}
