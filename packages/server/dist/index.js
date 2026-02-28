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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const work_item_js_1 = __importDefault(require("./routes/work-item.js"));
const comment_js_1 = __importDefault(require("./routes/comment.js"));
const activity_log_js_1 = __importDefault(require("./routes/activity-log.js"));
const recycle_bin_js_1 = __importDefault(require("./routes/recycle-bin.js"));
const stats_js_1 = __importDefault(require("./routes/stats.js"));
const error_handler_js_1 = require("./middleware/error-handler.js");
const zod_1 = require("zod");
const response_js_1 = require("./utils/response.js");
const commentService = __importStar(require("./services/comment.js"));
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// 将 prisma 实例附加到请求对象
app.use((req, res, next) => {
    req.prisma = prisma;
    next();
});
// 路由
app.use('/api/v1/work-items', work_item_js_1.default);
app.use('/api/v1/comments', comment_js_1.default);
app.use('/api/v1/activity-logs', activity_log_js_1.default);
app.use('/api/v1/recycle-bin', recycle_bin_js_1.default);
app.use('/api/v1/stats', stats_js_1.default);
// 评论路由 - 添加评论（挂载在 work-items 下）
const commentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, '评论内容不能为空').max(2000, '评论内容最多2000字符')
});
app.post('/api/v1/work-items/:workItemId/comments', async (req, res, next) => {
    try {
        const workItemId = parseInt(req.params.workItemId);
        if (isNaN(workItemId)) {
            return (0, response_js_1.error)(res, '无效的工作项ID', 400, 400);
        }
        const data = commentSchema.parse(req.body);
        const comment = await commentService.createComment(req.prisma, workItemId, data.content);
        (0, response_js_1.success)(res, comment, '评论添加成功');
    }
    catch (err) {
        next(err);
    }
});
// 错误处理
app.use(error_handler_js_1.errorHandler);
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
// 优雅关闭
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
