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
              <label class="text-[10px] text-gray-400 block mb-2 uppercase tracking-[0.1em] font-bold">按类型查看</label>
              <select
                v-model="filterType"
                class="w-full text-sm border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition-all px-3 py-2 bg-gray-50/50 outline-none"
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

            <div v-if="selectedDate" class="pt-4 border-t border-gray-50">
              <button
                class="text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest flex items-center justify-center gap-2 w-full py-2.5 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100"
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
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[600px]">
          <!-- 日志头部 (Day Header) -->
          <div class="p-6 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between backdrop-blur-sm sticky top-0 z-10">
            <div class="flex items-center gap-4">
              <div v-if="selectedDate" class="text-4xl font-black text-blue-600 tracking-tighter">
                {{ formatDay(selectedDate) }}
              </div>
              <div v-else class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div class="font-bold text-lg text-gray-900 leading-tight">
                  {{ selectedDate ? formatDateDisplay(selectedDate) : '近期活动' }}
                </div>
                <div class="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mt-0.5">
                  {{ selectedDate ? formatWeekDay(selectedDate) : 'ACTIVITY FEED' }}
                </div>
              </div>
            </div>
            <div class="text-right hidden sm:block">
              <div class="text-sm font-bold text-gray-900">{{ logs.length }} 条记录</div>
              <div class="text-[10px] text-gray-400 uppercase tracking-wider font-bold">LOG ENTRIES</div>
            </div>
          </div>

          <!-- 时间轴内容 -->
          <div class="p-8 flex-1">
            <div v-if="loading" class="flex flex-col items-center justify-center py-20">
              <div class="w-10 h-10 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p class="text-gray-400 text-xs font-bold uppercase tracking-widest">LOADING LOGS</p>
            </div>
            <ActivityLogList v-else :logs="logs" />
          </div>

          <!-- 页脚 -->
          <div v-if="selectedDate && !loading" class="p-6 bg-gray-50/30 border-t border-gray-50 flex justify-center mt-auto">
             <span class="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">END OF DAY</span>
          </div>
        </div>
      </div>
    </div>

    <Toast />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import * as activityLogApi from '@/api/activity-log'
import { useToast } from '@/composables/useToast'
import AppLayout from '@/components/layout/AppLayout.vue'
import Toast from '@/components/common/Toast.vue'
import Calendar from '@/components/business/Calendar.vue'
import ActivityLogList from '@/components/business/ActivityLogList.vue'
import SidebarCard from '@/components/layout/SidebarCard.vue'
import type { ActivityLog } from '@/types'

dayjs.locale('zh-cn')
const toast = useToast()

const logs = ref<ActivityLog[]>([])
const calendarData = ref<Record<string, number>>({})
const loading = ref(false)
const selectedDate = ref<string | null>(null)
const filterType = ref('')

onMounted(async () => {
  await loadLogs()
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
