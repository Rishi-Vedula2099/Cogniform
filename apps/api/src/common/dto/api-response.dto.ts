import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * Standard envelope returned by every successful endpoint. Matches the
 * `ApiResponse` type declared in @cogniform/types so the web client can
 * narrow on `success` without additional mapping.
 */
export class ApiResponseDto<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiPropertyOptional({})
  data?: T;

  @ApiPropertyOptional({
    description: "Present only when success=false",
    example: { code: "BAD_REQUEST", message: "Validation failed", details: {} },
  })
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };

  constructor(success: boolean, data?: T, error?: ApiResponseDto<T>["error"]) {
    this.success = success;
    if (data !== undefined) this.data = data;
    if (error !== undefined) this.error = error;
  }

  static ok<T>(data: T): ApiResponseDto<T> {
    return new ApiResponseDto(true, data);
  }

  static fail<T = never>(
    error: ApiResponseDto<T>["error"],
  ): ApiResponseDto<T> {
    return new ApiResponseDto<T>(false, undefined, error);
  }
}
