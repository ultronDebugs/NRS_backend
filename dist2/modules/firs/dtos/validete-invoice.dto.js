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
exports.FirsValidateInvoiceDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class PostalAddressDto {
    street_name;
    city_name;
    postal_zone;
    country;
    lga;
    state;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PostalAddressDto.prototype, "street_name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PostalAddressDto.prototype, "city_name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PostalAddressDto.prototype, "postal_zone", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(2, 2),
    __metadata("design:type", String)
], PostalAddressDto.prototype, "country", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PostalAddressDto.prototype, "lga", void 0);
__decorate([
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
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PartyDto.prototype, "party_name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^[\d-]+$/, { message: 'TIN must contain only numbers and optional hyphens' }),
    __metadata("design:type", String)
], PartyDto.prototype, "tin", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PartyDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\+\d+$/, {
        message: "telephone must start with + and contain only digits",
    }),
    __metadata("design:type", String)
], PartyDto.prototype, "telephone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PartyDto.prototype, "business_description", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PostalAddressDto),
    __metadata("design:type", PostalAddressDto)
], PartyDto.prototype, "postal_address", void 0);
class DocumentReferenceDto {
    irn;
    issue_date;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DocumentReferenceDto.prototype, "irn", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DocumentReferenceDto.prototype, "issue_date", void 0);
class InvoiceDeliveryPeriodDto {
    start_date;
    end_date;
}
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InvoiceDeliveryPeriodDto.prototype, "start_date", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InvoiceDeliveryPeriodDto.prototype, "end_date", void 0);
class PaymentMeansDto {
    payment_means_code;
    payment_due_date;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PaymentMeansDto.prototype, "payment_means_code", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PaymentMeansDto.prototype, "payment_due_date", void 0);
class AllowanceChargeDto {
    charge_indicator;
    amount;
}
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Boolean)
], AllowanceChargeDto.prototype, "charge_indicator", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], AllowanceChargeDto.prototype, "amount", void 0);
class TaxCategoryDto {
    id;
    percent;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TaxCategoryDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], TaxCategoryDto.prototype, "percent", void 0);
class TaxSubtotalDto {
    taxable_amount;
    tax_amount;
    tax_category;
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], TaxSubtotalDto.prototype, "taxable_amount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], TaxSubtotalDto.prototype, "tax_amount", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => TaxCategoryDto),
    __metadata("design:type", TaxCategoryDto)
], TaxSubtotalDto.prototype, "tax_category", void 0);
class TaxTotalDto {
    tax_amount;
    tax_subtotal;
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], TaxTotalDto.prototype, "tax_amount", void 0);
__decorate([
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
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], LegalMonetaryTotalDto.prototype, "line_extension_amount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], LegalMonetaryTotalDto.prototype, "tax_exclusive_amount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], LegalMonetaryTotalDto.prototype, "tax_inclusive_amount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], LegalMonetaryTotalDto.prototype, "payable_amount", void 0);
class InvoiceItemDto {
    name;
    description;
    sellers_item_identification;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InvoiceItemDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InvoiceItemDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InvoiceItemDto.prototype, "sellers_item_identification", void 0);
