declare class PostalAddressDto {
    readonly street_name: string;
    readonly city_name: string;
    readonly postal_zone: string;
    readonly country: string;
    readonly lga: string;
    readonly state: string;
}
declare class PartyDto {
    readonly party_name: string;
    readonly tin: string;
    readonly email: string;
    readonly telephone?: string;
    readonly business_description?: string;
    readonly postal_address: PostalAddressDto;
}
declare class DocumentReferenceDto {
    readonly irn: string;
    readonly issue_date: string;
}
declare class InvoiceDeliveryPeriodDto {
    readonly start_date: string;
    readonly end_date: string;
}
declare class PaymentMeansDto {
    readonly payment_means_code: string;
    readonly payment_due_date: string;
}
declare class AllowanceChargeDto {
    readonly charge_indicator: boolean;
    readonly amount: number;
}
declare class TaxCategoryDto {
    readonly id: string;
    readonly percent: number;
}
declare class TaxSubtotalDto {
    readonly taxable_amount: number;
    readonly tax_amount: number;
    readonly tax_category: TaxCategoryDto;
}
declare class TaxTotalDto {
    readonly tax_amount: number;
    readonly tax_subtotal: TaxSubtotalDto[];
}
declare class LegalMonetaryTotalDto {
    readonly line_extension_amount: number;
    readonly tax_exclusive_amount: number;
    readonly tax_inclusive_amount: number;
    readonly payable_amount: number;
}
declare class InvoiceItemDto {
    readonly name: string;
    readonly description: string;
    readonly sellers_item_identification?: string;
}
declare class InvoiceLinePriceDto {
    readonly price_amount: number;
    readonly base_quantity: number;
    readonly price_unit: string;
}
declare class InvoiceLineDto {
    readonly hsn_code: string;
    readonly product_category: string;
    readonly discount_rate: number;
    readonly discount_amount: number;
    readonly fee_rate: number;
    readonly fee_amount: number;
    readonly invoiced_quantity: number;
    readonly line_extension_amount: number;
    readonly item: InvoiceItemDto;
    readonly price: InvoiceLinePriceDto;
}
export declare class FirsValidateInvoiceDto {
    readonly invoice_kind: string;
    readonly business_id: string;
    readonly irn: string;
    readonly issue_date: string;
    readonly due_date?: string;
    readonly issue_time?: string;
    readonly invoice_type_code: string;
    readonly payment_status?: string;
    readonly note?: string;
    readonly tax_point_date?: string;
    readonly document_currency_code: string;
    readonly tax_currency_code?: string;
    readonly accounting_cost?: string;
    readonly buyer_reference?: string;
    readonly invoice_delivery_period?: InvoiceDeliveryPeriodDto;
    readonly order_reference?: string;
    readonly billing_reference?: DocumentReferenceDto[];
    readonly dispatch_document_reference?: DocumentReferenceDto;
    readonly receipt_document_reference?: DocumentReferenceDto;
    readonly originator_document_reference?: DocumentReferenceDto;
    readonly contract_document_reference?: DocumentReferenceDto;
    readonly _document_reference?: DocumentReferenceDto[];
    readonly accounting_supplier_party: PartyDto;
    readonly accounting_customer_party: PartyDto;
    readonly payee_party?: PartyDto;
    readonly tax_representative_party?: PartyDto;
    readonly actual_delivery_date?: string;
    readonly payment_means?: PaymentMeansDto[];
    readonly payment_terms_note?: string;
    readonly allowance_charge?: AllowanceChargeDto[];
    readonly tax_total?: TaxTotalDto[];
    readonly legal_monetary_total: LegalMonetaryTotalDto;
    readonly invoice_line: InvoiceLineDto[];
}
export {};
