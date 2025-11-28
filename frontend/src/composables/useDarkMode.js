import { ref, watch } from 'vue'

const isDark = ref(false)

export function useDarkMode() {
  const initDarkMode = () => {
    const savedTheme = localStorage.getItem('darkMode')
    if (savedTheme !== null) {
      isDark.value = savedTheme === 'true'
    } else {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyTheme()
  }

  const applyTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
    }
  }

  const toggleDarkMode = () => {
    isDark.value = !isDark.value
    localStorage.setItem('darkMode', isDark.value.toString())
    applyTheme()
  }

  watch(isDark, () => {
    applyTheme()
  })

  return {
    isDark,
    toggleDarkMode,
    initDarkMode
  }
}