class InvoiceLinePriceDto {
    price_amount;
    base_quantity;
    price_unit;
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], InvoiceLinePriceDto.prototype, "price_amount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], InvoiceLinePriceDto.prototype, "base_quantity", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(5),
    __metadata("design:type", String)
], InvoiceLinePriceDto.prototype, "price_unit", void 0);
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
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^\d{4,10}$/, { message: 'HSN code must be a numeric string between 4 and 10 digits' }),
    __metadata("design:type", String)
], InvoiceLineDto.prototype, "hsn_code", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InvoiceLineDto.prototype, "product_category", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], InvoiceLineDto.prototype, "discount_rate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], InvoiceLineDto.prototype, "discount_amount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], InvoiceLineDto.prototype, "fee_rate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], InvoiceLineDto.prototype, "fee_amount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], InvoiceLineDto.prototype, "invoiced_quantity", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], InvoiceLineDto.prototype, "line_extension_amount", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => InvoiceItemDto),
    __metadata("design:type", InvoiceItemDto)
], InvoiceLineDto.prototype, "item", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => InvoiceLinePriceDto),
    __metadata("design:type", InvoiceLinePriceDto)
], InvoiceLineDto.prototype, "price", void 0);
class FirsValidateInvoiceDto {
    invoice_kind;
    business_id;
    irn;
    issue_date;
    due_date;
    issue_time;
    invoice_type_code;
    payment_status = "PENDING";
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
    payee_party;
    tax_representative_party;
    actual_delivery_date;
    payment_means;
    payment_terms_note;
    allowance_charge;
    tax_total;
    legal_monetary_total;
    invoice_line;
}
exports.FirsValidateInvoiceDto = FirsValidateInvoiceDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(['B2B', 'B2C', 'B2G']),
    __metadata("design:type", String)
], FirsValidateInvoiceDto.prototype, "invoice_kind", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FirsValidateInvoiceDto.prototype, "business_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FirsValidateInvoiceDto.prototype, "irn", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FirsValidateInvoiceDto.prototype, "issue_date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], FirsValidateInvoiceDto.prototype, "due_date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{2}:\d{2}:\d{2}$/, {
        message: "issue_time must be in HH:mm:ss format",
    }),
    __metadata("design:type", String)
], FirsValidateInvoiceDto.prototype, "issue_time", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FirsValidateInvoiceDto.prototype, "invoice_type_code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FirsValidateInvoiceDto.prototype, "payment_status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FirsValidateInvoiceDto.prototype, "note", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], FirsValidateInvoiceDto.prototype, "tax_point_date", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FirsValidateInvoiceDto.prototype, "document_currency_code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FirsValidateInvoiceDto.prototype, "tax_currency_code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FirsValidateInvoiceDto.prototype, "accounting_cost", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FirsValidateInvoiceDto.prototype, "buyer_reference", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => InvoiceDeliveryPeriodDto),
    __metadata("design:type", InvoiceDeliveryPeriodDto)
], FirsValidateInvoiceDto.prototype, "invoice_delivery_period", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FirsValidateInvoiceDto.prototype, "order_reference", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DocumentReferenceDto),
    __metadata("design:type", Array)
], FirsValidateInvoiceDto.prototype, "billing_reference", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DocumentReferenceDto),
    __metadata("design:type", DocumentReferenceDto)
], FirsValidateInvoiceDto.prototype, "dispatch_document_reference", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DocumentReferenceDto),
    __metadata("design:type", DocumentReferenceDto)
], FirsValidateInvoiceDto.prototype, "receipt_document_reference", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DocumentReferenceDto),
    __metadata("design:type", DocumentReferenceDto)
], FirsValidateInvoiceDto.prototype, "originator_document_reference", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DocumentReferenceDto),
    __metadata("design:type", DocumentReferenceDto)
], FirsValidateInvoiceDto.prototype, "contract_document_reference", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DocumentReferenceDto),
    __metadata("design:type", Array)
], FirsValidateInvoiceDto.prototype, "_document_reference", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PartyDto),
    __metadata("design:type", PartyDto)
], FirsValidateInvoiceDto.prototype, "accounting_supplier_party", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PartyDto),
    __metadata("design:type", PartyDto)
], FirsValidateInvoiceDto.prototype, "accounting_customer_party", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PartyDto),
    __metadata("design:type", PartyDto)
], FirsValidateInvoiceDto.prototype, "payee_party", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PartyDto),
    __metadata("design:type", PartyDto)
], FirsValidateInvoiceDto.prototype, "tax_representative_party", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], FirsValidateInvoiceDto.prototype, "actual_delivery_date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PaymentMeansDto),
    __metadata("design:type", Array)
], FirsValidateInvoiceDto.prototype, "payment_means", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FirsValidateInvoiceDto.prototype, "payment_terms_note", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AllowanceChargeDto),
    __metadata("design:type", Array)
], FirsValidateInvoiceDto.prototype, "allowance_charge", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => TaxTotalDto),
    __metadata("design:type", Array)
], FirsValidateInvoiceDto.prototype, "tax_total", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => LegalMonetaryTotalDto),
    __metadata("design:type", LegalMonetaryTotalDto)
], FirsValidateInvoiceDto.prototype, "legal_monetary_total", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => InvoiceLineDto),
    __metadata("design:type", Array)
], FirsValidateInvoiceDto.prototype, "invoice_line", void 0);
//# sourceMappingURL=validete-invoice.dto.js.map