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
        <button type="button" :class="buttonClass" :disabled="loading" @click="openCamera">
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

  <Teleport to="body">
    <div
      v-if="cameraOpen"
      class="fixed inset-0 z-[9000] grid place-items-center bg-slate-950/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-title"
      @click.self="closeCamera"
    >
      <section class="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h2 id="camera-title" class="font-bold text-slate-900">Tomar fotografía</h2>
            <p class="text-xs text-slate-500">Centra el rostro dentro de la cámara.</p>
          </div>
          <button
            type="button"
            class="grid h-9 w-9 cursor-pointer place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Cerrar cámara"
            @click="closeCamera"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="m6 6 12 12M18 6 6 18"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </header>

        <div class="relative aspect-[4/3] overflow-hidden bg-slate-950">
          <video
            ref="cameraVideo"
            class="h-full w-full scale-x-[-1] object-cover"
            autoplay
            muted
            playsinline
          ></video>
          <div
            v-if="cameraStarting"
            class="absolute inset-0 grid place-items-center text-sm font-semibold text-white"
          >
            Iniciando cámara...
          </div>
          <div
            v-else-if="cameraError"
            class="absolute inset-0 grid place-items-center p-8 text-center"
          >
            <div>
              <p class="font-bold text-white">No se pudo abrir la cámara</p>
              <p class="mt-2 text-sm text-slate-300">{{ cameraError }}</p>
            </div>
          </div>
        </div>

        <footer class="flex flex-wrap justify-end gap-2 border-t border-slate-200 p-4">
          <button type="button" :class="buttonClass" @click="closeCamera">Cancelar</button>
          <button
            type="button"
            class="h-10 cursor-pointer rounded-lg bg-[#fa6900] px-5 text-sm font-bold text-[#202f33] transition hover:bg-[#f38630] disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!cameraReady"
            @click="capturePhoto"
          >
            Capturar foto
          </button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
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
const cameraVideo = ref<HTMLVideoElement | null>(null)
const previewUrl = ref('')
const localError = ref('')
const imageFailed = ref(false)
const cameraOpen = ref(false)
const cameraStarting = ref(false)
const cameraReady = ref(false)
const cameraError = ref('')
let cameraStream: MediaStream | null = null
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
onBeforeUnmount(() => {
  clearPreview()
  stopCamera()
})

function selectPhoto(event: Event): void {
  const input = event.target as HTMLInputElement
  const photo = input.files?.[0]
  input.value = ''
  if (!photo) return

  preparePhoto(photo)
}

async function openCamera(): Promise<void> {
  localError.value = ''
  cameraError.value = ''

  if (!navigator.mediaDevices?.getUserMedia) {
    cameraInput.value?.click()
    return
  }

  if (!window.isSecureContext) {
    localError.value = 'La cámara requiere abrir el sistema mediante HTTPS o localhost.'
    return
  }

  cameraOpen.value = true
  cameraStarting.value = true
  cameraReady.value = false
  await nextTick()

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
      audio: false,
    })
    if (!cameraVideo.value) return
    cameraVideo.value.srcObject = cameraStream
    await cameraVideo.value.play()
    cameraReady.value = true
  } catch (error) {
    stopCamera()
    cameraError.value = cameraErrorMessage(error)
  } finally {
    cameraStarting.value = false
  }
}

async function capturePhoto(): Promise<void> {
  const video = cameraVideo.value
  if (!video || !cameraReady.value || !video.videoWidth || !video.videoHeight) return

  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const context = canvas.getContext('2d')
  if (!context) {
    cameraError.value = 'No fue posible preparar la fotografía.'
    return
  }

  context.translate(canvas.width, 0)
  context.scale(-1, 1)
  context.drawImage(video, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.9),
  )
  if (!blob) {
    cameraError.value = 'No fue posible capturar la fotografía.'
    return
  }

  const photo = new File([blob], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' })
  closeCamera()
  preparePhoto(photo)
}

function closeCamera(): void {
  stopCamera()
  cameraOpen.value = false
  cameraStarting.value = false
  cameraError.value = ''
}

function stopCamera(): void {
  cameraStream?.getTracks().forEach((track) => track.stop())
  cameraStream = null
  cameraReady.value = false
  if (cameraVideo.value) cameraVideo.value.srcObject = null
}

function cameraErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError')
      return 'Permite el acceso a la cámara desde la configuración del navegador e intenta nuevamente.'
    if (error.name === 'NotFoundError')
      return 'No se encontró una cámara disponible en este dispositivo.'
    if (error.name === 'NotReadableError')
      return 'La cámara está siendo utilizada por otra aplicación.'
  }
  return 'Revisa los permisos de cámara del navegador e intenta nuevamente.'
}

function preparePhoto(photo: File): void {
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
