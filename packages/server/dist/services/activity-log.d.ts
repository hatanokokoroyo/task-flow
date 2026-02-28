import { PrismaClient } from '@prisma/client';
interface GetActivityLogsOptions {
    date?: string;
    type?: string;
    workItemId?: number;
    order?: 'asc' | 'desc';
}
export declare function getActivityLogs(prisma: PrismaClient, options: GetActivityLogsOptions): Promise<({
    workItem: {
        id: number;
        title: string;
    };
} & {
    id: number;
    type: string;
    createdAt: Date;
    description: string;
    oldValue: string | null;
    newValue: string | null;
    workItemId: number;
})[]>;
export declare function getCalendarData(prisma: PrismaClient, year: number, month: number): Promise<Record<string, number>>;
export {};
//# sourceMappingURL=activity-log.d.ts.map