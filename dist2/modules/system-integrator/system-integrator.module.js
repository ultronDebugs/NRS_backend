"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemIntegratorModule = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../database");
const system_integrator_service_1 = require("./system-integrator.service");
const system_integrator_controller_1 = require("./system-integrator.controller");
let SystemIntegratorModule = class SystemIntegratorModule {
};
exports.SystemIntegratorModule = SystemIntegratorModule;
exports.SystemIntegratorModule = SystemIntegratorModule = __decorate([
    (0, common_1.Module)({
        imports: [database_1.DatabaseModule],
        controllers: [system_integrator_controller_1.SystemIntegratorController],
        exports: [system_integrator_service_1.SystemIntegratorService],
        providers: [system_integrator_service_1.SystemIntegratorService],
    })
], SystemIntegratorModule);
//# sourceMappingURL=system-integrator.module.js.map