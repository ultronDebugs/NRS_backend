import { CreateUserDto } from "../../users/dtos/create-user.dto";
declare const RegisterDto_base: import("@nestjs/common").Type<Omit<CreateUserDto, "role">>;
export declare class RegisterDto extends RegisterDto_base {
}
export {};
