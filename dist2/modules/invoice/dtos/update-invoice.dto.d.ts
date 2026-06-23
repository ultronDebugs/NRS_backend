declare class UpdatePostalAddressDto {
    street_name: string;
    city_name: string;
    postal_zone: string;
    country: string;
    lga: string;
    state: string;
}
declare class UpdatePartyDto {
    party_name: string;
    tin: string;
    email: string;
    telephone?: string;
    business_description?: string;
    postal_address?: UpdatePostalAddressDto;
}
declare class UpdateDocumentReferenceDto {
    irn: string;
    issue_date: string;
}
declare class UpdateInvoiceDeliveryPeriodDto {
    start_date: string;
    end_date: string;
}
declare class UpdatePaymentMeansDto {
    payment_means_code: string;
    payment_due_date: string;
}
declare class UpdateAllowanceChargeDto {
    charge_indicator: number;
    amount: number;
}
declare class UpdateTaxCategoryDto {
    category_id: string;
    percent: number;
}
declare class UpdateTaxSubtotalDto {
    taxable_amount: number;
    tax_amount: number;
    tax_category?: UpdateTaxCategoryDto;
}
declare class UpdateTaxTotalDto {
    tax_amount: number;
    tax_subtotal?: UpdateTaxSubtotalDto[];
}
declare class UpdateLegalMonetaryTotalDto {
    line_extension_amount: number;
    tax_exclusive_amount: number;
    tax_inclusive_amount: number;
    payable_amount: number;
}
declare class UpdateItemDto {
    name: string;
    description: string;
    sellers_item_identification?: string;
}
declare class UpdatePriceDto {
    price_amount: number;
    base_quantity: number;
    price_unit: string;
}
declare class UpdateInvoiceLineDto {
    hsn_code: string;
    product_category: string;
    discount_rate: number;
    discount_amount: number;
    fee_rate: number;
    fee_amount: number;
    invoiced_quantity: number;
    line_extension_amount: number;
    item: UpdateItemDto;
    price: UpdatePriceDto;
}
export declare class UpdateInvoiceDto {
    business_id?: string;
    irn?: string;
    issue_date?: string;
    due_date?: string;
    issue_time?: string;
    invoice_type_code?: string;
    invoice_kind?: string;
    payment_status?: string;
    note?: string;
    tax_point_date?: string;
    document_currency_code?: string;
    tax_currency_code?: string;
    accounting_cost?: string;
    buyer_reference?: string;
    order_reference?: string;
    invoice_delivery_period?: UpdateInvoiceDeliveryPeriodDto;
    billing_reference?: UpdateDocumentReferenceDto;
    dispatch_document_reference?: UpdateDocumentReferenceDto;
    receipt_document_reference?: UpdateDocumentReferenceDto;
    originator_document_reference?: UpdateDocumentReferenceDto;
    contract_document_reference?: UpdateDocumentReferenceDto;
    _document_reference?: UpdateDocumentReferenceDto[];
    accounting_supplier_party?: UpdatePartyDto;
    accounting_customer_party?: UpdatePartyDto;
    actual_delivery_date?: string;
    payment_means?: UpdatePaymentMeansDto[];
    payment_terms_note?: string;
    allowance_charge?: UpdateAllowanceChargeDto[];
    tax_total?: UpdateTaxTotalDto[];
    legal_monetary_total?: UpdateLegalMonetaryTotalDto;
    invoice_line?: UpdateInvoiceLineDto[];
}
export {};
