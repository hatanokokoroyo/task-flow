"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComment = createComment;
exports.updateComment = updateComment;
exports.deleteComment = deleteComment;
exports.getCommentsByWorkItemId = getCommentsByWorkItemId;
const index_js_1 = require("../types/index.js");
async function createComment(prisma, workItemId, content) {
    const comment = await prisma.comment.create({
        data: {
            content,
            workItemId
        }
    });
    // 获取工作项标题用于日志
    const workItem = await prisma.workItem.findUnique({
        where: { id: workItemId },
        select: { title: true }
    });
    await prisma.activityLog.create({
        data: {
            type: index_js_1.ActivityLogType.COMMENT,
            description: `添加评论：${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
            workItemId
        }
    });
    return comment;
}
async function updateComment(prisma, id, content) {
    return prisma.comment.update({
        where: { id },
        data: { content }
    });
}
async function deleteComment(prisma, id) {
    return prisma.comment.delete({ where: { id } });
}
async function getCommentsByWorkItemId(prisma, workItemId) {
    return prisma.comment.findMany({
        where: { workItemId },
        orderBy: { createdAt: 'desc' }
    });
}
