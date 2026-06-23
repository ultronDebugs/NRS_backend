export declare class ConfirmEntity {
    readonly issueDate: string;
    readonly dueDate: string;
    readonly syncDate: string;
    readonly paymentStatus: string;
    readonly transmitted: boolean;
    readonly delivered: boolean;
    constructor(params: {
        issueDate: string;
        dueDate: string;
        syncDate: string;
        paymentStatus: string;
        transmitted: boolean;
        delivered: boolean;
    });
}
