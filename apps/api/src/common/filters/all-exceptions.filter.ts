import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { ZodError } from "zod";

/**
 * Last-resort filter for non-HTTP exceptions (Prisma errors, Zod errors
 * thrown outside the ValidationPipe, programming bugs). Always returns the
 * standardized envelope so the web client only has one shape to handle.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    // Zod errors thrown manually inside services
    if (exception instanceof ZodError) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input",
          details: exception.flatten().fieldErrors,
        },
      });
    }

    // Prisma errors → 4xx with helpful code
    const prisma = this.normalizePrismaError(exception);
    if (prisma) {
      return res.status(prisma.status).json({
        success: false,
        error: { code: prisma.code, message: prisma.message },
      });
    }

    // Fallback: log full detail server-side, leak minimal info to client
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof Error ? exception.message : "Internal server error";
    this.logger.error(
      `Unhandled ${req.method} ${req.url} → ${status}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    res.status(status).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message:
          process.env.NODE_ENV === "production"
            ? "Something went wrong"
            : message,
      },
    });
  }

  private normalizePrismaError(exception: unknown): {
    status: number;
    code: string;
    message: string;
  } | null {
    if (
      typeof exception !== "object" ||
      exception === null ||
      !("code" in exception)
    ) {
      return null;
    }
    const code = (exception as { code: string }).code as string;
    const message =
      exception instanceof Error ? exception.message : "Database error";

    switch (code) {
      case "P2002":
        return {
          status: HttpStatus.CONFLICT,
          code: "CONFLICT",
          message: "A record with this value already exists",
        };
      case "P2025":
        return {
          status: HttpStatus.NOT_FOUND,
          code: "NOT_FOUND",
          message: "Record not found",
        };
      case "P2003":
        return {
          status: HttpStatus.BAD_REQUEST,
          code: "FOREIGN_KEY_VIOLATION",
          message,
        };
      default:
        return { status: HttpStatus.BAD_REQUEST, code, message };
    }
  }
}
