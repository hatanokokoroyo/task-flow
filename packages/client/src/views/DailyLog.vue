<template>
  <AppLayout title="按天日志查看">
    <div class="max-w-7xl mx-auto flex gap-8">
      <!-- 侧边栏列 (日历 & 筛选) -->
      <div class="w-80 space-y-6 shrink-0">
        <!-- 日历组件 -->
        <Calendar
          :date-count="calendarData"
          :initial-date="selectedDate"
          @select-date="handleSelectDate"
          @month-change="handleMonthChange"
        />

        <!-- 筛选侧边栏 -->
        <SidebarCard title="日志筛选">
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </template>
          <div class="space-y-5">
            <div>
              <label class="text-[10px] text-gray-400 dark:text-slate-500 block mb-2 uppercase tracking-[0.1em] font-bold">按类型查看</label>
              <select
                v-model="filterType"
                class="w-full text-sm border-gray-200 dark:border-slate-600 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition-all px-3 py-2 bg-gray-50/50 dark:bg-slate-700 outline-none text-slate-900 dark:text-slate-100"
                @change="loadLogs"
              >
                <option value="">显示全部</option>
                <option value="create">创建记录</option>
                <option value="update">信息更新</option>
                <option value="status">状态变更</option>
                <option value="comment">添加备注</option>
                <option value="delete">移至回收站</option>
                <option value="restore">记录恢复</option>
              </select>
            </div>

            <div v-if="selectedDate" class="pt-4 border-t border-gray-50 dark:border-slate-700">
              <button
                class="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors uppercase tracking-widest flex items-center justify-center gap-2 w-full py-2.5 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg border border-transparent hover:border-blue-100 dark:hover:border-slate-600"
                @click="clearDateFilter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                清除日期筛选
              </button>
            </div>
          </div>
        </SidebarCard>
      </div>

      <!-- 主内容列 (时间轴) -->
      <div class="flex-1 min-w-0">
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col min-h-[600px]">
          <!-- 日志头部 (Day Header) -->
          <div class="p-6 bg-gray-50/80 dark:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between backdrop-blur-sm sticky top-0 z-10">
            <div class="flex items-center gap-4">
              <div v-if="selectedDate" class="text-4xl font-black text-blue-600 tracking-tighter">
                {{ formatDay(selectedDate) }}
              </div>
              <div v-else class="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div class="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                  {{ selectedDate ? formatDateDisplay(selectedDate) : '近期活动' }}
                </div>
                <div class="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] font-bold mt-0.5">
                  {{ selectedDate ? formatWeekDay(selectedDate) : 'ACTIVITY FEED' }}
                </div>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-2 sm:justify-end">
              <div class="text-right mr-2 hidden sm:block">
                <div class="text-sm font-bold text-gray-900 dark:text-white">{{ logs.length }} 条记录</div>
                <div class="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-wider font-bold">LOG ENTRIES</div>
              </div>
              <BaseButton size="sm" variant="secondary" :loading="weeklySummaryLoading" @click="handleGenerateWeeklySummary">
                本周总结
              </BaseButton>
              <BaseButton size="sm" variant="primary" :loading="monthlySummaryLoading" @click="handleGenerateMonthlySummary">
                本月总结
              </BaseButton>
              <BaseButton size="sm" variant="ghost" :loading="configLoading" @click="openConfigPanel">
                模型参数
              </BaseButton>
            </div>
          </div>

          <!-- 时间轴内容 -->
          <div class="p-8 flex-1">
            <div v-if="loading" class="flex flex-col items-center justify-center py-20">
              <div class="w-10 h-10 border-4 border-blue-50 dark:border-slate-600 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p class="text-gray-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">LOADING LOGS</p>
            </div>
            <ActivityLogList v-else :logs="logs" />
          </div>

          <!-- 页脚 -->
          <div v-if="selectedDate && !loading" class="p-6 bg-gray-50/30 dark:bg-slate-700/30 border-t border-gray-50 dark:border-slate-700 flex justify-center mt-auto">
             <span class="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-[0.3em]">END OF DAY</span>
          </div>
        </div>
      </div>
    </div>

    <BaseModal
      :visible="summaryModalVisible"
      :title="summaryTitle"
      width="760px"
      @close="summaryModalVisible = false"
    >
      <div class="space-y-4" v-if="summaryResult">
        <div class="text-xs text-slate-500 dark:text-slate-400 leading-6">
          周期: {{ summaryResult.period.startDate }} ~ {{ summaryResult.period.endDate }}
          <span class="mx-2">|</span>
          模型: {{ summaryResult.meta.model }}
        </div>
        <div v-if="summaryResult.meta.fallback" class="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 rounded-lg px-3 py-2">
          当前结果来自本地降级摘要：{{ summaryResult.meta.fallbackReason || '模型调用失败' }}
        </div>
        <div class="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900/40 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200">
          {{ summaryResult.summary }}
        </div>
      </div>
      <template #footer>
        <BaseButton variant="ghost" @click="summaryModalVisible = false">关闭</BaseButton>
        <BaseButton variant="primary" @click="copySummary">复制内容</BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      :visible="configModalVisible"
      title="模型参数配置"
      width="760px"
      @close="configModalVisible = false"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-2">
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Base URL</label>
          <input
            v-model="configForm.baseUrl"
            type="text"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            placeholder="https://api.openai.com/v1"
          />
        </div>
        <div class="md:col-span-2">
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">API Key</label>
          <input
            v-model="configForm.apiKey"
            type="password"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            placeholder="sk-..."
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">模型名称</label>
          <input
            v-model="configForm.model"
            type="text"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            placeholder="gpt-4o-mini"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">temperature (0-2)</label>
          <input
            v-model="configForm.temperature"
            type="number"
            min="0"
            max="2"
            step="0.1"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">max tokens (可空)</label>
          <input
            v-model="configForm.maxTokens"
            type="number"
            min="1"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            placeholder="留空表示不限制"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">超时时间 ms</label>
          <input
            v-model="configForm.timeoutMs"
            type="number"
            min="1000"
            max="120000"
            step="1000"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          />
        </div>
        <div class="md:col-span-2">
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">System Prompt</label>
          <textarea
            v-model="configForm.systemPrompt"
            rows="5"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            placeholder="输入系统提示词"
          ></textarea>
        </div>
      </div>
      <template #footer>
        <BaseButton variant="ghost" @click="configModalVisible = false">取消</BaseButton>
        <BaseButton variant="primary" :loading="configSaving" @click="saveModelConfig">保存配置</BaseButton>
      </template>
    </BaseModal>

    <Toast />
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import * as activityLogApi from '@/api/activity-log'
import * as aiApi from '@/api/ai'
import { useToast } from '@/composables/useToast'
import AppLayout from '@/components/layout/AppLayout.vue'
import Toast from '@/components/common/Toast.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import Calendar from '@/components/business/Calendar.vue'
import ActivityLogList from '@/components/business/ActivityLogList.vue'
import SidebarCard from '@/components/layout/SidebarCard.vue'
import type { ActivityLog, AIModelConfig, AISummaryResponse } from '@/types'

