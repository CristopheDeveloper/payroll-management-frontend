<template>
  <div class="flex items-center gap-4">
    <div
      class="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl border border-slate-300 bg-[#e4f2f1] text-xl font-bold text-[#245f69] shadow-sm"
    >
      <img
        v-if="previewUrl && !imageFailed"
        :src="displayUrl"
        :alt="`Fotografía de ${employeeName}`"
        class="h-full w-full object-cover"
        @error="imageFailed = true"
      />
      <EmployeePhotoImage
        v-else-if="url"
        :url="url"
        :alt="`Fotografía de ${employeeName}`"
        image-class="h-full w-full object-cover"
      >
        <span aria-hidden="true">{{ initials }}</span>
      </EmployeePhotoImage>
      <span v-else aria-hidden="true">{{ initials }}</span>
    </div>

    <div class="min-w-0">
      <p class="text-sm font-bold text-slate-800">Foto de perfil</p>
      <p class="mt-0.5 text-xs text-slate-500">JPG, PNG o WebP · máximo 5 MB</p>
      <div v-if="editable" class="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          :class="buttonClass"
          :disabled="loading"
          @click="uploadInput?.click()"
        >
          Subir foto
        </button>
        <button
          type="button"
          :class="buttonClass"
          :disabled="loading"
          @click="cameraInput?.click()"
        >
          Tomar foto
        </button>
        <button
          v-if="url"
          type="button"
          class="h-8 cursor-pointer rounded-lg px-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="loading"
          @click="remove"
        >
          Quitar
        </button>
      </div>
      <p v-else class="mt-2 text-xs text-slate-500">
        Podrás agregarla después de salvar al empleado.
      </p>
      <p v-if="loading" class="mt-1.5 text-xs font-medium text-[#d95800]">
        Guardando fotografía...
      </p>
      <p v-else-if="displayError" class="mt-1.5 text-xs font-medium text-red-600" role="alert">
        {{ displayError }}
      </p>
    </div>

    <input
      ref="uploadInput"
      class="sr-only"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      @change="selectPhoto"
    />
    <input
      ref="cameraInput"
      class="sr-only"
      type="file"
      accept="image/*"
      capture="user"
      @change="selectPhoto"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import EmployeePhotoImage from '@/modules/employees/components/EmployeePhotoImage.vue'

const props = withDefaults(
  defineProps<{
    url?: string | null
    employeeName: string
    editable?: boolean
    loading?: boolean
    error?: string
  }>(),
  { url: null, editable: false, loading: false, error: '' },
)

const emit = defineEmits<{ upload: [photo: File]; remove: [] }>()
const uploadInput = ref<HTMLInputElement | null>(null)
const cameraInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref('')
const localError = ref('')
const imageFailed = ref(false)
const displayUrl = computed(() => previewUrl.value || '')
const displayError = computed(() => localError.value || props.error)
const initials = computed(
  () =>
    props.employeeName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '—',
)
const buttonClass =
  'h-8 cursor-pointer rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-semibold text-slate-700 transition hover:border-[#69d2e7] hover:bg-[#69d2e7]/10 disabled:cursor-not-allowed disabled:opacity-50'

watch(
  () => props.url,
  () => {
    clearPreview()
    imageFailed.value = false
  },
)
watch(
  () => props.error,
  (error) => {
    if (error) clearPreview()
  },
)
onBeforeUnmount(clearPreview)

function selectPhoto(event: Event): void {
  const input = event.target as HTMLInputElement
  const photo = input.files?.[0]
  input.value = ''
  if (!photo) return

  localError.value = ''
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(photo.type)) {
    localError.value = 'Usa una imagen JPG, PNG o WebP.'
    return
  }
  if (photo.size > 5 * 1024 * 1024) {
    localError.value = 'La fotografía no puede superar 5 MB.'
    return
  }

  clearPreview()
  previewUrl.value = URL.createObjectURL(photo)
  imageFailed.value = false
  emit('upload', photo)
}

function remove(): void {
  if (window.confirm('¿Quitar la fotografía de perfil del empleado?')) emit('remove')
}

function clearPreview(): void {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = ''
}
</script>
