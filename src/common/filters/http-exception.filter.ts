import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

/**
 * Global exception filter that catches all exceptions and returns
 * a structured, consistent error response with source identification.
 *
 * Response format:
 * {
 *   statusCode: number,
 *   error: string,
 *   message: string,
 *   source: string,        // e.g. "InvoiceService.getInvoiceById"
 *   timestamp: string,
 *   path: string
 * }
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode: number;
    let message: string;
    let error: string;
    let source: string | undefined;
    let extraFields: Record<string, any> = {};

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
        error = this.getErrorName(statusCode);
      } else if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, any>;
        // Handle NestJS validation pipe errors (array of messages)
        message = Array.isArray(resp.message)
          ? resp.message.join("; ")
          : resp.message || exception.message;
        error = resp.error || this.getErrorName(statusCode);
        source = resp.source;
        extraFields = Object.fromEntries(
          Object.entries(resp).filter(
            ([key]) =>
              !["statusCode", "message", "error", "source"].includes(key),
          ),
        );
      } else {
        message = exception.message;
        error = this.getErrorName(statusCode);
      }
    } else if (exception instanceof Error) {
      // Plain Error objects — these are the ones that currently become
      // generic "Internal Server Error" with no useful message.
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = "Internal Server Error";
      error = "Internal Server Error";

      // Try to extract source from the stack trace
      source = this.extractSourceFromStack(exception.stack);
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = "An unexpected error occurred";
      error = "Internal Server Error";
    }

    const errorResponse = {
      statusCode,
      error,
      message,
      ...(source && { source }),
      ...extraFields,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Log full details server-side (always useful for debugging)
    this.logger.error(
      `[${request.method}] ${request.url} → ${statusCode} | ${message}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(statusCode).json(errorResponse);
  }

  /**
   * Maps HTTP status codes to standard error names.
   */
  private getErrorName(statusCode: number): string {
    const errorNames: Record<number, string> = {
      400: "Bad Request",
      401: "Unauthorized",
      403: "Forbidden",
      404: "Not Found",
      409: "Conflict",
      422: "Unprocessable Entity",
      429: "Too Many Requests",
      500: "Internal Server Error",
      502: "Bad Gateway",
      503: "Service Unavailable",
    };
    return errorNames[statusCode] || "Error";
  }

  /**
   * Extracts the originating class/method from an Error stack trace.
   * e.g. "InvoiceService.getInvoiceById" from the stack.
   */
  private extractSourceFromStack(stack?: string): string | undefined {
    if (!stack) return undefined;

    // Look for lines like "at InvoiceService.getInvoiceById (...)"
    const lines = stack.split("\n");
    for (const line of lines.slice(1)) {
      const match = line.match(/at\s+([A-Z]\w+)\.(\w+)\s/);
      if (match) {
        const className = match[1];
        // Skip framework internals
        if (
          className.includes("Filter") ||
          className.includes("Guard") ||
          className.includes("Interceptor") ||
          className === "Object" ||
          className === "Module"
        ) {
          continue;
        }
        return `${className}.${match[2]}`;
      }
    }
    return undefined;
  }
}