dayjs.locale('zh-cn')
const toast = useToast()

const logs = ref<ActivityLog[]>([])
const calendarData = ref<Record<string, number>>({})
const loading = ref(false)
const selectedDate = ref<string | null>(null)
const filterType = ref('')
const weeklySummaryLoading = ref(false)
const monthlySummaryLoading = ref(false)
const summaryModalVisible = ref(false)
const summaryResult = ref<AISummaryResponse | null>(null)
const configModalVisible = ref(false)
const configLoading = ref(false)
const configSaving = ref(false)
const configForm = ref({
  baseUrl: '',
  apiKey: '',
  model: '',
  temperature: '0.3',
  maxTokens: '',
  timeoutMs: '20000',
  systemPrompt: ''
})

const summaryTitle = computed(() => {
  if (!summaryResult.value) {
    return 'AI 工作总结'
  }
  return summaryResult.value.period.type === 'week' ? 'AI 本周总结' : 'AI 本月总结'
})

onMounted(async () => {
  await Promise.all([loadLogs(), loadModelConfig()])
})

async function loadLogs() {
  loading.value = true
  try {
    logs.value = await activityLogApi.getActivityLogs({
      date: selectedDate.value || undefined,
      type: filterType.value || undefined
    })
  } catch (err: any) {
    toast.error(err.message || '加载失败')
  } finally {
    loading.value = false
  }
}

