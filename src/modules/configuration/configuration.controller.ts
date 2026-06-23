import { Controller, Get } from "@nestjs/common";
import { ConfigurationService } from "./configuration.service";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Public } from "../../common/decorators";

@ApiTags("Configuration")
@Controller("api/v1/invoice/resources")
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

  @Get("invoice-types")
  @Public()
  @ApiOperation({ summary: "Get all invoice types" })
  @ApiResponse({
    status: 200,
    description: "List of invoice types retrieved successfully",
  })
  async getInvoiceTypes() {
    return this.configurationService.getInvoiceTypes();
  }

  @Get("payment_means")
  @Public()
  @ApiOperation({ summary: "Get all payment means" })
  @ApiResponse({
    status: 200,
    description: "List of payment means retrieved successfully",
  })
  async getPaymentMeans() {
    return this.configurationService.getPaymentMeans();
  }

  @Get("tax-categories")
  @Public()
  @ApiOperation({ summary: "Get all tax categories" })
  @ApiResponse({
    status: 200,
    description: "List of tax categories retrieved successfully",
  })
  async getTaxCategories() {
    return this.configurationService.getTaxCategories();
  }

  @Get("currencies")
  @Public()
  @ApiOperation({ summary: "Get all currencies" })
  @ApiResponse({
    status: 200,
    description: "List of currencies retrieved successfully",
  })
  async getCurrencies() {
    return this.configurationService.getCurrencies();
  }

  @Get("vat-exemptions")
  @Public()
  @ApiOperation({ summary: "Get all VAT exemptions" })
  @ApiResponse({
    status: 200,
    description: "List of VAT exemptions retrieved successfully",
  })
  async getVatExemptions() {
    return this.configurationService.getVatExemptions();
  }

  @Get("hs-codes")
  @Public()
  @ApiOperation({ summary: "Get all product codes (HS codes)" })
  @ApiResponse({
    status: 200,
    description: "List of product codes retrieved successfully",
  })
  async getProductCodes() {
    return this.configurationService.getProductCodes();
  }

  @Get("services-codes")
  @Public()
  @ApiOperation({ summary: "Get all service codes" })
  @ApiResponse({
    status: 200,
    description: "List of service codes retrieved successfully",
  })
  async getServiceCodes() {
    return this.configurationService.getServiceCodes();
  }

  @Get("lgas")
  @Public()
  @ApiOperation({ summary: "Get all local government areas" })
  @ApiResponse({
    status: 200,
    description: "List of local government areas retrieved successfully",
  })
  async getLocalGovernments() {
    return this.configurationService.getLocalGovernments();
  }

  @Get("states")
  @Public()
  @ApiOperation({ summary: "Get all state codes" })
  @ApiResponse({
    status: 200,
    description: "List of state codes retrieved successfully",
  })
  async getStateCodes() {
    return this.configurationService.getStateCodes();
  }

  @Get("admin/test")
  @ApiOperation({ summary: "Smoke test endpoint" })
  @ApiResponse({ status: 200, description: "Configuration service is working" })
  async smokeTest() {
    return {
      message: "Configuration service is working",
      timestamp: new Date().toISOString(),
    };
  }
}
