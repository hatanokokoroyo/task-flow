"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const response_js_1 = require("../utils/response.js");
const router = (0, express_1.Router)();
// 获取回收站列表
router.get('/', async (req, res, next) => {
    try {
        const items = await req.prisma.workItem.findMany({
            where: {
                deletedAt: { not: null },
                parentId: null // 只获取顶级工作项
            },
            orderBy: { deletedAt: 'desc' }
        });
        // 计算过期时间（7天后）
        const itemsWithExpiry = items.map((item) => {
            const deletedAt = item.deletedAt;
            const expiresAt = new Date(deletedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
            return {
                ...item,
                expiresAt: expiresAt.toISOString()
            };
        });
        (0, response_js_1.success)(res, itemsWithExpiry);
    }
    catch (err) {
        next(err);
    }
});
// 清空回收站
router.delete('/', async (req, res, next) => {
    try {
        await req.prisma.workItem.deleteMany({
            where: {
                deletedAt: { not: null }
            }
        });
        (0, response_js_1.success)(res, null, '回收站已清空');
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
