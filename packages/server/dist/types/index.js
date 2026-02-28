"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkItemTypeEnum = exports.ActivityLogType = exports.StatusEnum = void 0;
exports.StatusEnum = {
    PENDING: 'pending',
    DESIGN: 'design',
    DEVELOP: 'develop',
    TEST: 'test',
    DELIVERY: 'delivery',
    DONE: 'done'
};
exports.ActivityLogType = {
    CREATE: 'create',
    UPDATE: 'update',
    STATUS: 'status',
    COMMENT: 'comment',
    DELETE: 'delete',
    RESTORE: 'restore'
};
exports.WorkItemTypeEnum = {
    FEATURE: 'FEATURE',
    BUG: 'BUG',
    SUPPORT: 'SUPPORT'
};
