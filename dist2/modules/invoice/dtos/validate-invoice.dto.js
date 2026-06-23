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
exports.ValidateInvoiceDto = exports.InvoiceLineDto = exports.PriceDto = exports.ItemDto = exports.LegalMonetaryTotalDto = exports.TaxTotalDto = exports.TaxSubtotalDto = exports.TaxCategoryDto = exports.AllowanceChargeDto = exports.PaymentMeansDto = exports.InvoiceDeliveryPeriodDto = exports.DocumentReferenceDto = exports.PartyDto = exports.PostalAddressDto = exports.BillingReferenceDto = exports.PaymentStatus = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["PAID"] = "PAID";
    PaymentStatus["REJECTED"] = "REJECTED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
class BillingReferenceDto {
    irn;
    issue_date;
}
exports.BillingReferenceDto = BillingReferenceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Invoice Reference Number',
        example: 'ITW001-E9E0C0D3-20240619',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], BillingReferenceDto.prototype, "irn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Issue date',
        example: '2024-05-14',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], BillingReferenceDto.prototype, "issue_date", void 0);
class PostalAddressDto {
    street_name;
    city_name;
    postal_zone;
    country;
    lga;
    state;
}
exports.PostalAddressDto = PostalAddressDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Street name',
        example: '32, owonikoko street',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PostalAddressDto.prototype, "street_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'City name',
        example: 'Gwarikpa',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PostalAddressDto.prototype, "city_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Postal zone',
        example: '023401',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PostalAddressDto.prototype, "postal_zone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Country code',
        example: 'NG',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PostalAddressDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Local Government Area',
        example: 'Ikeja',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PostalAddressDto.prototype, "lga", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'State',
        example: 'Lagos',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PostalAddressDto.prototype, "state", void 0);
class PartyDto {
    party_name;
    tin;
    email;
    telephone;
    business_description;
    postal_address;
}
exports.PartyDto = PartyDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Party name',
        example: 'Genius-Excel Digital Services Ltd',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PartyDto.prototype, "party_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tax Identification Number (TIN)',
        example: '33779413-0001',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^[\d-]+$/, { message: 'TIN must contain only numbers and optional hyphens' }),
    __metadata("design:type", String)
], PartyDto.prototype, "tin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email address',
        example: 'supplier_business@email.com',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PartyDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Telephone number (must start with +)',
        example: '+23480254099000',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PartyDto.prototype, "telephone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Business description',
        example: 'this entity is into sales of Cement and building materials',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PartyDto.prototype, "business_description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Postal address',
        type: PostalAddressDto,
    }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PostalAddressDto),
    __metadata("design:type", PostalAddressDto)
], PartyDto.prototype, "postal_address", void 0);
class DocumentReferenceDto {
    irn;
    issue_date;
}
exports.DocumentReferenceDto = DocumentReferenceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Invoice Reference Number',
        example: 'ITW001-E9E0C0D3-20240619',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DocumentReferenceDto.prototype, "irn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Issue date',
        example: '2024-05-14',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], DocumentReferenceDto.prototype, "issue_date", void 0);
class InvoiceDeliveryPeriodDto {
    start_date;
    end_date;
}
exports.InvoiceDeliveryPeriodDto = InvoiceDeliveryPeriodDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Start date',
        example: '2024-06-14',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], InvoiceDeliveryPeriodDto.prototype, "start_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'End date',
        example: '2024-06-16',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], InvoiceDeliveryPeriodDto.prototype, "end_date", void 0);
class PaymentMeansDto {
    payment_means_code;
    payment_due_date;
}
exports.PaymentMeansDto = PaymentMeansDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment means code',
        example: '10',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PaymentMeansDto.prototype, "payment_means_code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment due date',
        example: '2024-05-14',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], PaymentMeansDto.prototype, "payment_due_date", void 0);
class AllowanceChargeDto {
    charge_indicator;
    amount;
}
exports.AllowanceChargeDto = AllowanceChargeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Indicates whether the amount is a charge (true) or an allowance (false)',
        example: true,
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AllowanceChargeDto.prototype, "charge_indicator", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Amount',
        example: 800.60,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], AllowanceChargeDto.prototype, "amount", void 0);
class TaxCategoryDto {
    id;
    percent;
}
exports.TaxCategoryDto = TaxCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tax category ID',
        example: 'LOCAL_SALES_TAX',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TaxCategoryDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tax percentage',
        example: 2.3,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], TaxCategoryDto.prototype, "percent", void 0);
