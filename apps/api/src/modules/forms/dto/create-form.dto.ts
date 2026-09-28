import { IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class CreateFormDto {
  @IsString()
  @IsNotEmpty({ message: "Form title is required" })
  @MinLength(2, { message: "Form title must be at least 2 characters long" })
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty({ message: "Workspace ID is required" })
  workspaceId!: string;
}
