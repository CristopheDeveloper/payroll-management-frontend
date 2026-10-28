<template>
  <img v-if="objectUrl" :src="objectUrl" :alt="alt" :class="imageClass" />
  <slot v-else />
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { getEmployeePhoto } from '@/modules/employees/services/employee.service'

const props = withDefaults(defineProps<{ url: string; alt: string; imageClass?: string }>(), {
  imageClass: '',
})

const objectUrl = ref('')
let requestVersion = 0

watch(
  () => props.url,
  async (url) => {
    const version = ++requestVersion
    clearObjectUrl()
    if (!url) return
    try {
      const blob = await getEmployeePhoto(url)
      if (version !== requestVersion) return
      objectUrl.value = URL.createObjectURL(blob)
    } catch {
      // El slot conserva las iniciales si la imagen no está disponible.
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  requestVersion++
  clearObjectUrl()
})

function clearObjectUrl(): void {
  if (objectUrl.value) URL.revokeObjectURL(objectUrl.value)
  objectUrl.value = ''
}
</script>
