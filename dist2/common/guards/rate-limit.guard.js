"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitGuard = void 0;
const common_1 = require("@nestjs/common");
let RateLimitGuard = class RateLimitGuard {
    requests = new Map();
    WINDOW_MS = 60000;
    MAX_REQUESTS = 5;
    constructor() {
        setInterval(() => this.cleanup(), this.WINDOW_MS * 2).unref();
    }
    cleanup() {
        const now = Date.now();
        for (const [ip, record] of this.requests.entries()) {
            if (now - record.timestamp >= this.WINDOW_MS) {
                this.requests.delete(ip);
            }
        }
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const ip = request.ip || request.connection?.remoteAddress || 'unknown';
        const now = Date.now();
        const record = this.requests.get(ip);
        if (record) {
            if (now - record.timestamp < this.WINDOW_MS) {
                if (record.count >= this.MAX_REQUESTS) {
                    throw new common_1.HttpException('Too Many Requests', common_1.HttpStatus.TOO_MANY_REQUESTS);
                }
                record.count++;
            }
            else {
                this.requests.set(ip, { count: 1, timestamp: now });
            }
        }
        else {
            this.requests.set(ip, { count: 1, timestamp: now });
        }
        return true;
    }
};
exports.RateLimitGuard = RateLimitGuard;
exports.RateLimitGuard = RateLimitGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], RateLimitGuard);
//# sourceMappingURL=rate-limit.guard.js.map