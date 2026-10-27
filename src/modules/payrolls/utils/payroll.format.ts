import type { ConceptType, PayrollStatus } from '@/modules/payrolls/types/payroll.types'

const currencyFormatter = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' })
const monthFormatter = new Intl.DateTimeFormat('es-GT', { month: 'long' })
const dateTimeFormatter = new Intl.DateTimeFormat('es-GT', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const numberFormatter = new Intl.NumberFormat('es-GT', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const statusLabels: Record<PayrollStatus, string> = {
  CREADA: 'Creada',
  PREPARADA: 'Preparada',
  GENERADA: 'Generada',
  CERRADA: 'Cerrada',
}

export const conceptTypeLabels: Record<ConceptType, string> = {
  INGRESO: 'Ingreso',
  DESCUENTO: 'Descuento',
  PATRONAL: 'Patronal',
}

export function formatMoney(value: number | null | undefined): string {
  return currencyFormatter.format(Number(value ?? 0))
}

export function formatAmount(value: number | null | undefined): string {
  return numberFormatter.format(Number(value ?? 0))
}

export function formatPeriod(year: number, month: number): string {
  const name = monthFormatter.format(new Date(year, month - 1, 1))
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${year}`
}

export function formatDate(value: string | null): string {
  if (!value) return '—'
  const [year, month, day] = value.slice(0, 10).split('-')
  return `${day}/${month}/${year}`
}

export function formatDateTime(value: string | null): string {
  if (!value) return '—'
  return dateTimeFormatter.format(new Date(value))
}