async function loadCalendarData(year: number, month: number) {
  try {
    calendarData.value = await activityLogApi.getCalendarData(year, month)
  } catch (err: any) {
    console.error('Failed to load calendar data:', err)
  }
}

function handleSelectDate(date: string) {
  selectedDate.value = date
  loadLogs()
}

function handleMonthChange(year: number, month: number) {
  loadCalendarData(year, month)
}

function clearDateFilter() {
  selectedDate.value = null
  loadLogs()
}

async function handleGenerateWeeklySummary() {
  weeklySummaryLoading.value = true
  try {
    summaryResult.value = await aiApi.summarizeWeek(resolveAnchorDate())
    summaryModalVisible.value = true
    toast.success('本周总结生成成功')
  } catch (err: any) {
    toast.error(err.message || '本周总结生成失败')
  } finally {
    weeklySummaryLoading.value = false
  }
}

async function handleGenerateMonthlySummary() {
  monthlySummaryLoading.value = true
  try {
    summaryResult.value = await aiApi.summarizeMonth(resolveAnchorDate())
    summaryModalVisible.value = true
    toast.success('本月总结生成成功')
  } catch (err: any) {
    toast.error(err.message || '本月总结生成失败')
  } finally {
    monthlySummaryLoading.value = false
  }
}

function resolveAnchorDate() {
  return selectedDate.value || dayjs().format('YYYY-MM-DD')
}

async function copySummary() {
  if (!summaryResult.value) {
    return
  }
  try {
    await navigator.clipboard.writeText(summaryResult.value.summary)
    toast.success('已复制到剪贴板')
  } catch {
    toast.error('复制失败，请手动复制')
  }
}

async function openConfigPanel() {
  await loadModelConfig()
  configModalVisible.value = true
}

async function loadModelConfig() {
  configLoading.value = true
  try {
    const config = await aiApi.getModelConfig()
    applyConfigToForm(config)
  } catch (err: any) {
    toast.error(err.message || '加载模型配置失败')
  } finally {
    configLoading.value = false
  }
}

function applyConfigToForm(config: AIModelConfig) {
  configForm.value = {
    baseUrl: config.baseUrl,
    apiKey: config.apiKey,
    model: config.model,
    temperature: String(config.temperature),
    maxTokens: config.maxTokens ? String(config.maxTokens) : '',
    timeoutMs: String(config.timeoutMs),
    systemPrompt: config.systemPrompt
  }
}

async function saveModelConfig() {
  const temperature = Number(configForm.value.temperature)
  const timeoutMs = Number(configForm.value.timeoutMs)
  const maxTokensValue = configForm.value.maxTokens.trim()
  let maxTokens: number | null = null

  if (Number.isNaN(temperature) || temperature < 0 || temperature > 2) {
    toast.error('temperature 需要在 0 到 2 之间')
    return
  }
  if (Number.isNaN(timeoutMs) || timeoutMs < 1000 || timeoutMs > 120000) {
    toast.error('超时时间需要在 1000 到 120000 之间')
    return
  }
  if (maxTokensValue) {
    const parsed = Number(maxTokensValue)
    if (Number.isNaN(parsed) || parsed <= 0) {
      toast.error('max tokens 必须为正整数')
      return
    }
    maxTokens = Math.floor(parsed)
  }

  configSaving.value = true
  try {
    const config = await aiApi.updateModelConfig({
      baseUrl: configForm.value.baseUrl.trim(),
      apiKey: configForm.value.apiKey.trim(),
      model: configForm.value.model.trim(),
      temperature,
      maxTokens,
      timeoutMs,
      systemPrompt: configForm.value.systemPrompt.trim()
    })
    applyConfigToForm(config)
    configModalVisible.value = false
    toast.success('模型配置已保存')
  } catch (err: any) {
    toast.error(err.message || '保存模型配置失败')
  } finally {
    configSaving.value = false
  }
}

// 格式化辅助函数
function formatDay(date: string) {
  return dayjs(date).format('DD')
}

function formatDateDisplay(date: string) {
  return dayjs(date).format('YYYY年 M月 D日')
}

function formatWeekDay(date: string) {
  return dayjs(date).format('dddd')
}
</script>
