export declare class DirectorDto {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    nin: string;
}
export declare class RegisterUserDto {
    email: string;
    password: string;
    role?: "USER" | "CLIENT";
}
