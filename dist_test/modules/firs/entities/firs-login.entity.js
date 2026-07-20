"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirsLoginResponseEntity = void 0;
class FirsLoginResponseEntity {
    id;
    status;
    message;
    receivedAt;
    entityId;
    constructor(params) {
        this.id = params.id;
        this.status = params.status;
        this.message = params.message;
        this.receivedAt = params.received_at;
        this.entityId = params.entity_id;
    }
}
exports.FirsLoginResponseEntity = FirsLoginResponseEntity;
//# sourceMappingURL=firs-login.entity.js.map