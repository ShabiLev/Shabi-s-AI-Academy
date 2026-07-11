import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
  window.localStorage.clear()
  window.history.pushState({}, '', '/')
  document.body.style.overflow = ''
  document.documentElement.lang = 'he'
  document.documentElement.dir = 'rtl'
})
