import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class PaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit: number = 20;

  @ApiPropertyOptional({ description: "Sort field, prefix with - for descending (e.g. -createdAt)" })
  @IsString()
  @IsOptional()
  sort?: string;

  @ApiPropertyOptional({ description: "Free-text search query" })
  @IsString()
  @IsOptional()
  q?: string;
}

export interface Paginated<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export function paginate<T>(
  rows: T[],
  total: number,
  page: number,
  limit: number,
): Paginated<T> {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    data: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}
