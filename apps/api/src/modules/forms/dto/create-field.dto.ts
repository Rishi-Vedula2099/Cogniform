import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { FieldType } from "@prisma/client";

export class CreateFieldDto {
  @IsEnum(FieldType)
  @IsNotEmpty()
  type!: FieldType;

  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsString()
  @IsOptional()
  placeholder?: string;

  @IsString()
  @IsOptional()
  helpText?: string;

  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @IsString()
  @IsOptional()
  defaultValue?: string;

  @IsInt()
  @IsOptional()
  order?: number;

  @IsInt()
  @IsOptional()
  width?: number;

  @IsOptional()
  options?: any;

  @IsOptional()
  settings?: any;
}
