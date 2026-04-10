import { PrismaClient } from '@prisma/client'
import { STATUS_LABELS } from '../types/index.js'
import type {
  AIModelConfig,
  AISummaryRequest,
  AISummaryResponse,
  AISummaryType,
  Status,
  UpdateAIModelConfigRequest
} from '../types/index.js'

const DEFAULT_BASE_URL = 'https://api.openai.com/v1'
const DEFAULT_MODEL = 'gpt-4o-mini'
const DEFAULT_TEMPERATURE = 0.3
const DEFAULT_TIMEOUT_MS = 20000
const DEFAULT_SYSTEM_PROMPT =
  '你是工作日志分析助手。请严格使用中文输出，结构固定为：1) 完成事项 2) 进行中事项 3) 待办事项。每段用简短项目符号，聚焦可执行信息，避免空话。'

let aiTablesReady = false

interface PeriodRange {
  startAt: Date
  endAt: Date
  startDate: string
  endDate: string
  anchorDate: string
}

interface AIModelConfigRow {
  base_url: string
  api_key: string
  model: string
  temperature: number
  max_tokens: number | null
  timeout_ms: number
  system_prompt: string
}

interface SummaryRecordInput {
  summaryType: AISummaryType
  anchorDate: string
  startDate: string
  endDate: string
  model: string
  temperature: number
  maxTokens?: number
  providerBaseUrl: string
  fallback: boolean
  fallbackReason?: string
  summary: string
  contextJson: string
}

export async function getModelConfig(prisma: PrismaClient): Promise<AIModelConfig> {
  await ensureAiTables(prisma)
  const config = await getOrCreateModelConfig(prisma)
  return normalizeConfig(config)
}

export async function updateModelConfig(
  prisma: PrismaClient,
  payload: UpdateAIModelConfigRequest
): Promise<AIModelConfig> {
  await ensureAiTables(prisma)
  const current = await getOrCreateModelConfig(prisma)

  const merged = {
    baseUrl: payload.baseUrl ? sanitizeBaseUrl(payload.baseUrl) : current.base_url,
    apiKey: payload.apiKey ?? current.api_key,
    model: payload.model ?? current.model,
    temperature: payload.temperature ?? current.temperature,
    maxTokens:
      payload.maxTokens === null
        ? undefined
        : payload.maxTokens ?? current.max_tokens ?? undefined,
    timeoutMs: payload.timeoutMs ?? current.timeout_ms,
    systemPrompt: payload.systemPrompt ?? current.system_prompt
  }

  await prisma.$executeRawUnsafe(
    `
      INSERT INTO ai_model_config (
        id, base_url, api_key, model, temperature, max_tokens, timeout_ms, system_prompt, created_at, updated_at
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        base_url=excluded.base_url,
        api_key=excluded.api_key,
        model=excluded.model,
        temperature=excluded.temperature,
        max_tokens=excluded.max_tokens,
        timeout_ms=excluded.timeout_ms,
        system_prompt=excluded.system_prompt,
        updated_at=CURRENT_TIMESTAMP
    `,
    merged.baseUrl,
    merged.apiKey,
    merged.model,
    merged.temperature,
    merged.maxTokens ?? null,
    merged.timeoutMs,
    merged.systemPrompt
  )

  const latest = await getOrCreateModelConfig(prisma)
  return normalizeConfig(latest)
}

export async function generateSummary(
  prisma: PrismaClient,
  payload: AISummaryRequest
): Promise<AISummaryResponse> {
  await ensureAiTables(prisma)
  const modelConfig = await getOrCreateModelConfig(prisma)

  const anchorDate = parseAnchorDate(payload.dateAnchor)
  const period =
    payload.summaryType === 'week'
      ? getWeekRange(anchorDate)
      : getMonthRange(anchorDate)

  const [logs, statusBreakdown, touchedCount] = await Promise.all([
    prisma.activityLog.findMany({
      where: {
        createdAt: {
          gte: period.startAt,
          lte: period.endAt
        }
      },
      orderBy: { createdAt: 'asc' },
      include: {
        workItem: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      },
      take: 800
    }),
    prisma.workItem.groupBy({
      by: ['status'],
      where: {
        deletedAt: null,
        parentId: null
      },
      _count: {
        status: true
      }
    }),
    prisma.workItem.count({
      where: {
        deletedAt: null,
        updatedAt: {
          gte: period.startAt,
          lte: period.endAt
        }
      }
    })
  ])

  const context = {
    summaryType: payload.summaryType,
    period: {
      startDate: period.startDate,
      endDate: period.endDate,
      anchorDate: period.anchorDate
    },
    logCount: logs.length,
    touchedCount,
    statusBreakdown: statusBreakdown.map(item => ({
      status: item.status,
      count: item._count.status
    })),
    logItems: logs.map(log => ({
      time: formatDateTime(log.createdAt),
      type: log.type,
      description: log.description,
      workItemId: log.workItemId,
      workItemTitle: log.workItem?.title || ''
    }))
  }

  const model = payload.model || modelConfig.model
  const baseUrl = sanitizeBaseUrl(modelConfig.base_url)
  const temperature = payload.temperature ?? modelConfig.temperature
  const maxTokens = payload.maxTokens ?? (modelConfig.max_tokens ?? undefined)

  let summary = ''
  let fallback = false
  let fallbackReason: string | undefined
  try {
    summary = await callOpenAICompatible({
      apiKey: modelConfig.api_key,
      baseUrl,
      model,
      timeoutMs: modelConfig.timeout_ms,
      temperature,
      maxTokens,
      messages: [
        {
          role: 'system',
          content: modelConfig.system_prompt
        },
        {
          role: 'user',
          content: `请基于以下 JSON 数据生成${payload.summaryType === 'week' ? '本周' : '本月'}总结：\n${JSON.stringify(
            context
          )}`
        }
      ]
    })
  } catch (err) {
    summary = buildFallbackSummary(context)
    fallback = true
    fallbackReason = err instanceof Error ? err.message : '模型调用失败'
  }

  await createSummaryRecord(prisma, {
    summaryType: payload.summaryType,
    anchorDate: period.anchorDate,
    startDate: period.startDate,
    endDate: period.endDate,
    model,
    temperature,
    maxTokens,
    providerBaseUrl: baseUrl,
    fallback,
    fallbackReason,
    summary,
    contextJson: JSON.stringify(context)
  })

  return {
    summary,
    period: {
      type: payload.summaryType,
      startDate: period.startDate,
      endDate: period.endDate,
      anchorDate: period.anchorDate
    },
    meta: {
      model,
      temperature,
      maxTokens,
      providerBaseUrl: baseUrl,
      fallback,
      fallbackReason
    }
  }
}

