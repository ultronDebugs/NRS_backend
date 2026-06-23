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
exports.CreateInvoiceDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SimplePostalAddressDto {
    street_name;
    city_name;
    postal_zone;
    country = "NG";
    lga;
    state;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: "32, owonikoko street" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], SimplePostalAddressDto.prototype, "street_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "Gwarinpa" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], SimplePostalAddressDto.prototype, "city_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "023401" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], SimplePostalAddressDto.prototype, "postal_zone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "NG", default: "NG" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(2),
    __metadata("design:type", String)
], SimplePostalAddressDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "Ikeja" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], SimplePostalAddressDto.prototype, "lga", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "Lagos" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], SimplePostalAddressDto.prototype, "state", void 0);
class SimplePartyDto {
    party_name;
    tin;
    email;
    telephone;
    business_description;
    postal_address;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: "Genius-Excel Digital Services Ltd" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], SimplePartyDto.prototype, "party_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "33779413-0001" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], SimplePartyDto.prototype, "tin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "business@email.com" }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], SimplePartyDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "+23480254099000" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\+[1-9]\d{1,14}$/, {
        message: "Telephone must start with + and include country code",
    }),
    __metadata("design:type", String)
], SimplePartyDto.prototype, "telephone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "Sales of cement and building materials" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], SimplePartyDto.prototype, "business_description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: SimplePostalAddressDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SimplePostalAddressDto),
    __metadata("design:type", SimplePostalAddressDto)
], SimplePartyDto.prototype, "postal_address", void 0);
class SimpleInvoiceItemDto {
    name;
    description;
    quantity;
    unit_price;
    hsn_code;
    product_category;
    isic_code;
    service_category;
    tax_category = "STANDARD_VAT";
    tax_rate = 7.5;
    discount_amount = 0;
    fee_amount = 0;
    price_unit;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: "Cement" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], SimpleInvoiceItemDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "50kg bag of cement" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], SimpleInvoiceItemDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.000001),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SimpleInvoiceItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SimpleInvoiceItemDto.prototype, "unit_price", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "HS code for goods. Use this or isic_code for services.",
        example: "8523.80.20",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], SimpleInvoiceItemDto.prototype, "hsn_code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Product category for goods.",
        example: "Technology",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], SimpleInvoiceItemDto.prototype, "product_category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "ISIC code for services. Stored as the line code when hsn_code is not supplied.",
        example: "4100",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], SimpleInvoiceItemDto.prototype, "isic_code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Service category when the line is a service.",
        example: "Construction",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], SimpleInvoiceItemDto.prototype, "service_category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "STANDARD_VAT", default: "STANDARD_VAT" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], SimpleInvoiceItemDto.prototype, "tax_category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 7.5, default: 7.5 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SimpleInvoiceItemDto.prototype, "tax_rate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 0, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SimpleInvoiceItemDto.prototype, "discount_amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 0, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SimpleInvoiceItemDto.prototype, "fee_amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "EA" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], SimpleInvoiceItemDto.prototype, "price_unit", void 0);
class CreateInvoiceDto {
    business_id;
    irn;
    issue_date;
    due_date;
    issue_time;
    invoice_type_code = "396";
    invoice_kind = "B2B";
    payment_status = "PENDING";
    document_currency_code = "NGN";
    tax_currency_code;
    note;
    supplier;
    customer;
    items;
}
exports.CreateInvoiceDto = CreateInvoiceDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "NRS business ID. If omitted, the first business linked to the user is used.",
        example: "bb99420d-d6bb-422c-b371-b9f6d6009aae",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "business_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "INV001-94ND90NR-20240611" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "irn", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Defaults to today when omitted.",
        example: "2024-05-14",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "issue_date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "2024-06-14" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "due_date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "17:59:04" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
        message: "Issue time must be in HH:MM:SS format",
    }),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "issue_time", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "396", default: "396" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "invoice_type_code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "B2B", default: "B2B", enum: ["B2B", "B2C", "B2G"] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(["B2B", "B2C", "B2G"]),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "invoice_kind", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: ["PENDING", "PAID", "REJECTED"],
        default: "PENDING",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(["PENDING", "PAID", "REJECTED"]),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "payment_status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "NGN", default: "NGN" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(3),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "document_currency_code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Defaults to document_currency_code when omitted.",
        example: "NGN",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(3),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "tax_currency_code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: "This invoice includes a bulk discount." }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "note", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Override supplier details. If omitted, the authenticated user/business is used.",
        type: SimplePartyDto,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SimplePartyDto),
    __metadata("design:type", SimplePartyDto)
], CreateInvoiceDto.prototype, "supplier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: SimplePartyDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SimplePartyDto),
    __metadata("design:type", SimplePartyDto)
], CreateInvoiceDto.prototype, "customer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [SimpleInvoiceItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SimpleInvoiceItemDto),
    __metadata("design:type", Array)
], CreateInvoiceDto.prototype, "items", void 0);
//# sourceMappingURL=create-invoice.dto.js.map