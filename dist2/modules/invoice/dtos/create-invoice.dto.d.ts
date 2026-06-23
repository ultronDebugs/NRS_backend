declare class SimplePostalAddressDto {
    street_name: string;
    city_name: string;
    postal_zone: string;
    country?: string;
    lga: string;
    state: string;
}
declare class SimplePartyDto {
    party_name: string;
    tin: string;
    email: string;
    telephone?: string;
    business_description?: string;
    postal_address: SimplePostalAddressDto;
}
declare class SimpleInvoiceItemDto {
    name: string;
    description?: string;
    quantity: number;
    unit_price: number;
    hsn_code?: string;
    product_category?: string;
    isic_code?: string;
    service_category?: string;
    tax_category?: string;
    tax_rate?: number;
    discount_amount?: number;
    fee_amount?: number;
    price_unit?: string;
}
export declare class CreateInvoiceDto {
    business_id?: string;
    irn: string;
    issue_date?: string;
    due_date?: string;
    issue_time?: string;
    invoice_type_code?: string;
    invoice_kind?: string;
    payment_status?: string;
    document_currency_code?: string;
    tax_currency_code?: string;
    note?: string;
    supplier?: SimplePartyDto;
    customer: SimplePartyDto;
    items: SimpleInvoiceItemDto[];
}
export {};
