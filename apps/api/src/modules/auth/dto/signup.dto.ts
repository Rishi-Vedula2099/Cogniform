import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class SignupDto {
  @IsEmail({}, { message: "Please provide a valid email address" })
  @IsNotEmpty({ message: "Email is required" })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: "Password is required" })
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  password!: string;

  @IsString()
  @IsOptional()
  name?: string;
}
