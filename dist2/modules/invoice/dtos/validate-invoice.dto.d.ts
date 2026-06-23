export declare enum PaymentStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    REJECTED = "REJECTED"
}
export declare class BillingReferenceDto {
    irn: string;
    issue_date: string;
}
export declare class PostalAddressDto {
    street_name: string;
    city_name: string;
    postal_zone: string;
    country: string;
    lga: string;
    state: string;
}
export declare class PartyDto {
    party_name: string;
    tin: string;
    email: string;
    telephone?: string;
    business_description?: string;
    postal_address: PostalAddressDto;
}
export declare class DocumentReferenceDto {
    irn: string;
    issue_date: string;
}
export declare class InvoiceDeliveryPeriodDto {
    start_date: string;
    end_date: string;
}
export declare class PaymentMeansDto {
    payment_means_code: string;
    payment_due_date: string;
}
export declare class AllowanceChargeDto {
    charge_indicator: boolean;
    amount: number;
}
export declare class TaxCategoryDto {
    id: string;
    percent: number;
}
export declare class TaxSubtotalDto {
    taxable_amount: number;
    tax_amount: number;
    tax_category: TaxCategoryDto;
}
export declare class TaxTotalDto {
    tax_amount: number;
    tax_subtotal: TaxSubtotalDto[];
}
export declare class LegalMonetaryTotalDto {
    line_extension_amount: number;
    tax_exclusive_amount: number;
    tax_inclusive_amount: number;
    payable_amount: number;
}
export declare class ItemDto {
    name: string;
    description: string;
    sellers_item_identification?: string;
}
export declare class PriceDto {
    price_amount: number;
    base_quantity: number;
    price_unit: string;
}
export declare class InvoiceLineDto {
    hsn_code: string;
    product_category: string;
    discount_rate: number;
    discount_amount: number;
    fee_rate: number;
    fee_amount: number;
    invoiced_quantity: number;
    line_extension_amount: number;
    item: ItemDto;
    price: PriceDto;
}
export declare class ValidateInvoiceDto {
    invoice_kind: string;
    business_id: string;
    irn: string;
    issue_date: string;
    due_date?: string;
    issue_time?: string;
    invoice_type_code: string;
    payment_status?: PaymentStatus;
    note?: string;
    tax_point_date?: string;
    document_currency_code: string;
    tax_currency_code?: string;
    accounting_cost?: string;
    buyer_reference?: string;
    invoice_delivery_period?: InvoiceDeliveryPeriodDto;
    order_reference?: string;
    billing_reference?: DocumentReferenceDto[];
    dispatch_document_reference?: DocumentReferenceDto;
    receipt_document_reference?: DocumentReferenceDto;
    originator_document_reference?: DocumentReferenceDto;
    contract_document_reference?: DocumentReferenceDto;
    _document_reference?: DocumentReferenceDto[];
    accounting_supplier_party: PartyDto;
    accounting_customer_party: PartyDto;
    actual_delivery_date?: string;
    payment_means?: PaymentMeansDto[];
    payment_terms_note?: string;
    allowance_charge?: AllowanceChargeDto[];
    tax_total?: TaxTotalDto[];
    legal_monetary_total: LegalMonetaryTotalDto;
    invoice_line: InvoiceLineDto[];
}
