import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ApiResponseDto } from "../dto/api-response.dto";

/**
 * Wraps every controller return value in the standardized `ApiResponse` envelope.
 * Controllers can return raw data (`return user`) and it will be sent as
 * `{ success: true, data: user }`. If a controller already returns an
 * ApiResponseDto we leave it untouched.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, unknown> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        if (data instanceof ApiResponseDto) return data;
        if (data === undefined || data === null) return { success: true };
        // Already enveloped by controller (e.g. paginate())
        if (
          typeof data === "object" &&
          data !== null &&
          "success" in data &&
          typeof (data as { success: unknown }).success === "boolean"
        ) {
          return data;
        }
        return ApiResponseDto.ok(data);
      }),
    );
  }
}