function parseAnchorDate(input?: string): Date {
  if (!input) {
    return new Date()
  }

  const parsed = new Date(input)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('无效的 dateAnchor，需传入可解析的日期')
  }
  return parsed
}

function getWeekRange(anchor: Date): PeriodRange {
  const normalizedAnchor = startOfDay(anchor)
  const day = normalizedAnchor.getDay() || 7
  const startAt = new Date(normalizedAnchor)
  startAt.setDate(normalizedAnchor.getDate() - (day - 1))
  const endAt = new Date(startAt)
  endAt.setDate(startAt.getDate() + 6)
  endAt.setHours(23, 59, 59, 999)

  return {
    startAt,
    endAt,
    startDate: formatDate(startAt),
    endDate: formatDate(endAt),
    anchorDate: formatDate(normalizedAnchor)
  }
}

function getMonthRange(anchor: Date): PeriodRange {
  const normalizedAnchor = startOfDay(anchor)
  const startAt = new Date(normalizedAnchor.getFullYear(), normalizedAnchor.getMonth(), 1)
  const endAt = new Date(normalizedAnchor.getFullYear(), normalizedAnchor.getMonth() + 1, 0, 23, 59, 59, 999)

  return {
    startAt,
    endAt,
    startDate: formatDate(startAt),
    endDate: formatDate(endAt),
    anchorDate: formatDate(normalizedAnchor)
  }
}

function startOfDay(date: Date): Date {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDateTime(date: Date): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

function sanitizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/$/, '')
}

function normalizeConfig(config: AIModelConfigRow): AIModelConfig {
  return {
    baseUrl: sanitizeBaseUrl(config.base_url),
    apiKey: config.api_key,
    model: config.model,
    temperature: config.temperature,
    maxTokens: config.max_tokens ?? undefined,
    timeoutMs: config.timeout_ms,
    systemPrompt: config.system_prompt
  }
}

