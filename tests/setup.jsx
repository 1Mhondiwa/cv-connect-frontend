/* eslint-env browser, es2021, vitest */

import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock localStorage (backed by a real store so set/get round-trip in tests)
const localStorageStore = {}
const localStorageMock = {
  getItem: vi.fn((key) => (key in localStorageStore ? localStorageStore[key] : null)),
  setItem: vi.fn((key, value) => { localStorageStore[key] = String(value) }),
  removeItem: vi.fn((key) => { delete localStorageStore[key] }),
  clear: vi.fn(() => { for (const k of Object.keys(localStorageStore)) delete localStorageStore[k] }),
}
global.localStorage = localStorageMock

// Mock sessionStorage (backed by a real store)
const sessionStorageStore = {}
const sessionStorageMock = {
  getItem: vi.fn((key) => (key in sessionStorageStore ? sessionStorageStore[key] : null)),
  setItem: vi.fn((key, value) => { sessionStorageStore[key] = String(value) }),
  removeItem: vi.fn((key) => { delete sessionStorageStore[key] }),
  clear: vi.fn(() => { for (const k of Object.keys(sessionStorageStore)) delete sessionStorageStore[k] }),
}
global.sessionStorage = sessionStorageMock

// Mock window.scrollTo
window.scrollTo = vi.fn()

// Suppress specific console errors in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
        args[0].includes('act(...)') ||
        args[0].includes('useLayoutEffect does nothing on the server'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})