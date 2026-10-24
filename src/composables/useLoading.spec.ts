import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { hideLoading, showLoading, useLoading } from '@/composables/useLoading'

describe('global loading state', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    hideLoading(0)
    vi.runAllTimers()
    vi.useRealTimers()
  })

  it('starts without blocking the application', () => {
    expect(useLoading().isLoading.value).toBe(false)
  })

  it('does not let an old hide timer close a newer loading state', () => {
    showLoading('Primera navegación')
    hideLoading(250)
    showLoading('Segunda navegación')
    vi.advanceTimersByTime(250)

    expect(useLoading().isLoading.value).toBe(true)
    expect(useLoading().loadingMessage.value).toBe('Segunda navegación')
  })
})
