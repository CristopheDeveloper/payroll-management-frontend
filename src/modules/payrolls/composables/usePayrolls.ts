import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import * as payrollService from '@/modules/payrolls/services/payroll.service'
import type {
  EditPayrollRequest,
  SaveEmployeeDataRequest,
  SaveVariableRequest,
} from '@/modules/payrolls/types/payroll.types'

export const payrollKeys = {
  all: ['payrolls'] as const,
  lists: () => [...payrollKeys.all, 'list'] as const,
  types: () => [...payrollKeys.all, 'types'] as const,
  concepts: () => [...payrollKeys.all, 'concepts'] as const,
  detail: (id: number) => [...payrollKeys.all, 'detail', id] as const,
  employees: (id: number) => [...payrollKeys.detail(id), 'employees'] as const,
  summary: (id: number) => [...payrollKeys.detail(id), 'summary'] as const,
}

export function usePayrollsQuery() {
  return useQuery({
    queryKey: payrollKeys.lists(),
    queryFn: payrollService.getPayrolls,
  })
}

export function usePayrollTypesQuery() {
  return useQuery({
    queryKey: payrollKeys.types(),
    queryFn: payrollService.getPayrollTypes,
    staleTime: 30 * 60 * 1000,
  })
}

export function usePayrollQuery(id: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: computed(() => payrollKeys.detail(toValue(id))),
    queryFn: () => payrollService.getPayroll(toValue(id)),
  })
}

export function usePayrollEmployeesQuery(
  id: MaybeRefOrGetter<number>,
  enabled: MaybeRefOrGetter<boolean>,
) {
  return useQuery({
    queryKey: computed(() => payrollKeys.employees(toValue(id))),
    queryFn: () => payrollService.getPayrollEmployees(toValue(id)),
    enabled: computed(() => toValue(enabled)),
  })
}

export function useConceptSummaryQuery(
  id: MaybeRefOrGetter<number>,
  enabled: MaybeRefOrGetter<boolean>,
) {
  return useQuery({
    queryKey: computed(() => payrollKeys.summary(toValue(id))),
    queryFn: () => payrollService.getConceptSummary(toValue(id)),
    enabled: computed(() => toValue(enabled)),
  })
}

export function useManualConceptsQuery(enabled: MaybeRefOrGetter<boolean>) {
  return useQuery({
    queryKey: payrollKeys.concepts(),
    queryFn: payrollService.getManualConcepts,
    enabled: computed(() => toValue(enabled)),
    staleTime: 5 * 60 * 1000,
  })
}

export function usePayrollMutations() {
  const queryClient = useQueryClient()
  const invalidatePayrolls = () => queryClient.invalidateQueries({ queryKey: payrollKeys.all })

  const createMutation = useMutation({
    mutationFn: payrollService.createPayroll,
    onSuccess: invalidatePayrolls,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: EditPayrollRequest }) =>
      payrollService.updatePayroll(id, payload),
    onSuccess: invalidatePayrolls,
  })

  const deleteMutation = useMutation({
    mutationFn: payrollService.deletePayroll,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: payrollKeys.lists() }),
  })

  const prepareMutation = useMutation({
    mutationFn: payrollService.preparePayroll,
    onSuccess: invalidatePayrolls,
  })

  const generateMutation = useMutation({
    mutationFn: payrollService.generatePayroll,
    onSuccess: invalidatePayrolls,
  })

  const backMutation = useMutation({
    mutationFn: payrollService.backToPrepared,
    onSuccess: invalidatePayrolls,
  })

  const closeMutation = useMutation({
    mutationFn: ({ id, version }: { id: number; version: string }) =>
      payrollService.closePayroll(id, version),
    onSettled: invalidatePayrolls,
  })

  const reopenMutation = useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo: string }) =>
      payrollService.reopenPayroll(id, motivo),
    onSuccess: invalidatePayrolls,
  })

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    prepareMutation,
    generateMutation,
    backMutation,
    closeMutation,
    reopenMutation,
  }
}

export function usePayrollDataMutations(idNomina: MaybeRefOrGetter<number>) {
  const queryClient = useQueryClient()
  const invalidatePayroll = () =>
    queryClient.invalidateQueries({ queryKey: payrollKeys.detail(toValue(idNomina)) })

  const employeeMutation = useMutation({
    mutationFn: ({
      idEmpleado,
      payload,
    }: {
      idEmpleado: number
      payload: SaveEmployeeDataRequest
    }) => payrollService.saveEmployeeData(toValue(idNomina), idEmpleado, payload),
    onSuccess: invalidatePayroll,
  })

  const variableMutation = useMutation({
    mutationFn: (payload: SaveVariableRequest) =>
      payrollService.saveVariable(toValue(idNomina), payload),
    onSuccess: invalidatePayroll,
  })

  const importMutation = useMutation({
    mutationFn: (variables: SaveVariableRequest[]) =>
      payrollService.importVariables(toValue(idNomina), variables),
    onSuccess: invalidatePayroll,
  })

  return { employeeMutation, variableMutation, importMutation }
}
