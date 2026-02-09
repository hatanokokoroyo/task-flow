<template>
  <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
    <!-- 月份导航 -->
    <div class="flex items-center justify-between mb-6">
      <span class="text-lg font-bold">{{ currentYear }}年 {{ currentMonth }}月</span>
      <div class="flex gap-1">
        <button class="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors" @click="prevMonth">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button class="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors" @click="nextMonth">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 星期头 -->
    <div class="grid grid-cols-7 gap-1 text-center text-[10px] text-gray-400 font-bold mb-3 uppercase tracking-wider">
      <div v-for="day in weekDays" :key="day">{{ day }}</div>
    </div>

    <!-- 日期格子 -->
    <div class="grid grid-cols-7 gap-2">
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        :class="[
          'h-8 flex items-center justify-center text-xs rounded transition-all cursor-pointer select-none',
          !day.isCurrentMonth ? 'text-gray-300' : 'hover:bg-blue-50',
          day.isSelected ? 'bg-blue-600 text-white font-bold shadow-md ring-4 ring-blue-100' : 
          (day.isToday ? 'bg-blue-100 text-blue-800 font-medium' : ''),
          day.isCurrentMonth && day.count > 0 && !day.isSelected ? getIntensityClass(day.count) : ''
        ]"
        @click="selectDate(day)"
      >
        {{ day.date }}
      </div>
    </div>

    <!-- 图例 -->
    <div class="mt-6 pt-4 border-t border-gray-50 space-y-2">
      <div class="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
        <span class="w-3 h-3 bg-blue-50 rounded-sm"></span>
        <span>少量记录 (1-3)</span>
      </div>
      <div class="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
        <span class="w-3 h-3 bg-blue-200 rounded-sm"></span>
        <span>中等记录 (4-8)</span>
      </div>
      <div class="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
        <span class="w-3 h-3 bg-blue-600 rounded-sm"></span>
        <span>大量记录 (9+)</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import dayjs from 'dayjs'

const props = defineProps<{
  dateCount?: Record<string, number>
  initialDate?: string | null
}>()

const emit = defineEmits<{
  'select-date': [date: string]
  'month-change': [year: number, month: number]
}>()

const currentYear = ref(dayjs().year())
const currentMonth = ref(dayjs().month() + 1)
const selectedDate = ref<string | null>(props.initialDate || null)

watch(() => props.initialDate, (newVal) => {
  selectedDate.value = newVal || null
})

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

interface CalendarDay {
  date: number
  fullDate: string
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  count: number
}

function getIntensityClass(count: number) {
  if (count >= 9) return 'bg-blue-600 !text-white'
  if (count >= 4) return 'bg-blue-200'
  if (count >= 1) return 'bg-blue-50'
  return ''
}

const calendarDays = computed<CalendarDay[]>(() => {
  const firstDay = dayjs(`${currentYear.value}-${currentMonth.value}-01`)
  const daysInMonth = firstDay.daysInMonth()
  const startDayOfWeek = firstDay.day()
  const today = dayjs().format('YYYY-MM-DD')

  const days: CalendarDay[] = []

  // 上个月的日期
  const prevMonth = firstDay.subtract(1, 'month')
  const prevMonthDays = prevMonth.daysInMonth()
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = prevMonthDays - i
    const fullDate = prevMonth.date(date).format('YYYY-MM-DD')
    days.push({
      date,
      fullDate,
      isCurrentMonth: false,
      isToday: fullDate === today,
      isSelected: fullDate === selectedDate.value,
      count: props.dateCount?.[fullDate] || 0
    })
  }

  // 当前月的日期
  for (let i = 1; i <= daysInMonth; i++) {
    const fullDate = firstDay.date(i).format('YYYY-MM-DD')
    days.push({
      date: i,
      fullDate,
      isCurrentMonth: true,
      isToday: fullDate === today,
      isSelected: fullDate === selectedDate.value,
      count: props.dateCount?.[fullDate] || 0
    })
  }

  // 下个月的日期
  const remaining = 42 - days.length
  const nextMonth = firstDay.add(1, 'month')
  for (let i = 1; i <= remaining; i++) {
    const fullDate = nextMonth.date(i).format('YYYY-MM-DD')
    days.push({
      date: i,
      fullDate,
      isCurrentMonth: false,
      isToday: fullDate === today,
      isSelected: fullDate === selectedDate.value,
      count: props.dateCount?.[fullDate] || 0
    })
  }

  return days
})

function prevMonth() {
  if (currentMonth.value === 1) {
    currentYear.value--
    currentMonth.value = 12
  } else {
    currentMonth.value--
  }
  emit('month-change', currentYear.value, currentMonth.value)
}

function nextMonth() {
  if (currentMonth.value === 12) {
    currentYear.value++
    currentMonth.value = 1
  } else {
    currentMonth.value++
  }
  emit('month-change', currentYear.value, currentMonth.value)
}

function selectDate(day: CalendarDay) {
  if (!day.isCurrentMonth) return
  selectedDate.value = day.fullDate
  emit('select-date', day.fullDate)
}

onMounted(() => {
  emit('month-change', currentYear.value, currentMonth.value)
})
</script>
