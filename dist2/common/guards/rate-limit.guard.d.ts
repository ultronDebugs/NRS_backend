import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class RateLimitGuard implements CanActivate {
    private requests;
    private readonly WINDOW_MS;
    private readonly MAX_REQUESTS;
    constructor();
    private cleanup;
    canActivate(context: ExecutionContext): boolean;
}
