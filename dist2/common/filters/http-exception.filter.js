"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    logger = new common_1.Logger(AllExceptionsFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let statusCode;
        let message;
        let error;
        let source;
        let extraFields = {};
        if (exception instanceof common_1.HttpException) {
            statusCode = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === "string") {
                message = exceptionResponse;
                error = this.getErrorName(statusCode);
            }
            else if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
                const resp = exceptionResponse;
                message = Array.isArray(resp.message)
                    ? resp.message.join("; ")
                    : resp.message || exception.message;
                error = resp.error || this.getErrorName(statusCode);
                source = resp.source;
                extraFields = Object.fromEntries(Object.entries(resp).filter(([key]) => !["statusCode", "message", "error", "source"].includes(key)));
            }
            else {
                message = exception.message;
                error = this.getErrorName(statusCode);
            }
        }
        else if (exception instanceof Error) {
            statusCode = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            message = "Internal Server Error";
            error = "Internal Server Error";
            source = this.extractSourceFromStack(exception.stack);
        }
        else {
            statusCode = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
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
        this.logger.error(`[${request.method}] ${request.url} → ${statusCode} | ${message}`, exception instanceof Error ? exception.stack : String(exception));
        response.status(statusCode).json(errorResponse);
    }
    getErrorName(statusCode) {
        const errorNames = {
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
    extractSourceFromStack(stack) {
        if (!stack)
            return undefined;
        const lines = stack.split("\n");
        for (const line of lines.slice(1)) {
            const match = line.match(/at\s+([A-Z]\w+)\.(\w+)\s/);
            if (match) {
                const className = match[1];
                if (className.includes("Filter") ||
                    className.includes("Guard") ||
                    className.includes("Interceptor") ||
                    className === "Object" ||
                    className === "Module") {
                    continue;
                }
                return `${className}.${match[2]}`;
            }
        }
        return undefined;
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=http-exception.filter.js.map