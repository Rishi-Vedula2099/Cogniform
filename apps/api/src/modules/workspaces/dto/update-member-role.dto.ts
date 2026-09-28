import { IsEnum, IsNotEmpty } from "class-validator";
import { Role } from "@prisma/client";

export class UpdateMemberRoleDto {
  @IsEnum(Role, { message: "Role must be OWNER, ADMIN, EDITOR, or VIEWER" })
  @IsNotEmpty({ message: "Role is required" })
  role!: Role;
}
