<template>
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" :class="sizeClass">
    <path
      :d="paths[name]"
      stroke="currentColor"
      :stroke-width="name === 'check' || name === 'chevron' ? 2.2 : 1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script setup lang="ts">
type IconName = 'warning' | 'check' | 'refresh' | 'chevron' | 'close'

withDefaults(
  defineProps<{
    name: IconName
    sizeClass?: string
  }>(),
  { sizeClass: 'h-4 w-4' },
)

const paths: Record<IconName, string> = {
  warning:
    'M12 9v4m0 3.5h.01M10.3 3.9 2.6 17.3A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.7L13.7 3.9a2 2 0 0 0-3.4 0Z',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  refresh: 'M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7',
  chevron: 'm9 6 6 6-6 6',
  close: 'm6 6 12 12M18 6 6 18',
}
</script>
