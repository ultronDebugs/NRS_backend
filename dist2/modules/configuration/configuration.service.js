"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const database_1 = require("../../database");
const axios_1 = require("axios");
let ConfigurationService = class ConfigurationService {
    configService;
    prisma;
    firsApiUrl;
    firsApiKey;
    firsApiSecret;
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        const firsApiUrl = this.configService.get("FIRS_API_URL");
        const firsApiKey = this.configService.get("FIRS_API_KEY");
        const firsApiSecret = this.configService.get("FIRS_API_SECRET");
        if (!firsApiUrl || !firsApiKey || !firsApiSecret) {
            throw new Error("FIRS API credentials are not set in environment variables");
        }
        this.firsApiUrl = firsApiUrl;
        this.firsApiKey = firsApiKey;
        this.firsApiSecret = firsApiSecret;
    }
    async makeFirsApiRequest(endpoint) {
        try {
            console.log(`${this.firsApiUrl}/api/v1/invoice/resources${endpoint}`);
            const response = await axios_1.default.get(`${this.firsApiUrl}/api/v1/invoice/resources${endpoint}`, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.firsApiKey,
                    "x-api-secret": this.firsApiSecret,
                },
            });
            return response.data.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                throw new common_1.HttpException(`Failed to fetch data from FIRS API: ${error.message}`, error.response?.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            throw new common_1.HttpException("Failed to fetch data from FIRS API", common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getCachedOrFetch(modelName, firsEndpoint, transformToDb, transformFromDb) {
        const cachedData = await this.prisma[modelName].findMany();
        if (cachedData && cachedData.length > 0) {
            return cachedData.map(transformFromDb);
        }
        const firsData = await this.makeFirsApiRequest(firsEndpoint);
        console.log(firsData);
        const dbData = firsData.map(transformToDb);
        await this.prisma[modelName].createMany({
            data: dbData,
            skipDuplicates: true,
        });
        return firsData;
    }
    async getInvoiceTypes() {
        return this.getCachedOrFetch("configurationInvoiceType", "/invoice-types", (item) => ({
            value: item.value,
            code: item.code,
        }), (item) => ({
            value: item.value,
            code: item.code,
        }));
    }
    async getPaymentMeans() {
        return this.getCachedOrFetch("configurationPaymentMean", "/payment-means", (item) => ({
            value: item.value,
            code: item.code,
        }), (item) => ({
            value: item.value,
            code: item.code,
        }));
    }
    async getTaxCategories() {
        return this.getCachedOrFetch("configurationTaxCategory", "/tax-categories", (item) => ({
            value: item.value,
            code: item.code,
        }), (item) => ({
            value: item.value,
            code: item.code,
        }));
    }
    async getCurrencies() {
        return this.getCachedOrFetch("configurationCurrency", "/currencies", (item) => ({
            code: item.code,
            name: item.name,
            symbol: item.symbol,
            symbol_native: item.symbol_native,
            decimal_digits: item.decimal_digits,
            rounding: item.rounding,
            name_plural: item.name_plural,
        }), (item) => ({
            code: item.code,
            name: item.name,
            symbol: item.symbol,
            symbol_native: item.symbol_native,
            decimal_digits: item.decimal_digits,
            rounding: item.rounding,
            name_plural: item.name_plural,
        }));
    }
    async getVatExemptions() {
        return this.getCachedOrFetch("configurationVatExemption", "/vat-exemptions", (item) => ({
            harmonized_system_code: item.harmonized_system_code,
            heading_no: item.heading_no,
            tariff_category: item.tariff_category,
            tariff: item.tariff,
            description: item.description,
        }), (item) => ({
            harmonized_system_code: item.harmonized_system_code,
            heading_no: item.heading_no,
            tariff_category: item.tariff_category,
            tariff: item.tariff,
            description: item.description,
        }));
    }
    async getProductCodes() {
        return this.getCachedOrFetch("configurationProductCode", "/hs-codes", (item) => ({
            hscode: item.hscode,
            description: item.description,
        }), (item) => ({
            hscode: item.hscode,
            description: item.description,
        }));
    }
    async getServiceCodes() {
        return this.getCachedOrFetch("configurationServiceCode", "/services-codes", (item) => ({
            code: item.code,
            description: item.description,
        }), (item) => ({
            code: item.code,
            description: item.description,
        }));
    }
    async getLocalGovernments() {
        return this.getCachedOrFetch("configurationLocalGovernment", "/lgas", (item) => ({
            code: item.code,
            name: item.name,
            state_code: item.state_code,
        }), (item) => ({
            code: item.code,
            name: item.name,
            state_code: item.state_code,
        }));
    }
    async getStateCodes() {
        return this.getCachedOrFetch("configurationState", "/states", (item) => ({
            code: item.code,
            name: item.name,
        }), (item) => ({
            code: item.code,
            name: item.name,
        }));
    }
};
exports.ConfigurationService = ConfigurationService;
exports.ConfigurationService = ConfigurationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        database_1.PrismaService])
], ConfigurationService);
//# sourceMappingURL=configuration.service.js.map