import { defineStore } from 'pinia'
import { ref } from 'vue'

const THEME_STORAGE_KEY = 'taskflow-theme'

export const useUIStore = defineStore('ui', () => {
  const sidebarCollapsed = ref(false)
  const theme = ref<'light' | 'dark'>('light')

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setTheme(newTheme: 'light' | 'dark') {
    theme.value = newTheme
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    applyThemeToDom(newTheme)
  }

  function toggleTheme() {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  function getSystemTheme(): 'light' | 'dark' {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }

  function applyThemeToDom(themeValue: 'light' | 'dark') {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', themeValue === 'dark')
    }
  }

  function initTheme() {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark' | null
    const initialTheme = stored || getSystemTheme()
    theme.value = initialTheme
    applyThemeToDom(initialTheme)

    // 监听系统主题变化
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', (e) => {
        // 只有当用户没有手动设置时才跟随系统
        if (!localStorage.getItem(THEME_STORAGE_KEY)) {
          setTheme(e.matches ? 'dark' : 'light')
        }
      })
    }
  }

  return {
    sidebarCollapsed,
    theme,
    toggleSidebar,
    setTheme,
    toggleTheme,
    initTheme
  }
})