class TaxSubtotalDto {
    taxable_amount;
    tax_amount;
    tax_category;
}
exports.TaxSubtotalDto = TaxSubtotalDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Taxable amount',
        example: 800,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], TaxSubtotalDto.prototype, "taxable_amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tax amount',
        example: 8,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], TaxSubtotalDto.prototype, "tax_amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tax category',
        type: TaxCategoryDto,
    }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => TaxCategoryDto),
    __metadata("design:type", TaxCategoryDto)
], TaxSubtotalDto.prototype, "tax_category", void 0);
class TaxTotalDto {
    tax_amount;
    tax_subtotal;
}
exports.TaxTotalDto = TaxTotalDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tax amount',
        example: 56.07,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], TaxTotalDto.prototype, "tax_amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tax subtotals',
        type: [TaxSubtotalDto],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => TaxSubtotalDto),
    __metadata("design:type", Array)
], TaxTotalDto.prototype, "tax_subtotal", void 0);
class LegalMonetaryTotalDto {
    line_extension_amount;
    tax_exclusive_amount;
    tax_inclusive_amount;
    payable_amount;
}
exports.LegalMonetaryTotalDto = LegalMonetaryTotalDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Line extension amount',
        example: 340.50,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LegalMonetaryTotalDto.prototype, "line_extension_amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tax exclusive amount',
        example: 400,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LegalMonetaryTotalDto.prototype, "tax_exclusive_amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tax inclusive amount',
        example: 430,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LegalMonetaryTotalDto.prototype, "tax_inclusive_amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payable amount',
        example: 30,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], LegalMonetaryTotalDto.prototype, "payable_amount", void 0);
class ItemDto {
    name;
    description;
    sellers_item_identification;
}
exports.ItemDto = ItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Item name',
        example: 'item name',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ItemDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Item description',
        example: 'item description',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ItemDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sellers item identification',
        example: 'identified as spoon by the seller',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ItemDto.prototype, "sellers_item_identification", void 0);
