import { PrismaClient } from '@prisma/client';
declare global {
    namespace Express {
        interface Request {
            prisma: PrismaClient;
        }
    }
}
export interface ApiResponse<T = any> {
    code: number;
    data?: T;
    message: string;
}
export declare const StatusEnum: {
    readonly PENDING: "pending";
    readonly DESIGN: "design";
    readonly DEVELOP: "develop";
    readonly TEST: "test";
    readonly DELIVERY: "delivery";
    readonly DONE: "done";
};
export type Status = typeof StatusEnum[keyof typeof StatusEnum];
export declare const ActivityLogType: {
    readonly CREATE: "create";
    readonly UPDATE: "update";
    readonly STATUS: "status";
    readonly COMMENT: "comment";
    readonly DELETE: "delete";
    readonly RESTORE: "restore";
};
export type ActivityType = typeof ActivityLogType[keyof typeof ActivityLogType];
export declare const WorkItemTypeEnum: {
    readonly FEATURE: "FEATURE";
    readonly BUG: "BUG";
    readonly SUPPORT: "SUPPORT";
};
export type WorkItemType = typeof WorkItemTypeEnum[keyof typeof WorkItemTypeEnum];
//# sourceMappingURL=index.d.ts.map