async function ensureAiTables(prisma: PrismaClient): Promise<void> {
  if (aiTablesReady) {
    return
  }

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ai_model_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      base_url TEXT NOT NULL,
      api_key TEXT NOT NULL,
      model TEXT NOT NULL,
      temperature REAL NOT NULL DEFAULT 0.3,
      max_tokens INTEGER,
      timeout_ms INTEGER NOT NULL DEFAULT 20000,
      system_prompt TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ai_summary_record (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      summary_type TEXT NOT NULL,
      anchor_date TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      model TEXT NOT NULL,
      temperature REAL NOT NULL,
      max_tokens INTEGER,
      provider_base_url TEXT NOT NULL,
      fallback INTEGER NOT NULL DEFAULT 0,
      fallback_reason TEXT,
      summary TEXT NOT NULL,
      context_json TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  aiTablesReady = true
}

async function getOrCreateModelConfig(prisma: PrismaClient): Promise<AIModelConfigRow> {
  const rows = await prisma.$queryRawUnsafe<AIModelConfigRow[]>(`
    SELECT base_url, api_key, model, temperature, max_tokens, timeout_ms, system_prompt
    FROM ai_model_config
    WHERE id = 1
    LIMIT 1
  `)

  if (rows.length > 0) {
    return rows[0]
  }

  const defaultConfig = {
    baseUrl: sanitizeBaseUrl(DEFAULT_BASE_URL),
    apiKey: '',
    model: DEFAULT_MODEL,
    temperature: DEFAULT_TEMPERATURE,
    maxTokens: undefined as number | undefined,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    systemPrompt: DEFAULT_SYSTEM_PROMPT
  }

  await prisma.$executeRawUnsafe(
    `
      INSERT INTO ai_model_config (
        id, base_url, api_key, model, temperature, max_tokens, timeout_ms, system_prompt, created_at, updated_at
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO NOTHING
    `,
    defaultConfig.baseUrl,
    defaultConfig.apiKey,
    defaultConfig.model,
    defaultConfig.temperature,
    defaultConfig.maxTokens ?? null,
    defaultConfig.timeoutMs,
    defaultConfig.systemPrompt
  )

  const latest = await prisma.$queryRawUnsafe<AIModelConfigRow[]>(`
    SELECT base_url, api_key, model, temperature, max_tokens, timeout_ms, system_prompt
    FROM ai_model_config
    WHERE id = 1
    LIMIT 1
  `)

  if (latest.length === 0) {
    throw new Error('模型配置初始化失败')
  }

  return latest[0]
}

async function createSummaryRecord(prisma: PrismaClient, input: SummaryRecordInput): Promise<void> {
  await prisma.$executeRawUnsafe(
    `
      INSERT INTO ai_summary_record (
        summary_type, anchor_date, start_date, end_date, model, temperature, max_tokens,
        provider_base_url, fallback, fallback_reason, summary, context_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
    input.summaryType,
    input.anchorDate,
    input.startDate,
    input.endDate,
    input.model,
    input.temperature,
    input.maxTokens ?? null,
    input.providerBaseUrl,
    input.fallback ? 1 : 0,
    input.fallbackReason ?? null,
    input.summary,
    input.contextJson
  )
}

async function callOpenAICompatible(options: {
  apiKey?: string
  baseUrl: string
  model: string
  timeoutMs: number
  temperature: number
  maxTokens?: number
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
}): Promise<string> {
  if (!options.apiKey) {
    throw new Error('缺少模型 API Key 配置，请先在模型参数面板保存')
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeoutMs)

  try {
    const response = await fetch(`${options.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: options.model,
        messages: options.messages,
        temperature: options.temperature,
        max_tokens: options.maxTokens
      }),
      signal: controller.signal
    })

    if (!response.ok) {
      throw new Error(await mapProviderError(response))
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | Array<{ type?: string; text?: string }> } }>
    }

    const content = extractContent(data)
    if (!content) {
      throw new Error('模型返回为空')
    }

    return content.trim()
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('模型调用超时，请稍后重试')
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

async function mapProviderError(response: Response): Promise<string> {
  const payload = await response
    .json()
    .catch(() => ({ message: '' })) as { message?: string; error?: { message?: string } }
  const message = payload.error?.message || payload.message || '模型调用失败'

  if (response.status === 401 || response.status === 403) {
    return `模型鉴权失败: ${message}`
  }
  if (response.status === 429) {
    return `模型请求过于频繁: ${message}`
  }
  if (response.status >= 500) {
    return `模型服务异常: ${message}`
  }
  return `模型调用失败(${response.status}): ${message}`
}

function extractContent(data: {
  choices?: Array<{ message?: { content?: string | Array<{ type?: string; text?: string }> } }>
}): string {
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    return ''
  }

  if (typeof content === 'string') {
    return content
  }

  return content
    .filter(item => item.type === 'text' && item.text)
    .map(item => item.text)
    .join('\n')
}

function buildFallbackSummary(context: {
  summaryType: AISummaryType
  period: { startDate: string; endDate: string; anchorDate: string }
  logCount: number
  touchedCount: number
  statusBreakdown: Array<{ status: string; count: number }>
  logItems: Array<{
    time: string
    type: string
    description: string
    workItemId: number
    workItemTitle: string
  }>
}): string {
  const completed = context.logItems.filter(log => log.type === 'status' && log.description.includes('已完成'))
  const risks = context.logItems.filter(log => log.type === 'delete')
  const recent = context.logItems.slice(-5)

  const statusLine = context.statusBreakdown
    .map(item => `${STATUS_LABELS[item.status as Status] || item.status}: ${item.count}`)
    .join('，')

  return [
    `时间范围: ${context.period.startDate} ~ ${context.period.endDate}`,
    '',
    '1) 完成事项',
    `- 本期共记录 ${context.logCount} 条日志，涉及 ${context.touchedCount} 个工作项更新。`,
    `- 已完成相关变更 ${completed.length} 次。`,
    '',
    '2) 进行中事项',
    `- 当前状态分布: ${statusLine || '暂无数据'}。`,
    '- 近期关键活动:',
    ...recent.map(log => `  - [${log.time}] ${log.description}`),
    '',
    '3) 风险与阻塞',
    `- 本期移入回收站 ${risks.length} 次，建议回顾删除原因并确认是否需要恢复。`,
    '',
    `4) 下${context.summaryType === 'week' ? '周' : '月'}计划`,
    '- 优先处理“暂停中”任务，并推动进行中任务闭环。',
    '- 复盘高频变更任务，减少重复沟通与状态回退。'
  ].join('\n')
}
