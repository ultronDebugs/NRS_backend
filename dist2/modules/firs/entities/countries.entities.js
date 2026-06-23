"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountryEntity = void 0;
class CountryEntity {
    name;
    alpha2;
    alpha3;
    countryCode;
    iso31662;
    region;
    subRegion;
    intermediateRegion;
    regionCode;
    subRegionCode;
    intermediateRegionCode;
    constructor(params) {
        this.name = params.name;
        this.alpha2 = params.alpha2;
        this.alpha3 = params.alpha3;
        this.countryCode = params.countryCode;
        this.iso31662 = params.iso31662;
        this.region = params.region;
        this.subRegion = params.subRegion;
        this.intermediateRegion = params.intermediateRegion;
        this.regionCode = params.regionCode;
        this.subRegionCode = params.subRegionCode;
        this.intermediateRegionCode = params.intermediateRegionCode;
    }
}
exports.CountryEntity = CountryEntity;
//# sourceMappingURL=countries.entities.js.map