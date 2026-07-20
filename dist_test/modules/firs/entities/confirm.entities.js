"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmEntity = void 0;
class ConfirmEntity {
    issueDate;
    dueDate;
    syncDate;
    paymentStatus;
    transmitted;
    delivered;
    constructor(params) {
        this.issueDate = params.issueDate;
        this.dueDate = params.dueDate;
        this.syncDate = params.syncDate;
        this.paymentStatus = params.paymentStatus;
        this.transmitted = params.transmitted;
        this.delivered = params.delivered;
    }
}
exports.ConfirmEntity = ConfirmEntity;
//# sourceMappingURL=confirm.entities.js.map