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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("./common/decorators/public.decorator");
let AppController = class AppController {
    getApiRoot() {
        return {
            name: "Genius-Excel E-Invoice API",
            version: "1.0",
            status: "ok",
        };
    }
    getRoot() {
        return [
            "   ____           _               _____               _   ",
            "  / ___| ___ _ __(_)_   _ ___    | ____|_  _____  ___| |  ",
            " | |  _ / _ \\ '_ \\ | | | / __|   |  _| \\ \\/ / __|/ _ \\ |  ",
            " | |_| |  __/ | | | | |_| \\__ \\  | |___ >  < (__|  __/ |  ",
            "  \\____|\\___|_| |_|_|\\__,_|___/__|_____/_/\\_\\___|\\___|_|  ",
            "                             |_____|                      ",
            "",
            "  E-Invoice API  |  v1.0  |  /api for Swagger Docs",
            "",
        ].join("\n");
    }
};
exports.AppController = AppController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)("api/v1"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getApiRoot", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    (0, common_1.Header)("Content-Type", "text/plain; charset=utf-8"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getRoot", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)()
], AppController);
//# sourceMappingURL=app.controller.js.map