import { IsNotEmpty, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class CreateWorkspaceDto {
  @IsString()
  @IsNotEmpty({ message: "Workspace name is required" })
  @MinLength(2, { message: "Workspace name must be at least 2 characters long" })
  name!: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-z0-9-]+$/, { message: "Slug must contain only lowercase letters, numbers, and hyphens" })
  slug?: string;

  @IsString()
  @IsOptional()
  logo?: string;
}
