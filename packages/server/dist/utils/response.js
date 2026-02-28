"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.success = success;
exports.error = error;
function success(res, data, message = 'success') {
    const response = {
        code: 0,
        data,
        message
    };
    res.json(response);
}
function error(res, message, code = 1, status = 400) {
    const response = {
        code,
        message
    };
    res.status(status).json(response);
}
