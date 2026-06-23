import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsDateString,
  IsOptional,
  IsArray,
  IsNumber,
  IsIn,
  MinLength,
  MaxLength,
  Matches,
  ValidateNested,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';




// Re-export all the nested DTOs from create-invoice.dto.ts

class UpdatePostalAddressDto {
  @ApiProperty({
    description: 'Street name',
    example: '123 Main Street',
  })
  @IsString()
  @IsNotEmpty()
  street_name: string;

  @ApiProperty({
    description: 'City name',
    example: 'Lagos',
  })
  @IsString()
  @IsNotEmpty()
  city_name: string;

  @ApiProperty({
    description: 'Postal zone',
    example: '100001',
  })
  @IsString()
  @IsNotEmpty()
  postal_zone: string;

  @ApiProperty({
    description: 'Country',
    example: 'Nigeria',
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

class UpdatePartyDto {
  @ApiProperty({
    description: 'Party name',
    example: 'Genius-Excel Digital Services Ltd',
  })
  @IsString()
  @IsNotEmpty()
  party_name: string;

  @ApiProperty({
    description: 'Tax Identification Number',
    example: '33779413-0001',
  })
  @IsString()
  @IsNotEmpty()
  tin: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john@example.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    description: 'Telephone number',
    example: '+2348012345678',
  })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional({
    description: 'Business description',
    example: 'Software Development Company',
  })
  @IsOptional()
  @IsString()
  business_description?: string;

  @ApiPropertyOptional({
    description: 'Postal address',
    type: UpdatePostalAddressDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePostalAddressDto)
  postal_address?: UpdatePostalAddressDto;
}


 class UpdateDocumentReferenceDto {
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
}

 class UpdateInvoiceDeliveryPeriodDto {
  @ApiProperty({
    description: 'Start date',
    example: '2024-05-14',
  })
  @IsDateString()
  start_date: string;

  @ApiProperty({
    description: 'End date',
    example: '2024-05-20',
  })
  @IsDateString()
  end_date: string;
}

 class UpdatePaymentMeansDto {
  @ApiProperty({
    description: 'Payment means code',
    example: '10',
  })
  @IsString()
  @IsNotEmpty()
  payment_means_code: string;

  @ApiProperty({
    description: 'Payment due date',
    example: '2024-06-14',
  })
  @IsDateString()
  payment_due_date: string;
}

 class UpdateAllowanceChargeDto {
  @ApiProperty({
    description: 'Charge indicator',
    example: true,
  })
  @IsNumber()
  charge_indicator: number;

  @ApiProperty({
    description: 'Amount',
    example: 100.00,
  })
  @IsNumber()
  @Min(0)
  amount: number;
}

 class UpdateTaxCategoryDto {
  @ApiProperty({
    description: 'Category ID',
    example: 'S',
  })
  @IsString()
  @IsNotEmpty()
  category_id: string;

  @ApiProperty({
    description: 'Percentage',
    example: 15.0,
  })
  @IsNumber()
  @Min(0)
  percent: number;
}

 class UpdateTaxSubtotalDto {
  @ApiProperty({
    description: 'Taxable amount',
    example: 1000.00,
  })
  @IsNumber()
  @Min(0)
  taxable_amount: number;

  @ApiProperty({
    description: 'Tax amount',
    example: 150.00,
  })
  @IsNumber()
  @Min(0)
  tax_amount: number;

  @ApiPropertyOptional({
    description: 'Tax category',
    type: UpdateTaxCategoryDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateTaxCategoryDto)
  tax_category?: UpdateTaxCategoryDto;
}

 class UpdateTaxTotalDto {
  @ApiProperty({
    description: 'Tax amount',
    example: 150.00,
  })
  @IsNumber()
  @Min(0)
  tax_amount: number;

  @ApiPropertyOptional({
    description: 'Tax subtotals',
    type: [UpdateTaxSubtotalDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTaxSubtotalDto)
  tax_subtotal?: UpdateTaxSubtotalDto[];
}

 class UpdateLegalMonetaryTotalDto {
  @ApiProperty({
    description: 'Line extension amount',
    example: 1000.00,
  })
  @IsNumber()
  @Min(0)
  line_extension_amount: number;

  @ApiProperty({
    description: 'Tax exclusive amount',
    example: 1000.00,
  })
  @IsNumber()
  @Min(0)
  tax_exclusive_amount: number;

  @ApiProperty({
    description: 'Tax inclusive amount',
    example: 1150.00,
  })
  @IsNumber()
  @Min(0)
  tax_inclusive_amount: number;

  @ApiProperty({
    description: 'Payable amount',
    example: 1150.00,
  })
  @IsNumber()
  @Min(0)
  payable_amount: number;
}

 class UpdateItemDto {
  @ApiProperty({
    description: 'Item name',
    example: 'Software License',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Item description',
    example: 'Annual software license subscription',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'Sellers item identification',
    example: 'SKU-001',
  })
  @IsOptional()
  @IsString()
  sellers_item_identification?: string;
}

 class UpdatePriceDto {
  @ApiProperty({
    description: 'Price amount',
    example: 100.00,
  })
  @IsNumber()
  @Min(0)
  price_amount: number;

  @ApiProperty({
    description: 'Base quantity',
    example: 1,
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
  price_unit: string;
}

class UpdateInvoiceLineDto {
  @ApiProperty({
    description: 'HSN code',
    example: '8523.80.20',
  })
  @IsString()
  @IsNotEmpty()
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
    type: UpdateItemDto,
  })
  @ValidateNested()
  @Type(() => UpdateItemDto)
  item: UpdateItemDto;

  @ApiProperty({
    description: 'Price details',
    type: UpdatePriceDto,
  })
  @ValidateNested()
  @Type(() => UpdatePriceDto)
  price: UpdatePriceDto;
}

export class UpdateInvoiceDto {
  @ApiPropertyOptional({
    description: 'Business ID',
    example: '{{TEST_BUSINESS_ID}}',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  business_id?: string;

  @ApiPropertyOptional({
    description: 'Invoice Reference Number',
    example: 'ITW20853450-6997D6BB-20240703',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  irn?: string;

  @ApiPropertyOptional({
    description: 'Issue date',
    example: '2024-05-14',
  })
  @IsOptional()
  @IsDateString()
  issue_date?: string;

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
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'Issue time must be in HH:MM:SS format',
  })
  issue_time?: string;

  @ApiPropertyOptional({
    description: 'Invoice type code',
    example: '396',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(10)
  invoice_type_code?: string;

  @ApiPropertyOptional({
    description: 'Invoice kind (B2B, B2C, B2G)',
    example: 'B2B',
    enum: ['B2B', 'B2C', 'B2G'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['B2B', 'B2C', 'B2G'])
  invoice_kind?: string;

  @ApiPropertyOptional({
    description: 'Payment status',
    example: 'PENDING',
    enum: ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'],
  })
  @IsOptional()
  @IsIn(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'])
  payment_status?: string;

  @ApiPropertyOptional({
    description: 'Note',
    example: 'dummy_note (will be encrypted in storage)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;

  @ApiPropertyOptional({
    description: 'Tax point date',
    example: '2024-05-14',
  })
  @IsOptional()
  @IsDateString()
  tax_point_date?: string;

  @ApiPropertyOptional({
    description: 'Document currency code',
    example: 'NGN',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  document_currency_code?: string;

  @ApiPropertyOptional({
    description: 'Tax currency code',
    example: 'NGN',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  tax_currency_code?: string;

  @ApiPropertyOptional({
    description: 'Accounting cost',
    example: 'Cost Center 001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  accounting_cost?: string;

  @ApiPropertyOptional({
    description: 'Buyer reference',
    example: 'BUYER-REF-001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  buyer_reference?: string;

  @ApiPropertyOptional({
    description: 'Order reference',
    example: 'ORDER-REF-001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  order_reference?: string;

  @ApiPropertyOptional({
    description: 'Invoice delivery period',
    type: UpdateInvoiceDeliveryPeriodDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateInvoiceDeliveryPeriodDto)
  invoice_delivery_period?: UpdateInvoiceDeliveryPeriodDto;

  @ApiPropertyOptional({
    description: 'Billing reference',
    type: UpdateDocumentReferenceDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateDocumentReferenceDto)
  billing_reference?: UpdateDocumentReferenceDto;

  @ApiPropertyOptional({
    description: 'Dispatch document reference',
    type: UpdateDocumentReferenceDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateDocumentReferenceDto)
  dispatch_document_reference?: UpdateDocumentReferenceDto;

  @ApiPropertyOptional({
    description: 'Receipt document reference',
    type: UpdateDocumentReferenceDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateDocumentReferenceDto)
  receipt_document_reference?: UpdateDocumentReferenceDto;

  @ApiPropertyOptional({
    description: 'Originator document reference',
    type: UpdateDocumentReferenceDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateDocumentReferenceDto)
  originator_document_reference?: UpdateDocumentReferenceDto;

  @ApiPropertyOptional({
    description: 'Contract document reference',
    type: UpdateDocumentReferenceDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateDocumentReferenceDto)
  contract_document_reference?: UpdateDocumentReferenceDto;

  @ApiPropertyOptional({
    description: 'Document references',
    type: [UpdateDocumentReferenceDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateDocumentReferenceDto)
  _document_reference?: UpdateDocumentReferenceDto[];

  @ApiPropertyOptional({
    description: 'Accounting supplier party',
    type: UpdatePartyDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePartyDto)
  accounting_supplier_party?: UpdatePartyDto;

  @ApiPropertyOptional({
    description: 'Accounting customer party',
    type: UpdatePartyDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePartyDto)
  accounting_customer_party?: UpdatePartyDto;

  @ApiPropertyOptional({
    description: 'Actual delivery date',
    example: '2024-05-14',
  })
  @IsOptional()
  @IsDateString()
  actual_delivery_date?: string;

  @ApiPropertyOptional({
    description: 'Payment means',
    type: [UpdatePaymentMeansDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePaymentMeansDto)
  payment_means?: UpdatePaymentMeansDto[];

  @ApiPropertyOptional({
    description: 'Payment terms note',
    example: 'dummy payment terms note (will be encrypted in storage)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  payment_terms_note?: string;

  @ApiPropertyOptional({
    description: 'Allowance charges',
    type: [UpdateAllowanceChargeDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAllowanceChargeDto)
  allowance_charge?: UpdateAllowanceChargeDto[];

  @ApiPropertyOptional({
    description: 'Tax totals',
    type: [UpdateTaxTotalDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTaxTotalDto)
  tax_total?: UpdateTaxTotalDto[];

  @ApiPropertyOptional({
    description: 'Legal monetary total',
    type: UpdateLegalMonetaryTotalDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateLegalMonetaryTotalDto)
  legal_monetary_total?: UpdateLegalMonetaryTotalDto;

  @ApiPropertyOptional({
    description: 'Invoice lines',
    type: [UpdateInvoiceLineDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateInvoiceLineDto)
  invoice_line?: UpdateInvoiceLineDto[];
}
