<template>
  <AppLayout title="日志查看">
    <div class="grid grid-cols-12 gap-6">
      <!-- 日历 -->
      <div class="col-span-4">
        <Calendar
          :date-count="calendarData"
          @select-date="handleSelectDate"
          @month-change="handleMonthChange"
        />
      </div>

      <!-- 日志列表 -->
      <div class="col-span-8">
        <div class="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">
              {{ selectedDate ? `${selectedDate} 的活动` : '全部活动' }}
            </h3>
            <div class="flex items-center gap-4">
              <select
                v-model="filterType"
                class="px-3 py-1.5 rounded-lg border border-slate-300 focus:border-primary focus:ring-primary focus:outline-none focus:ring-2 focus:ring-opacity-20 text-sm"
                @change="loadLogs"
              >
                <option value="">全部类型</option>
                <option value="create">创建</option>
                <option value="update">更新</option>
                <option value="status">状态变更</option>
                <option value="comment">评论</option>
                <option value="delete">删除</option>
                <option value="restore">恢复</option>
              </select>
              <button
                v-if="selectedDate"
                class="text-sm text-slate-500 hover:text-primary"
                @click="clearDateFilter"
              >
                清除日期筛选
              </button>
            </div>
          </div>

          <div v-if="loading" class="text-center py-12 text-slate-400">
            加载中...
          </div>
          <ActivityLogList v-else :logs="logs" />
        </div>
      </div>
    </div>

    <Toast />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as activityLogApi from '@/api/activity-log'
import { useToast } from '@/composables/useToast'
import AppLayout from '@/components/layout/AppLayout.vue'
import Toast from '@/components/common/Toast.vue'
import Calendar from '@/components/business/Calendar.vue'
import ActivityLogList from '@/components/business/ActivityLogList.vue'
import type { ActivityLog } from '@/types'

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
</script>
