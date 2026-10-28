import type { PaymentType, TerminationType } from '@/modules/employees/types/employee.types'

export const paymentTypeLabels: Record<PaymentType, string> = {
  EFECTIVO: 'Efectivo',
  CHEQUE: 'Cheque',
  TRANSFERENCIA: 'Transferencia',
}

export const terminationTypeLabels: Record<TerminationType, string> = {
  RENUNCIA: 'Renuncia',
  DESPIDO: 'Despido',
  FIN_CONTRATO: 'Fin de contrato',
  OTRO: 'Otro',
}

export function todayIso(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}
