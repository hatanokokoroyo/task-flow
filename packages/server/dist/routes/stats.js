"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const response_js_1 = require("../utils/response.js");
const router = (0, express_1.Router)();
// 获取工作项统计
router.get('/', async (req, res, next) => {
    try {
        const [total, pending, design, develop, test, delivery, done, recycled] = await Promise.all([
            req.prisma.workItem.count({ where: { deletedAt: null, parentId: null } }),
            req.prisma.workItem.count({ where: { deletedAt: null, parentId: null, status: 'pending' } }),
            req.prisma.workItem.count({ where: { deletedAt: null, parentId: null, status: 'design' } }),
            req.prisma.workItem.count({ where: { deletedAt: null, parentId: null, status: 'develop' } }),
            req.prisma.workItem.count({ where: { deletedAt: null, parentId: null, status: 'test' } }),
            req.prisma.workItem.count({ where: { deletedAt: null, parentId: null, status: 'delivery' } }),
            req.prisma.workItem.count({ where: { deletedAt: null, parentId: null, status: 'done' } }),
            req.prisma.workItem.count({ where: { deletedAt: { not: null }, parentId: null } })
        ]);
        (0, response_js_1.success)(res, {
            total,
            pending,
            inProgress: design + develop + test + delivery,
            done,
            recycled
        });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
