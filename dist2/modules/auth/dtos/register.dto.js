"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_user_dto_1 = require("../../users/dtos/create-user.dto");
class RegisterDto extends (0, swagger_1.OmitType)(create_user_dto_1.CreateUserDto, ['role']) {
}
exports.RegisterDto = RegisterDto;
//# sourceMappingURL=register.dto.js.map