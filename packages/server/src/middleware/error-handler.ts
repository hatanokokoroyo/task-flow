import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { error } from '../utils/response.js'

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err)

  if (err instanceof ZodError) {
    return error(res, '参数校验失败: ' + err.errors.map(e => e.message).join(', '), 400, 400)
  }

  error(res, err.message || '服务器内部错误', 500, 500)
}