class PriceDto {
    price_amount;
    base_quantity;
    price_unit;
}
exports.PriceDto = PriceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Price amount',
        example: 10,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PriceDto.prototype, "price_amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Base quantity',
        example: 3,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PriceDto.prototype, "base_quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Price unit',
        example: 'EA',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", String)
], PriceDto.prototype, "price_unit", void 0);
class InvoiceLineDto {
    hsn_code;
    product_category;
    discount_rate;
    discount_amount;
    fee_rate;
    fee_amount;
    invoiced_quantity;
    line_extension_amount;
    item;
    price;
}
exports.InvoiceLineDto = InvoiceLineDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'HSN code',
        example: '8523.80.20',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^[\d\.]{4,15}$/, { message: 'HSN code must be a numeric/dotted string between 4 and 15 characters' }),
    __metadata("design:type", String)
], InvoiceLineDto.prototype, "hsn_code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Product category',
        example: 'Food and Beverages',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InvoiceLineDto.prototype, "product_category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Discount rate',
        example: 2.01,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], InvoiceLineDto.prototype, "discount_rate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Discount amount',
        example: 3500,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], InvoiceLineDto.prototype, "discount_amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Fee rate',
        example: 1.01,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], InvoiceLineDto.prototype, "fee_rate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Fee amount',
        example: 50,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], InvoiceLineDto.prototype, "fee_amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Invoiced quantity',
        example: 15,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], InvoiceLineDto.prototype, "invoiced_quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Line extension amount',
        example: 30,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], InvoiceLineDto.prototype, "line_extension_amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Item details',
        type: ItemDto,
    }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ItemDto),
    __metadata("design:type", ItemDto)
], InvoiceLineDto.prototype, "item", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Price details',
        type: PriceDto,
    }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PriceDto),
    __metadata("design:type", PriceDto)
], InvoiceLineDto.prototype, "price", void 0);
class ValidateInvoiceDto {
    invoice_kind;
    business_id;
    irn;
    issue_date;
    due_date;
    issue_time;
    invoice_type_code;
    payment_status = PaymentStatus.PENDING;
    note;
    tax_point_date;
    document_currency_code;
    tax_currency_code;
    accounting_cost;
    buyer_reference;
    invoice_delivery_period;
    order_reference;
    billing_reference;
    dispatch_document_reference;
    receipt_document_reference;
    originator_document_reference;
    contract_document_reference;
    _document_reference;
    accounting_supplier_party;
    accounting_customer_party;
    actual_delivery_date;
    payment_means;
    payment_terms_note;
    allowance_charge;
    tax_total;
    legal_monetary_total;
    invoice_line;
}
exports.ValidateInvoiceDto = ValidateInvoiceDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Invoice kind (B2B, B2C, B2G)',
        example: 'B2B',
        enum: ['B2B', 'B2C', 'B2G']
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(['B2B', 'B2C', 'B2G']),
    __metadata("design:type", String)
], ValidateInvoiceDto.prototype, "invoice_kind", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Business ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ValidateInvoiceDto.prototype, "business_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Invoice Reference Number',
        example: 'ITW20853450-6997D6BB-20240703',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ValidateInvoiceDto.prototype, "irn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Issue date',
        example: '2024-05-14',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ValidateInvoiceDto.prototype, "issue_date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Due date',
        example: '2024-06-14',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ValidateInvoiceDto.prototype, "due_date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Issue time',
        example: '17:59:04',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ValidateInvoiceDto.prototype, "issue_time", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Invoice type code',
        example: '396',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ValidateInvoiceDto.prototype, "invoice_type_code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Payment status',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(PaymentStatus),
    __metadata("design:type", String)
], ValidateInvoiceDto.prototype, "payment_status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Note (will be encrypted in storage)',
        example: 'dummy_note (will be encryted in storage)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ValidateInvoiceDto.prototype, "note", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tax point date',
        example: '2024-05-14',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ValidateInvoiceDto.prototype, "tax_point_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Document currency code',
        example: 'NGN',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ValidateInvoiceDto.prototype, "document_currency_code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tax currency code',
        example: 'NGN',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ValidateInvoiceDto.prototype, "tax_currency_code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Accounting cost',
        example: '2000',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ValidateInvoiceDto.prototype, "accounting_cost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Buyer reference',
        example: 'buyer REF IRN?',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ValidateInvoiceDto.prototype, "buyer_reference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Invoice delivery period',
        type: InvoiceDeliveryPeriodDto,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => InvoiceDeliveryPeriodDto),
    __metadata("design:type", InvoiceDeliveryPeriodDto)
], ValidateInvoiceDto.prototype, "invoice_delivery_period", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Order reference',
        example: 'order REF IRN?',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ValidateInvoiceDto.prototype, "order_reference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Billing reference',
        type: [DocumentReferenceDto],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DocumentReferenceDto),
    __metadata("design:type", Array)
], ValidateInvoiceDto.prototype, "billing_reference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Dispatch document reference',
        type: DocumentReferenceDto,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DocumentReferenceDto),
    __metadata("design:type", DocumentReferenceDto)
], ValidateInvoiceDto.prototype, "dispatch_document_reference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Receipt document reference',
        type: DocumentReferenceDto,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DocumentReferenceDto),
    __metadata("design:type", DocumentReferenceDto)
], ValidateInvoiceDto.prototype, "receipt_document_reference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Originator document reference',
        type: DocumentReferenceDto,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DocumentReferenceDto),
    __metadata("design:type", DocumentReferenceDto)
], ValidateInvoiceDto.prototype, "originator_document_reference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Contract document reference',
        type: DocumentReferenceDto,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DocumentReferenceDto),
    __metadata("design:type", DocumentReferenceDto)
], ValidateInvoiceDto.prototype, "contract_document_reference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Document reference',
        type: [DocumentReferenceDto],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DocumentReferenceDto),
    __metadata("design:type", Array)
], ValidateInvoiceDto.prototype, "_document_reference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Accounting supplier party',
        type: PartyDto,
    }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PartyDto),
    __metadata("design:type", PartyDto)
], ValidateInvoiceDto.prototype, "accounting_supplier_party", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Accounting customer party',
        type: PartyDto,
    }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PartyDto),
    __metadata("design:type", PartyDto)
], ValidateInvoiceDto.prototype, "accounting_customer_party", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Actual delivery date',
        example: '2024-05-14',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ValidateInvoiceDto.prototype, "actual_delivery_date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Payment means',
        type: [PaymentMeansDto],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PaymentMeansDto),
    __metadata("design:type", Array)
], ValidateInvoiceDto.prototype, "payment_means", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Payment terms note (will be encrypted in storage)',
        example: 'dummy payment terms note (will be encryted in storage)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ValidateInvoiceDto.prototype, "payment_terms_note", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Allowance charge',
        type: [AllowanceChargeDto],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AllowanceChargeDto),
    __metadata("design:type", Array)
], ValidateInvoiceDto.prototype, "allowance_charge", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tax total',
        type: [TaxTotalDto],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => TaxTotalDto),
    __metadata("design:type", Array)
], ValidateInvoiceDto.prototype, "tax_total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Legal monetary total',
        type: LegalMonetaryTotalDto,
    }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => LegalMonetaryTotalDto),
    __metadata("design:type", LegalMonetaryTotalDto)
], ValidateInvoiceDto.prototype, "legal_monetary_total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Invoice lines',
        type: [InvoiceLineDto],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => InvoiceLineDto),
    __metadata("design:type", Array)
], ValidateInvoiceDto.prototype, "invoice_line", void 0);
//# sourceMappingURL=validate-invoice.dto.js.map