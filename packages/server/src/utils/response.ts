import { Response } from 'express'
import { ApiResponse } from '../types/index.js'

export function success<T>(res: Response, data: T, message = 'success') {
  const response: ApiResponse<T> = {
    code: 0,
    data,
    message
  }
  res.json(response)
}

export function error(res: Response, message: string, code = 1, status = 400) {
  const response: ApiResponse = {
    code,
    message
  }
  res.status(status).json(response)
}
