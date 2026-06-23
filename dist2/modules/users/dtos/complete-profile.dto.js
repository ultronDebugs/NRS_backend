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
exports.CompleteProfileDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const register_user_dto_1 = require("./register-user.dto");
class CompleteProfileDto {
    entityId;
    businessName;
    businessAddress;
    rcNumber;
    dateOfIncorporation;
    directors;
    firsApiKey;
    firsApiSecret;
    firsPublicKeyBase64;
    firsCertificateBase64;
    businessId;
    irnTemplate;
    erpName;
}
exports.CompleteProfileDto = CompleteProfileDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, swagger_1.ApiProperty)({
        description: "The NRS-issued Entity ID for the business",
        example: "9bb244de-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        required: true,
    }),
    __metadata("design:type", String)
], CompleteProfileDto.prototype, "entityId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, swagger_1.ApiProperty)({
        description: "The registered business name",
        example: "Genius-Excel Technology Limited",
        required: true,
    }),
    __metadata("design:type", String)
], CompleteProfileDto.prototype, "businessName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, swagger_1.ApiProperty)({
        description: "The registered business address",
        example: "123 Main St, Lagos, Nigeria",
        required: true,
    }),
    __metadata("design:type", String)
], CompleteProfileDto.prototype, "businessAddress", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(4),
    (0, swagger_1.ApiProperty)({
        description: "The CAC registration certificate number",
        example: "RC123456",
        required: true,
    }),
    __metadata("design:type", String)
], CompleteProfileDto.prototype, "rcNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    (0, swagger_1.ApiProperty)({
        description: "Date of incorporation (ISO format)",
        example: "2020-01-01",
        required: false,
    }),
    __metadata("design:type", String)
], CompleteProfileDto.prototype, "dateOfIncorporation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => register_user_dto_1.DirectorDto),
    (0, swagger_1.ApiProperty)({
        description: "List of directors (optional)",
        type: [register_user_dto_1.DirectorDto],
        required: false,
    }),
    __metadata("design:type", Array)
], CompleteProfileDto.prototype, "directors", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: "The FIRS API Key from the business's FIRS Dashboard (Developer Settings → Apps)",
        example: "2483f0f8-6e72-4c52-b893-f11dc79afce1",
        required: true,
    }),
    __metadata("design:type", String)
], CompleteProfileDto.prototype, "firsApiKey", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: "The FIRS Client Secret from the business's FIRS Dashboard (Developer Settings → Apps)",
        example: "zSLuYPWOQD4OsoXUtHb3xz...",
        required: true,
    }),
    __metadata("design:type", String)
], CompleteProfileDto.prototype, "firsApiSecret", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: "Base64-encoded RSA public key from the crypto_keys.txt file downloaded from FIRS Dashboard → Manage Cryptographic Keys",
        required: true,
    }),
    __metadata("design:type", String)
], CompleteProfileDto.prototype, "firsPublicKeyBase64", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: "Base64-encoded certificate from the crypto_keys.txt file downloaded from FIRS Dashboard → Manage Cryptographic Keys",
        required: true,
    }),
    __metadata("design:type", String)
], CompleteProfileDto.prototype, "firsCertificateBase64", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: "The Business ID (UUID) associated with the entity",
        example: "ac30649a-8243-4fc8-b6a5-654606b8e734",
        required: true,
    }),
    __metadata("design:type", String)
], CompleteProfileDto.prototype, "businessId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: "The IRN template assigned to this business",
        example: "{{invoice_id(e.g:INV00XXX)}}-0AB18243-{{YYYYMMDD(e.g:20260610)}}",
        required: true,
    }),
    __metadata("design:type", String)
], CompleteProfileDto.prototype, "irnTemplate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({
        description: "The ERP Name",
        example: "Others",
        required: false,
    }),
    __metadata("design:type", String)
], CompleteProfileDto.prototype, "erpName", void 0);
//# sourceMappingURL=complete-profile.dto.js.map