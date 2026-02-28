import { PrismaClient } from '@prisma/client';
export declare function createComment(prisma: PrismaClient, workItemId: number, content: string): Promise<{
    updatedAt: Date;
    id: number;
    content: string;
    createdAt: Date;
    workItemId: number;
}>;
export declare function updateComment(prisma: PrismaClient, id: number, content: string): Promise<{
    updatedAt: Date;
    id: number;
    content: string;
    createdAt: Date;
    workItemId: number;
}>;
export declare function deleteComment(prisma: PrismaClient, id: number): Promise<{
    updatedAt: Date;
    id: number;
    content: string;
    createdAt: Date;
    workItemId: number;
}>;
export declare function getCommentsByWorkItemId(prisma: PrismaClient, workItemId: number): Promise<{
    updatedAt: Date;
    id: number;
    content: string;
    createdAt: Date;
    workItemId: number;
}[]>;
//# sourceMappingURL=comment.d.ts.map