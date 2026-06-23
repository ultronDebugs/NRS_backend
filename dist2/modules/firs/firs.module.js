"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirsModule = void 0;
const common_1 = require("@nestjs/common");
const firs_service_1 = require("./firs.service");
const firs_controller_1 = require("./firs.controller");
const database_1 = require("../../database");
let FirsModule = class FirsModule {
};
exports.FirsModule = FirsModule;
exports.FirsModule = FirsModule = __decorate([
    (0, common_1.Module)({
        imports: [database_1.DatabaseModule],
        controllers: [firs_controller_1.FirsController],
        exports: [firs_service_1.FirsService],
        providers: [firs_service_1.FirsService],
    })
], FirsModule);
//# sourceMappingURL=firs.module.js.map