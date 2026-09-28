import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";
import type { Request } from "express";

/**
 * Logs every request with method, path, status code and duration.
 * Intentionally lightweight — no body logging (may contain secrets).
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const { method, url } = req;
    const started = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - started;
          const res = context.switchToHttp().getResponse<{ statusCode: number }>();
          this.logger.log(`${method} ${url} → ${res.statusCode} (${ms}ms)`);
        },
      }),
    );
  }
}
