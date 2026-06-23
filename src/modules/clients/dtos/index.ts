export { ValidateInvoiceDto } from "../../invoice/dtos/validate-invoice.dto";
export { ValidateIrnDto } from "../../invoice/dtos/validate-irn.dto";

export class ConfirmInvoiceParamsDto {
  irn: string;
}

export class PaginationQueryDto {
  page?: string;
  limit?: string;
}
