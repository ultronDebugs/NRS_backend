"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationQueryDto = exports.ConfirmInvoiceParamsDto = exports.ValidateIrnDto = exports.ValidateInvoiceDto = void 0;
var validate_invoice_dto_1 = require("../../invoice/dtos/validate-invoice.dto");
Object.defineProperty(exports, "ValidateInvoiceDto", { enumerable: true, get: function () { return validate_invoice_dto_1.ValidateInvoiceDto; } });
var validate_irn_dto_1 = require("../../invoice/dtos/validate-irn.dto");
Object.defineProperty(exports, "ValidateIrnDto", { enumerable: true, get: function () { return validate_irn_dto_1.ValidateIrnDto; } });
class ConfirmInvoiceParamsDto {
    irn;
}
exports.ConfirmInvoiceParamsDto = ConfirmInvoiceParamsDto;
class PaginationQueryDto {
    page;
    limit;
}
exports.PaginationQueryDto = PaginationQueryDto;
//# sourceMappingURL=index.js.map