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
exports.RegisterUserDto = exports.DirectorDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class DirectorDto {
    firstName;
    lastName;
    email;
    phoneNumber;
    nin;
}
exports.DirectorDto = DirectorDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, swagger_1.ApiProperty)({
        description: "First name of the director",
        example: "John",
        required: true,
    }),
    __metadata("design:type", String)
], DirectorDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, swagger_1.ApiProperty)({
        description: "Last name of the director",
        example: "Doe",
        required: true,
    }),
    __metadata("design:type", String)
], DirectorDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, swagger_1.ApiProperty)({
        description: "Email address of the director",
        example: "john.doe@example.com",
        required: true,
    }),
    __metadata("design:type", String)
], DirectorDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, swagger_1.ApiProperty)({
        description: "Phone number of the director",
        example: "+2348012345678",
        required: true,
    }),
    __metadata("design:type", String)
], DirectorDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(11),
    (0, swagger_1.ApiProperty)({
        description: "National Identification Number of the director",
        example: "12345678901",
        required: true,
    }),
    __metadata("design:type", String)
], DirectorDto.prototype, "nin", void 0);
class RegisterUserDto {
    email;
    password;
    role;
}
exports.RegisterUserDto = RegisterUserDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, swagger_1.ApiProperty)({
        description: "The email address of the user",
        example: "user@example.com",
        required: true,
    }),
    __metadata("design:type", String)
], RegisterUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    (0, swagger_1.ApiProperty)({
        description: "The password of the user",
        example: "password123",
        required: true,
    }),
    __metadata("design:type", String)
], RegisterUserDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(["USER", "CLIENT"]),
    (0, swagger_1.ApiProperty)({
        description: "The role to assign during public registration",
        example: "CLIENT",
        required: false,
        enum: ["USER", "CLIENT"],
        default: "USER",
    }),
    __metadata("design:type", String)
], RegisterUserDto.prototype, "role", void 0);
//# sourceMappingURL=register-user.dto.js.map