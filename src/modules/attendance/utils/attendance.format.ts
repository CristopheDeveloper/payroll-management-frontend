import type { AttendanceStatus } from '@/modules/attendance/types/attendance.types'

export const statusOptions: { value: AttendanceStatus; label: string }[] = [
  { value: 'PRESENTE', label: 'Presente' },
  { value: 'FALTA', label: 'Falta' },
  { value: 'PERMISO', label: 'Permiso' },
  { value: 'SUSPENSION_IGSS', label: 'Suspensión IGSS' },
]

export const statusLabels = Object.fromEntries(
  statusOptions.map((option) => [option.value, option.label]),
) as Record<AttendanceStatus, string>

export const statusClasses: Record<AttendanceStatus, string> = {
  PRESENTE: 'bg-emerald-50 text-emerald-700',
  FALTA: 'bg-red-50 text-red-700',
  PERMISO: 'bg-amber-50 text-amber-700',
  SUSPENSION_IGSS: 'bg-slate-200 text-slate-700',
}

export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function todayIso(): string {
  return toIsoDate(new Date())
}

export function formatDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split('-')
  return `${day}/${month}/${year}`
}

export function formatLongDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  const text = new Intl.DateTimeFormat('es-GT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(year ?? 2000, (month ?? 1) - 1, day ?? 1))
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`
}
