import { ApiProperty } from "@nestjs/swagger";
import { Wallet } from "./wallet";
import { Transaction } from "./transaction";
import { Project } from "./project";
import { ProjectItem } from "./project-item";
import { Label } from "./label";

export class InitInfo {
  @ApiProperty({ type: Wallet, isArray: true })
  wallets: Wallet[];

  @ApiProperty({ type: Transaction, isArray: true })
  transactions: Transaction[];

  @ApiProperty({ type: Project, isArray: true })
  projects: Project[];

  @ApiProperty({ type: ProjectItem, isArray: true })
  projectItems: ProjectItem[];

  @ApiProperty({ type: Label, isArray: true })
  labels: Label[];
}
