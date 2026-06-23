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
exports.GenerateQrCodeDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class GenerateQrCodeDto {
    irn;
    firsPublicKeyBase64;
    firsCertificateBase64;
    userId;
}
exports.GenerateQrCodeDto = GenerateQrCodeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "The Invoice Reference Number (IRN) for which to generate the QR code",
        example: "ITW001-E9E0C0D3-20240619",
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(1, 100),
    __metadata("design:type", String)
], GenerateQrCodeDto.prototype, "irn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Base64-encoded FIRS public key (overrides stored/env value)",
        example: "LS0tLS1CRUdJTi...",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 10000),
    __metadata("design:type", String)
], GenerateQrCodeDto.prototype, "firsPublicKeyBase64", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Base64-encoded FIRS certificate (overrides stored/env value)",
        example: "LS0tLS1CRUdJTi...",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 10000),
    __metadata("design:type", String)
], GenerateQrCodeDto.prototype, "firsCertificateBase64", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "User ID to use stored FIRS settings when payload keys not provided",
        example: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], GenerateQrCodeDto.prototype, "userId", void 0);
//# sourceMappingURL=generate-qr-code.dto.js.map