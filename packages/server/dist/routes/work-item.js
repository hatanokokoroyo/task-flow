"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const response_js_1 = require("../utils/response.js");
const workItemService = __importStar(require("../services/work-item.js"));
const router = (0, express_1.Router)();
// 获取工作项列表
router.get('/', async (req, res, next) => {
    try {
        const { status, search, sort = 'updatedAt', order = 'desc' } = req.query;
        const items = await workItemService.getWorkItems(req.prisma, {
            status: status,
            search: search,
            sort: sort,
            order: order
        });
        (0, response_js_1.success)(res, items);
    }
    catch (err) {
        next(err);
    }
});
// 获取工作项详情
router.get('/:id', async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return (0, response_js_1.error)(res, '无效的工作项ID', 400, 400);
        }
        const item = await workItemService.getWorkItemById(req.prisma, id);
        if (!item) {
            return (0, response_js_1.error)(res, '工作项不存在', 404, 404);
        }
        (0, response_js_1.success)(res, item);
    }
    catch (err) {
        next(err);
    }
});
// 创建工作项
const createSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, '标题不能为空').max(200, '标题最多200字符'),
    content: zod_1.z.string().max(5000, '内容最多5000字符').optional(),
    project: zod_1.z.string().max(64).optional(),
    tag: zod_1.z.string().max(64).optional(),
    type: zod_1.z.enum(['FEATURE', 'BUG', 'SUPPORT']).optional(),
    status: zod_1.z.enum(['pending', 'design', 'develop', 'test', 'delivery', 'done']).default('pending'),
    startTime: zod_1.z.string().datetime().optional(),
    endTime: zod_1.z.string().datetime().optional(),
    parentId: zod_1.z.number().optional()
});
router.post('/', async (req, res, next) => {
    try {
        const data = createSchema.parse(req.body);
        const item = await workItemService.createWorkItem(req.prisma, data);
        (0, response_js_1.success)(res, item, '创建成功');
    }
    catch (err) {
        next(err);
    }
});
// 更新工作项
const updateSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, '标题不能为空').max(200, '标题最多200字符').optional(),
    content: zod_1.z.string().max(5000, '内容最多5000字符').optional(),
    project: zod_1.z.string().max(64).optional().nullable(),
    tag: zod_1.z.string().max(64).optional().nullable(),
    type: zod_1.z.enum(['FEATURE', 'BUG', 'SUPPORT']).optional().nullable(),
    status: zod_1.z.enum(['pending', 'design', 'develop', 'test', 'delivery', 'done']).optional(),
    startTime: zod_1.z.string().datetime().optional().nullable(),
    endTime: zod_1.z.string().datetime().optional().nullable()
});
router.put('/:id', async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return (0, response_js_1.error)(res, '无效的工作项ID', 400, 400);
        }
        const data = updateSchema.parse(req.body);
        const item = await workItemService.updateWorkItem(req.prisma, id, {
            ...data,
            startTime: data.startTime ?? undefined,
            endTime: data.endTime ?? undefined,
            project: data.project === null ? null : data.project ?? undefined,
            tag: data.tag === null ? null : data.tag ?? undefined,
            type: data.type === null ? undefined : data.type ?? undefined
        });
        (0, response_js_1.success)(res, item, '更新成功');
    }
    catch (err) {
        next(err);
    }
});
// 删除工作项（软删除）
router.delete('/:id', async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return (0, response_js_1.error)(res, '无效的工作项ID', 400, 400);
        }
        await workItemService.softDeleteWorkItem(req.prisma, id);
        (0, response_js_1.success)(res, null, '已移至回收站');
    }
    catch (err) {
        next(err);
    }
});
// 恢复工作项
router.post('/:id/restore', async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return (0, response_js_1.error)(res, '无效的工作项ID', 400, 400);
        }
        const item = await workItemService.restoreWorkItem(req.prisma, id);
        (0, response_js_1.success)(res, item, '恢复成功');
    }
    catch (err) {
        next(err);
    }
});
// 彻底删除
router.delete('/:id/permanent', async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return (0, response_js_1.error)(res, '无效的工作项ID', 400, 400);
        }
        await workItemService.permanentDeleteWorkItem(req.prisma, id);
        (0, response_js_1.success)(res, null, '已彻底删除');
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
