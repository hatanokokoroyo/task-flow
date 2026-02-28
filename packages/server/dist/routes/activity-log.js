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
const response_js_1 = require("../utils/response.js");
const activityLogService = __importStar(require("../services/activity-log.js"));
const router = (0, express_1.Router)();
// 获取活动日志列表
router.get('/', async (req, res, next) => {
    try {
        const { date, type, workItemId, order = 'desc' } = req.query;
        const logs = await activityLogService.getActivityLogs(req.prisma, {
            date: date,
            type: type,
            workItemId: workItemId ? parseInt(workItemId) : undefined,
            order: order
        });
        (0, response_js_1.success)(res, logs);
    }
    catch (err) {
        next(err);
    }
});
// 获取日历数据
router.get('/calendar', async (req, res, next) => {
    try {
        const { year, month } = req.query;
        if (!year || !month) {
            return (0, response_js_1.error)(res, '请提供年份和月份', 400, 400);
        }
        const data = await activityLogService.getCalendarData(req.prisma, parseInt(year), parseInt(month));
        (0, response_js_1.success)(res, data);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
