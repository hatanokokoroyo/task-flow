import { PrismaClient } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      prisma: PrismaClient
    }
  }
}

export interface ApiResponse<T = any> {
  code: number
  data?: T
  message: string
}

export const StatusEnum = {
  PENDING: 'pending',
  DESIGN: 'design',
  DEVELOP: 'develop',
  TEST: 'test',
  DELIVERY: 'delivery',
  DONE: 'done'
} as const

export type Status = typeof StatusEnum[keyof typeof StatusEnum]

export const ActivityLogType = {
  CREATE: 'create',
  UPDATE: 'update',
  STATUS: 'status',
  COMMENT: 'comment',
  DELETE: 'delete',
  RESTORE: 'restore'
} as const

export type ActivityType = typeof ActivityLogType[keyof typeof ActivityLogType]

export const WorkItemTypeEnum = {
  FEATURE: 'FEATURE',
  BUG: 'BUG',
  SUPPORT: 'SUPPORT'
} as const

export type WorkItemType = typeof WorkItemTypeEnum[keyof typeof WorkItemTypeEnum]
