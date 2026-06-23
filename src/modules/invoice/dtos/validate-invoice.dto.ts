import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsNumber, 
  IsBoolean, 
  IsArray, 
  ValidateNested, 
  IsDateString,
  IsEnum,
  ArrayMinSize,
  MinLength,
  MaxLength,
  Min,
  Max,
  Matches
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REJECTED = 'REJECTED'
}

export class BillingReferenceDto {
  @ApiProperty({
    description: 'Invoice Reference Number',
    example: 'ITW001-E9E0C0D3-20240619',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  irn: string;

  @ApiProperty({
    description: 'Issue date',
    example: '2024-05-14',
  })
  @IsDateString()
  issue_date: string;
}

export class PostalAddressDto {
  @ApiProperty({
    description: 'Street name',
    example: '32, owonikoko street',
  })
  @IsString()
  @IsNotEmpty()
  street_name: string;

  @ApiProperty({
    description: 'City name',
    example: 'Gwarikpa',
  })
  @IsString()
  @IsNotEmpty()
  city_name: string;

  @ApiProperty({
    description: 'Postal zone',
    example: '023401',
  })
  @IsString()
  @IsNotEmpty()
  postal_zone: string;

  @ApiProperty({
    description: 'Country code',
    example: 'NG',
  })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({
    description: 'Local Government Area',
    example: 'Ikeja',
  })
  @IsString()
  @IsNotEmpty()
  lga: string;

  @ApiProperty({
    description: 'State',
    example: 'Lagos',
  })
  @IsString()
  @IsNotEmpty()
  state: string;
}

export class PartyDto {
  @ApiProperty({
    description: 'Party name',
    example: 'Genius-Excel Digital Services Ltd',
  })
  @IsString()
  @IsNotEmpty()
  party_name: string;

  @ApiProperty({
    description: 'Tax Identification Number (TIN)',
    example: '33779413-0001',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[\d-]+$/, { message: 'TIN must contain only numbers and optional hyphens' })
  tin: string;

  @ApiProperty({
    description: 'Email address',
    example: 'supplier_business@email.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    description: 'Telephone number (must start with +)',
    example: '+23480254099000',
  })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional({
    description: 'Business description',
    example: 'this entity is into sales of Cement and building materials',
  })
  @IsOptional()
  @IsString()
  business_description?: string;

  @ApiProperty({
    description: 'Postal address',
    type: PostalAddressDto,
  })
  @ValidateNested()
  @Type(() => PostalAddressDto)
  postal_address: PostalAddressDto;
}

export class DocumentReferenceDto {
  @ApiProperty({
    description: 'Invoice Reference Number',
    example: 'ITW001-E9E0C0D3-20240619',
  })
  @IsString()
  @IsNotEmpty()
  irn: string;

  @ApiProperty({
    description: 'Issue date',
    example: '2024-05-14',
  })
  @IsDateString()
  issue_date: string;
}

export class InvoiceDeliveryPeriodDto {
  @ApiProperty({
    description: 'Start date',
    example: '2024-06-14',
  })
  @IsDateString()
  start_date: string;

  @ApiProperty({
    description: 'End date',
    example: '2024-06-16',
  })
  @IsDateString()
  end_date: string;
}

export class PaymentMeansDto {
  @ApiProperty({
    description: 'Payment means code',
    example: '10',
  })
  @IsString()
  @IsNotEmpty()
  payment_means_code: string;

  @ApiProperty({
    description: 'Payment due date',
    example: '2024-05-14',
  })
  @IsDateString()
  payment_due_date: string;
}

export class AllowanceChargeDto {
  @ApiProperty({
    description: 'Indicates whether the amount is a charge (true) or an allowance (false)',
    example: true,
  })
  @IsBoolean()
  charge_indicator: boolean;

  @ApiProperty({
    description: 'Amount',
    example: 800.60,
  })
  @IsNumber()
  @Min(0)
  amount: number;
}

export class TaxCategoryDto {
  @ApiProperty({
    description: 'Tax category ID',
    example: 'LOCAL_SALES_TAX',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Tax percentage',
    example: 2.3,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  percent: number;
}

export class TaxSubtotalDto {
  @ApiProperty({
    description: 'Taxable amount',
    example: 800,
  })
  @IsNumber()
  @Min(0)
  taxable_amount: number;

  @ApiProperty({
    description: 'Tax amount',
    example: 8,
  })
  @IsNumber()
  @Min(0)
  tax_amount: number;

  @ApiProperty({
    description: 'Tax category',
    type: TaxCategoryDto,
  })
  @ValidateNested()
  @Type(() => TaxCategoryDto)
  tax_category: TaxCategoryDto;
}

export class TaxTotalDto {
  @ApiProperty({
    description: 'Tax amount',
    example: 56.07,
  })
  @IsNumber()
  @Min(0)
  tax_amount: number;

  @ApiProperty({
    description: 'Tax subtotals',
    type: [TaxSubtotalDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxSubtotalDto)
  tax_subtotal: TaxSubtotalDto[];
}

export class LegalMonetaryTotalDto {
  @ApiProperty({
    description: 'Line extension amount',
    example: 340.50,
  })
  @IsNumber()
  @Min(0)
  line_extension_amount: number;

  @ApiProperty({
    description: 'Tax exclusive amount',
    example: 400,
  })
  @IsNumber()
  @Min(0)
  tax_exclusive_amount: number;

  @ApiProperty({
    description: 'Tax inclusive amount',
    example: 430,
  })
  @IsNumber()
  @Min(0)
  tax_inclusive_amount: number;

  @ApiProperty({
    description: 'Payable amount',
    example: 30,
  })
  @IsNumber()
  @Min(0)
  payable_amount: number;
}

export class ItemDto {
  @ApiProperty({
    description: 'Item name',
    example: 'item name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Item description',
    example: 'item description',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'Sellers item identification',
    example: 'identified as spoon by the seller',
  })
  @IsOptional()
  @IsString()
  sellers_item_identification?: string;
}

export class PriceDto {
  @ApiProperty({
    description: 'Price amount',
    example: 10,
  })
  @IsNumber()
  @Min(0)
  price_amount: number;

  @ApiProperty({
    description: 'Base quantity',
    example: 3,
  })
  @IsNumber()
  @Min(0)
  base_quantity: number;

  @ApiProperty({
    description: 'Price unit',
    example: 'EA',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(10)
  price_unit: string;
}

export class InvoiceLineDto {
  @ApiProperty({
    description: 'HSN code',
    example: '8523.80.20',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[\d\.]{4,15}$/, { message: 'HSN code must be a numeric/dotted string between 4 and 15 characters' })
  hsn_code: string;

  @ApiProperty({
    description: 'Product category',
    example: 'Food and Beverages',
  })
  @IsString()
  @IsNotEmpty()
  product_category: string;

  @ApiProperty({
    description: 'Discount rate',
    example: 2.01,
  })
  @IsNumber()
  @Min(0)
  discount_rate: number;

  @ApiProperty({
    description: 'Discount amount',
    example: 3500,
  })
  @IsNumber()
  @Min(0)
  discount_amount: number;

  @ApiProperty({
    description: 'Fee rate',
    example: 1.01,
  })
  @IsNumber()
  @Min(0)
  fee_rate: number;

  @ApiProperty({
    description: 'Fee amount',
    example: 50,
  })
  @IsNumber()
  @Min(0)
  fee_amount: number;

  @ApiProperty({
    description: 'Invoiced quantity',
    example: 15,
  })
  @IsNumber()
  @Min(0)
  invoiced_quantity: number;

  @ApiProperty({
    description: 'Line extension amount',
    example: 30,
  })
  @IsNumber()
  @Min(0)
  line_extension_amount: number;

  @ApiProperty({
    description: 'Item details',
    type: ItemDto,
  })
  @ValidateNested()
  @Type(() => ItemDto)
  item: ItemDto;

  @ApiProperty({
    description: 'Price details',
    type: PriceDto,
  })
  @ValidateNested()
  @Type(() => PriceDto)
  price: PriceDto;
}

export class ValidateInvoiceDto {
  @ApiProperty({
    description: 'Invoice kind (B2B, B2C, B2G)',
    example: 'B2B',
    enum: ['B2B', 'B2C', 'B2G']
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['B2B', 'B2C', 'B2G'])
  invoice_kind: string;

  @ApiProperty({
    description: 'Business ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  business_id: string;

  @ApiProperty({
    description: 'Invoice Reference Number',
    example: 'ITW20853450-6997D6BB-20240703',
  })
  @IsString()
  @IsNotEmpty()
  irn: string;

  @ApiProperty({
    description: 'Issue date',
    example: '2024-05-14',
  })
  @IsDateString()
  issue_date: string;

  @ApiPropertyOptional({
    description: 'Due date',
    example: '2024-06-14',
  })
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @ApiPropertyOptional({
    description: 'Issue time',
    example: '17:59:04',
  })
  @IsOptional()
  @IsString()
  issue_time?: string;

  @ApiProperty({
    description: 'Invoice type code',
    example: '396',
  })
  @IsString()
  @IsNotEmpty()
  invoice_type_code: string;

  @ApiPropertyOptional({
    description: 'Payment status',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  payment_status?: PaymentStatus = PaymentStatus.PENDING;

  @ApiPropertyOptional({
    description: 'Note (will be encrypted in storage)',
    example: 'dummy_note (will be encryted in storage)',
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    description: 'Tax point date',
    example: '2024-05-14',
  })
  @IsOptional()
  @IsDateString()
  tax_point_date?: string;

  @ApiProperty({
    description: 'Document currency code',
    example: 'NGN',
  })
  @IsString()
  @IsNotEmpty()
  document_currency_code: string;

  @ApiPropertyOptional({
    description: 'Tax currency code',
    example: 'NGN',
  })
  @IsOptional()
  @IsString()
  tax_currency_code?: string;

  @ApiPropertyOptional({
    description: 'Accounting cost',
    example: '2000',
  })
  @IsOptional()
  @IsString()
  accounting_cost?: string;

  @ApiPropertyOptional({
    description: 'Buyer reference',
    example: 'buyer REF IRN?',
  })
  @IsOptional()
  @IsString()
  buyer_reference?: string;

  @ApiPropertyOptional({
    description: 'Invoice delivery period',
    type: InvoiceDeliveryPeriodDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => InvoiceDeliveryPeriodDto)
  invoice_delivery_period?: InvoiceDeliveryPeriodDto;

  @ApiPropertyOptional({
    description: 'Order reference',
    example: 'order REF IRN?',
  })
  @IsOptional()
  @IsString()
  order_reference?: string;

  @ApiPropertyOptional({
    description: 'Billing reference',
    type: [DocumentReferenceDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentReferenceDto)
  billing_reference?: DocumentReferenceDto[];

  @ApiPropertyOptional({
    description: 'Dispatch document reference',
    type: DocumentReferenceDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DocumentReferenceDto)
  dispatch_document_reference?: DocumentReferenceDto;

  @ApiPropertyOptional({
    description: 'Receipt document reference',
    type: DocumentReferenceDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DocumentReferenceDto)
  receipt_document_reference?: DocumentReferenceDto;

  @ApiPropertyOptional({
    description: 'Originator document reference',
    type: DocumentReferenceDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DocumentReferenceDto)
  originator_document_reference?: DocumentReferenceDto;

  @ApiPropertyOptional({
    description: 'Contract document reference',
    type: DocumentReferenceDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DocumentReferenceDto)
  contract_document_reference?: DocumentReferenceDto;

  @ApiPropertyOptional({
    description: 'Document reference',
    type: [DocumentReferenceDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentReferenceDto)
  _document_reference?: DocumentReferenceDto[];

  @ApiProperty({
    description: 'Accounting supplier party',
    type: PartyDto,
  })
  @ValidateNested()
  @Type(() => PartyDto)
  accounting_supplier_party: PartyDto;

  @ApiProperty({
    description: 'Accounting customer party',
    type: PartyDto,
  })
  @ValidateNested()
  @Type(() => PartyDto)
  accounting_customer_party: PartyDto;

  @ApiPropertyOptional({
    description: 'Actual delivery date',
    example: '2024-05-14',
  })
  @IsOptional()
  @IsDateString()
  actual_delivery_date?: string;

  @ApiPropertyOptional({
    description: 'Payment means',
    type: [PaymentMeansDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentMeansDto)
  payment_means?: PaymentMeansDto[];

  @ApiPropertyOptional({
    description: 'Payment terms note (will be encrypted in storage)',
    example: 'dummy payment terms note (will be encryted in storage)',
  })
  @IsOptional()
  @IsString()
  payment_terms_note?: string;

  @ApiPropertyOptional({
    description: 'Allowance charge',
    type: [AllowanceChargeDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AllowanceChargeDto)
  allowance_charge?: AllowanceChargeDto[];

  @ApiPropertyOptional({
    description: 'Tax total',
    type: [TaxTotalDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxTotalDto)
  tax_total?: TaxTotalDto[];

  @ApiProperty({
    description: 'Legal monetary total',
    type: LegalMonetaryTotalDto,
  })
  @ValidateNested()
  @Type(() => LegalMonetaryTotalDto)
  legal_monetary_total: LegalMonetaryTotalDto;

  @ApiProperty({
    description: 'Invoice lines',
    type: [InvoiceLineDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineDto)
  invoice_line: InvoiceLineDto[];
} 