import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Matches,
  MaxLength,
  ValidateNested,
  ValidateIf,
  IsEnum,
  MinLength,
} from "class-validator";
import { Type } from "class-transformer";

/**
 * Address details for a party.
 */
class PostalAddressDto {
  @IsString()
  @IsNotEmpty()
  readonly street_name: string;

  @IsString()
  @IsNotEmpty()
  readonly city_name: string;

  @IsString()
  @IsNotEmpty()
  readonly postal_zone: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  readonly country: string;

  @IsString()
  @IsNotEmpty()
  readonly lga: string;

  @IsString()
  @IsNotEmpty()
  readonly state: string;
}

/**
 * Party details (supplier, customer, payee, etc).
 */
class PartyDto {
  @IsString()
  @IsNotEmpty()
  readonly party_name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[\d-]+$/, { message: 'TIN must contain only numbers and optional hyphens' })
  readonly tin: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+\d+$/, {
    message: "telephone must start with + and contain only digits",
  })
  readonly telephone?: string;

  @IsOptional()
  @IsString()
  readonly business_description?: string;

  @ValidateNested()
  @Type(() => PostalAddressDto)
  readonly postal_address: PostalAddressDto;
}

/**
 * Document reference with IRN and issue date.
 */
class DocumentReferenceDto {
  @IsString()
  @IsNotEmpty()
  readonly irn: string;

  @IsDateString()
  @IsNotEmpty()
  readonly issue_date: string;
}

/**
 * Invoice delivery period.
 */
class InvoiceDeliveryPeriodDto {
  @IsDateString()
  @IsNotEmpty()
  readonly start_date: string;

  @IsDateString()
  @IsNotEmpty()
  readonly end_date: string;
}

/**
 * Payment means details.
 */
class PaymentMeansDto {
  @IsString()
  @IsNotEmpty()
  readonly payment_means_code: string;

  @IsDateString()
  @IsNotEmpty()
  readonly payment_due_date: string;
}

/**
 * Allowance or charge details.
 */
class AllowanceChargeDto {
  @IsBoolean()
  @IsNotEmpty()
  readonly charge_indicator: boolean;

  @IsNumber()
  @IsNotEmpty()
  readonly amount: number;
}

/**
 * Tax category details.
 */
class TaxCategoryDto {
  @IsString()
  @IsNotEmpty()
  readonly id: string;

  @IsNumber()
  @IsNotEmpty()
  readonly percent: number;
}

/**
 * Tax subtotal details.
 */
class TaxSubtotalDto {
  @IsNumber()
  @IsNotEmpty()
  readonly taxable_amount: number;

  @IsNumber()
  @IsNotEmpty()
  readonly tax_amount: number;

  @ValidateNested()
  @Type(() => TaxCategoryDto)
  readonly tax_category: TaxCategoryDto;
}

/**
 * Tax total details.
 */
class TaxTotalDto {
  @IsNumber()
  @IsNotEmpty()
  readonly tax_amount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxSubtotalDto)
  readonly tax_subtotal: TaxSubtotalDto[];
}

/**
 * Legal monetary total details.
 */
class LegalMonetaryTotalDto {
  @IsNumber()
  @IsNotEmpty()
  readonly line_extension_amount: number;

  @IsNumber()
  @IsNotEmpty()
  readonly tax_exclusive_amount: number;

  @IsNumber()
  @IsNotEmpty()
  readonly tax_inclusive_amount: number;

  @IsNumber()
  @IsNotEmpty()
  readonly payable_amount: number;
}

/**
 * Item details for invoice line.
 */
class InvoiceItemDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly description: string;

  @IsOptional()
  @IsString()
  readonly sellers_item_identification?: string;
}

/**
 * Price details for invoice line.
 */
class InvoiceLinePriceDto {
  @IsNumber()
  @IsNotEmpty()
  readonly price_amount: number;

  @IsNumber()
  @IsNotEmpty()
  readonly base_quantity: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(5)
  readonly price_unit: string;
}

