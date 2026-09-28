import { IsOptional, IsString, MinLength } from "class-validator";

export class UpdateWorkspaceDto {
  @IsString()
  @IsOptional()
  @MinLength(2, { message: "Workspace name must be at least 2 characters long" })
  name?: string;

  @IsString()
  @IsOptional()
  logo?: string;
}
