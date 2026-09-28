import { IsEmail, IsEnum, IsNotEmpty } from "class-validator";
import { Role } from "@prisma/client";

export class InviteMemberDto {
  @IsEmail({}, { message: "Please provide a valid email address" })
  @IsNotEmpty({ message: "Email is required" })
  email!: string;

  @IsEnum(Role, { message: "Role must be OWNER, ADMIN, EDITOR, or VIEWER" })
  @IsNotEmpty({ message: "Role is required" })
  role!: Role;
}