/**
 * Invoice line details.
 */
class InvoiceLineDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4,10}$/, { message: 'HSN code must be a numeric string between 4 and 10 digits' })
  readonly hsn_code: string;

  @IsString()
  @IsNotEmpty()
  readonly product_category: string;

  @IsNumber()
  @IsNotEmpty()
  readonly discount_rate: number;

  @IsNumber()
  @IsNotEmpty()
  readonly discount_amount: number;

  @IsNumber()
  @IsNotEmpty()
  readonly fee_rate: number;

  @IsNumber()
  @IsNotEmpty()
  readonly fee_amount: number;

  @IsNumber()
  @IsNotEmpty()
  readonly invoiced_quantity: number;

  @IsNumber()
  @IsNotEmpty()
  readonly line_extension_amount: number;

  @ValidateNested()
  @Type(() => InvoiceItemDto)
  readonly item: InvoiceItemDto;

  @ValidateNested()
  @Type(() => InvoiceLinePriceDto)
  readonly price: InvoiceLinePriceDto;
}

/**
 * Data Transfer Object for validating an invoice.
 */
export class FirsValidateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(['B2B', 'B2C', 'B2G'])
  readonly invoice_kind: string;

  @IsString()
  @IsNotEmpty()
  readonly business_id: string;

  @IsString()
  @IsNotEmpty()
  readonly irn: string;

  @IsDateString()
  @IsNotEmpty()
  readonly issue_date: string;

  @IsOptional()
  @IsDateString()
  readonly due_date?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}:\d{2}$/, {
    message: "issue_time must be in HH:mm:ss format",
  })
  readonly issue_time?: string;

  @IsString()
  @IsNotEmpty()
  readonly invoice_type_code: string;

  @IsOptional()
  @IsString()
  readonly payment_status?: string = "PENDING";

  @IsOptional()
  @IsString()
  readonly note?: string;

  @IsOptional()
  @IsDateString()
  readonly tax_point_date?: string;

  @IsString()
  @IsNotEmpty()
  readonly document_currency_code: string;

  @IsOptional()
  @IsString()
  readonly tax_currency_code?: string;

  @IsOptional()
  @IsString()
  readonly accounting_cost?: string;

  @IsOptional()
  @IsString()
  readonly buyer_reference?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => InvoiceDeliveryPeriodDto)
  readonly invoice_delivery_period?: InvoiceDeliveryPeriodDto;

  @IsOptional()
  @IsString()
  readonly order_reference?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentReferenceDto)
  readonly billing_reference?: DocumentReferenceDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => DocumentReferenceDto)
  readonly dispatch_document_reference?: DocumentReferenceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DocumentReferenceDto)
  readonly receipt_document_reference?: DocumentReferenceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DocumentReferenceDto)
  readonly originator_document_reference?: DocumentReferenceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DocumentReferenceDto)
  readonly contract_document_reference?: DocumentReferenceDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentReferenceDto)
  readonly _document_reference?: DocumentReferenceDto[];

  @ValidateNested()
  @Type(() => PartyDto)
  readonly accounting_supplier_party: PartyDto;

  @ValidateNested()
  @Type(() => PartyDto)
  readonly accounting_customer_party: PartyDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PartyDto)
  readonly payee_party?: PartyDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PartyDto)
  readonly tax_representative_party?: PartyDto;

  @IsOptional()
  @IsDateString()
  readonly actual_delivery_date?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentMeansDto)
  readonly payment_means?: PaymentMeansDto[];

  @IsOptional()
  @IsString()
  readonly payment_terms_note?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AllowanceChargeDto)
  readonly allowance_charge?: AllowanceChargeDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxTotalDto)
  readonly tax_total?: TaxTotalDto[];

  @ValidateNested()
  @Type(() => LegalMonetaryTotalDto)
  readonly legal_monetary_total: LegalMonetaryTotalDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineDto)
  readonly invoice_line: InvoiceLineDto[];
}
