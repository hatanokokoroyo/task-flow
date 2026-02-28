import { PrismaClient } from '@prisma/client';
interface GetWorkItemsOptions {
    status?: string;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    includeDeleted?: boolean;
}
export declare function getWorkItems(prisma: PrismaClient, options: GetWorkItemsOptions): Promise<any[]>;
export declare function getWorkItemById(prisma: PrismaClient, id: number): Promise<({
    children: ({
        children: ({
            children: {
                status: string;
                updatedAt: Date;
                id: number;
                project: string | null;
                tag: string | null;
                type: string | null;
                title: string;
                content: string | null;
                startTime: Date | null;
                endTime: Date | null;
                createdAt: Date;
                deletedAt: Date | null;
                parentId: number | null;
            }[];
        } & {
            status: string;
            updatedAt: Date;
            id: number;
            project: string | null;
            tag: string | null;
            type: string | null;
            title: string;
            content: string | null;
            startTime: Date | null;
            endTime: Date | null;
            createdAt: Date;
            deletedAt: Date | null;
            parentId: number | null;
        })[];
    } & {
        status: string;
        updatedAt: Date;
        id: number;
        project: string | null;
        tag: string | null;
        type: string | null;
        title: string;
        content: string | null;
        startTime: Date | null;
        endTime: Date | null;
        createdAt: Date;
        deletedAt: Date | null;
        parentId: number | null;
    })[];
    comments: {
        updatedAt: Date;
        id: number;
        content: string;
        createdAt: Date;
        workItemId: number;
    }[];
    _count: {
        children: number;
        comments: number;
    };
} & {
    status: string;
    updatedAt: Date;
    id: number;
    project: string | null;
    tag: string | null;
    type: string | null;
    title: string;
    content: string | null;
    startTime: Date | null;
    endTime: Date | null;
    createdAt: Date;
    deletedAt: Date | null;
    parentId: number | null;
}) | null>;
export declare function createWorkItem(prisma: PrismaClient, data: {
    title: string;
    content?: string;
    status?: string;
    startTime?: string;
    endTime?: string;
    parentId?: number;
    project?: string | null;
    tag?: string | null;
    type?: 'FEATURE' | 'BUG' | 'SUPPORT';
}): Promise<{
    status: string;
    updatedAt: Date;
    id: number;
    project: string | null;
    tag: string | null;
    type: string | null;
    title: string;
    content: string | null;
    startTime: Date | null;
    endTime: Date | null;
    createdAt: Date;
    deletedAt: Date | null;
    parentId: number | null;
}>;
export declare function updateWorkItem(prisma: PrismaClient, id: number, data: {
    title?: string;
    content?: string;
    status?: string;
    startTime?: string;
    endTime?: string;
    project?: string | null;
    tag?: string | null;
    type?: 'FEATURE' | 'BUG' | 'SUPPORT' | undefined;
}): Promise<{
    status: string;
    updatedAt: Date;
    id: number;
    project: string | null;
    tag: string | null;
    type: string | null;
    title: string;
    content: string | null;
    startTime: Date | null;
    endTime: Date | null;
    createdAt: Date;
    deletedAt: Date | null;
    parentId: number | null;
}>;
export declare function softDeleteWorkItem(prisma: PrismaClient, id: number): Promise<{
    status: string;
    updatedAt: Date;
    id: number;
    project: string | null;
    tag: string | null;
    type: string | null;
    title: string;
    content: string | null;
    startTime: Date | null;
    endTime: Date | null;
    createdAt: Date;
    deletedAt: Date | null;
    parentId: number | null;
}>;
export declare function restoreWorkItem(prisma: PrismaClient, id: number): Promise<{
    status: string;
    updatedAt: Date;
    id: number;
    project: string | null;
    tag: string | null;
    type: string | null;
    title: string;
    content: string | null;
    startTime: Date | null;
    endTime: Date | null;
    createdAt: Date;
    deletedAt: Date | null;
    parentId: number | null;
}>;
export declare function permanentDeleteWorkItem(prisma: PrismaClient, id: number): Promise<{
    status: string;
    updatedAt: Date;
    id: number;
    project: string | null;
    tag: string | null;
    type: string | null;
    title: string;
    content: string | null;
    startTime: Date | null;
    endTime: Date | null;
    createdAt: Date;
    deletedAt: Date | null;
    parentId: number | null;
}>;
export {};
//# sourceMappingURL=work-item.d.ts.map