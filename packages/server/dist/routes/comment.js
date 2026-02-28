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
const commentService = __importStar(require("../services/comment.js"));
const router = (0, express_1.Router)();
// 添加评论（这个路由在 work-item 路由中处理）
// PUT /api/v1/comments/:id - 编辑评论
const updateSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, '评论内容不能为空').max(2000, '评论内容最多2000字符')
});
router.put('/:id', async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return (0, response_js_1.error)(res, '无效的评论ID', 400, 400);
        }
        const data = updateSchema.parse(req.body);
        const comment = await commentService.updateComment(req.prisma, id, data.content);
        (0, response_js_1.success)(res, comment, '更新成功');
    }
    catch (err) {
        next(err);
    }
});
// DELETE /api/v1/comments/:id - 删除评论
router.delete('/:id', async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return (0, response_js_1.error)(res, '无效的评论ID', 400, 400);
        }
        await commentService.deleteComment(req.prisma, id);
        (0, response_js_1.success)(res, null, '删除成功');
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
