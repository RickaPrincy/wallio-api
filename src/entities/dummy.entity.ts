import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Dummy {
  @ApiProperty({ format: "uuid" })
  @PrimaryColumn()
  id: string;

  @ApiProperty()
  @Column()
  name: string;
}
