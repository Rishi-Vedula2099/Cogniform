import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";
import { FormStatus } from "@prisma/client";

export class UpdateFormDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(FormStatus)
  @IsOptional()
  status?: FormStatus;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsString()
  @IsOptional()
  password?: string;

  @IsBoolean()
  @IsOptional()
  captchaEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  allowEmbed?: boolean;

  @IsString()
  @IsOptional()
  customDomain?: string;
}
