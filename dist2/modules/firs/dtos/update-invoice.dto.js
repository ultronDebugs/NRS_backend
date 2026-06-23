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
exports.UpdateInvoicePaymentStatusDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateInvoicePaymentStatusDto {
    irn;
    paymentStatus;
    reference;
}
exports.UpdateInvoicePaymentStatusDto = UpdateInvoicePaymentStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "The Invoice Reference Number (IRN) of the invoice to update.",
        example: "IRN1234567890",
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateInvoicePaymentStatusDto.prototype, "irn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "The new payment status for the invoice.",
        enum: ["PENDING", "PAID", "REJECTED"],
        example: "PAID",
    }),
    (0, class_validator_1.IsEnum)(["PENDING", "PAID", "REJECTED"]),
    __metadata("design:type", String)
], UpdateInvoicePaymentStatusDto.prototype, "paymentStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Optional reference string for the payment update.",
        example: "BANK-REF-2024-001",
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateInvoicePaymentStatusDto.prototype, "reference", void 0);
//# sourceMappingURL=update-invoice.dto.js.map