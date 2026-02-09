<template>
  <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
    <!-- 月份导航 -->
    <div class="flex items-center justify-between mb-4">
      <button class="p-2 hover:bg-slate-100 rounded" @click="prevMonth">◀</button>
      <span class="font-semibold">{{ currentYear }}年{{ currentMonth }}月</span>
      <button class="p-2 hover:bg-slate-100 rounded" @click="nextMonth">▶</button>
    </div>

    <!-- 星期头 -->
    <div class="grid grid-cols-7 mb-2">
      <div v-for="day in weekDays" :key="day" class="text-center text-sm text-slate-500 py-2">
        {{ day }}
      </div>
    </div>

    <!-- 日期格子 -->
    <div class="grid grid-cols-7 gap-1">
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        :class="[
          'aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer transition-colors text-sm',
          day.isCurrentMonth ? 'hover:bg-slate-100' : 'text-slate-300',
          day.isToday ? 'bg-primary text-white hover:bg-primary-600' : '',
          day.isSelected ? 'ring-2 ring-primary' : ''
        ]"
        @click="selectDate(day)"
      >
        <span>{{ day.date }}</span>
        <span v-if="day.count" class="w-1.5 h-1.5 bg-primary rounded-full mt-0.5" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'

const props = defineProps<{
  dateCount?: Record<string, number>
}>()

const emit = defineEmits<{
  'select-date': [date: string]
  'month-change': [year: number, month: number]
}>()

const currentYear = ref(dayjs().year())
const currentMonth = ref(dayjs().month() + 1)
const selectedDate = ref<string | null>(null)

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

interface CalendarDay {
  date: number
  fullDate: string
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  count: number
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
