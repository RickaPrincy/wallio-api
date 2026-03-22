import { ApiProperty } from "@nestjs/swagger";

export class User {
  @ApiProperty({ format: "uuid" })
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName?: string;

  @ApiProperty()
  avatarUrl?: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ format: "date-time" })
  createdAt: string;

  @ApiProperty({ format: "date-time" })
  updatedAt: string;
}
