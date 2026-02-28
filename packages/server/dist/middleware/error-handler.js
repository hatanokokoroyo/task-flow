"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const response_js_1 = require("../utils/response.js");
function errorHandler(err, req, res, next) {
    console.error(err);
    if (err instanceof zod_1.ZodError) {
        return (0, response_js_1.error)(res, '参数校验失败: ' + err.errors.map(e => e.message).join(', '), 400, 400);
    }
    (0, response_js_1.error)(res, err.message || '服务器内部错误', 500, 500);
}
