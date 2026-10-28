<template>
  <div ref="root" class="relative">
    <input
      :id="id"
      ref="input"
      v-model="query"
      type="text"
      role="combobox"
      autocomplete="off"
      :aria-expanded="open"
      :aria-controls="`${id}-lista`"
      :aria-activedescendant="open && filtered[active] ? `${id}-op-${active}` : undefined"
      :placeholder="placeholder"
      :class="inputClass"
      class="w-full pr-9"
      @focus="openList"
      @click="openList"
      @input="onInput"
      @keydown.down.prevent="move(1)"
      @keydown.up.prevent="move(-1)"
      @keydown.enter.prevent="chooseActive"
      @keydown.escape="closeList"
      @blur="onBlur"
    />
    <svg
      class="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-500"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <ul
      v-show="open"
      :id="`${id}-lista`"
      role="listbox"
      class="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-300 bg-white py-1 shadow-lg"
    >
      <li
        v-for="(item, index) in filtered"
        :id="`${id}-op-${index}`"
        :key="item.value"
        role="option"
        :aria-selected="item.value === modelValue"
        class="cursor-pointer px-3 py-2 text-sm"
        :class="[
          index === active ? 'bg-[#e4f2f1] text-slate-900' : 'text-slate-700',
          item.value === modelValue ? 'font-semibold' : '',
        ]"
        @mousedown.prevent="choose(item)"
        @mousemove="active = index"
      >
        {{ item.label }}
        <span v-if="item.hint" class="ml-1 text-xs text-slate-500">{{ item.hint }}</span>
      </li>
      <li v-if="!filtered.length" class="px-3 py-2 text-sm text-slate-500">Sin resultados</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

export interface ComboboxOption {
  value: number
  label: string
  hint?: string
}

const props = withDefaults(
  defineProps<{
    id: string
    modelValue: number
    options: ComboboxOption[]
    placeholder?: string
    inputClass?: string
  }>(),
  { placeholder: 'Escribe para buscar...', inputClass: '' },
)
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const root = ref<HTMLElement | null>(null)
const query = ref('')
const open = ref(false)
const active = ref(0)
const typing = ref(false)

const selected = computed(() => props.options.find((item) => item.value === props.modelValue))
const filtered = computed(() => {
  const term = normalize(query.value)
  if (!typing.value || !term) return props.options
  return props.options.filter((item) =>
    normalize(`${item.label} ${item.hint ?? ''}`).includes(term),
  )
})

watch(
  selected,
  (item) => {
    if (!typing.value) query.value = item?.label ?? ''
  },
  { immediate: true },
)

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

function openList(): void {
  open.value = true
  const index = filtered.value.findIndex((item) => item.value === props.modelValue)
  active.value = Math.max(0, index)
}

function closeList(): void {
  open.value = false
  typing.value = false
  query.value = selected.value?.label ?? ''
}

function onInput(): void {
  typing.value = true
  open.value = true
  active.value = 0
}

function move(step: number): void {
  if (!open.value) return openList()
  const count = filtered.value.length
  if (count) active.value = (active.value + step + count) % count
}

function choose(item: ComboboxOption): void {
  emit('update:modelValue', item.value)
  typing.value = false
  query.value = item.label
  open.value = false
}

function chooseActive(): void {
  const item = filtered.value[active.value]
  if (open.value && item) choose(item)
}

function onBlur(): void {
  closeList()
}
</script>
