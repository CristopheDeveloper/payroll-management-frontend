import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import * as employeeService from '@/modules/employees/services/employee.service'
import type {
  RehireEmployeeRequest,
  SaveEmployeeRequest,
  TerminateEmployeeRequest,
} from '@/modules/employees/types/employee.types'

export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  detail: (id: number) => [...employeeKeys.all, 'detail', id] as const,
  payments: (id: number) => [...employeeKeys.detail(id), 'payments'] as const,
  defaultBonus: () => [...employeeKeys.all, 'default-bonus'] as const,
  minimumWage: () => [...employeeKeys.all, 'minimum-wage'] as const,
}

export function useEmployeesQuery() {
  return useQuery({
    queryKey: employeeKeys.lists(),
    queryFn: employeeService.getEmployees,
  })
}

export function useMinimumWageQuery() {
  return useQuery({
    queryKey: employeeKeys.minimumWage(),
    queryFn: employeeService.getMinimumWage,
    staleTime: 5 * 60 * 1000,
  })
}

export function useDefaultBonusQuery(enabled: MaybeRefOrGetter<boolean>) {
  return useQuery({
    queryKey: employeeKeys.defaultBonus(),
    queryFn: employeeService.getDefaultBonus,
    enabled: computed(() => toValue(enabled)),
  })
}

export function useEmployeeQuery(id: MaybeRefOrGetter<number>, enabled: MaybeRefOrGetter<boolean>) {
  return useQuery({
    queryKey: computed(() => employeeKeys.detail(toValue(id))),
    queryFn: () => employeeService.getEmployee(toValue(id)),
    enabled: computed(() => toValue(enabled)),
  })
}

export function useEmployeePaymentsQuery(
  id: MaybeRefOrGetter<number>,
  enabled: MaybeRefOrGetter<boolean>,
) {
  return useQuery({
    queryKey: computed(() => employeeKeys.payments(toValue(id))),
    queryFn: () => employeeService.getEmployeePayments(toValue(id)),
    enabled: computed(() => toValue(enabled)),
  })
}

export function useEmployeeMutations() {
  const queryClient = useQueryClient()
  const invalidateEmployees = () => queryClient.invalidateQueries({ queryKey: employeeKeys.all })

  const createMutation = useMutation({
    mutationFn: employeeService.createEmployee,
    onSuccess: invalidateEmployees,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SaveEmployeeRequest }) =>
      employeeService.updateEmployee(id, payload),
    onSuccess: invalidateEmployees,
  })

  const terminateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TerminateEmployeeRequest }) =>
      employeeService.terminateEmployee(id, payload),
    onSuccess: invalidateEmployees,
  })

  const rehireMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: RehireEmployeeRequest }) =>
      employeeService.rehireEmployee(id, payload),
    onSuccess: invalidateEmployees,
  })

  const hireDateMutation = useMutation({
    mutationFn: ({ id, fechaIngreso }: { id: number; fechaIngreso: string }) =>
      employeeService.correctHireDate(id, fechaIngreso),
    onSuccess: invalidateEmployees,
  })

  const photoMutation = useMutation({
    mutationFn: ({ id, photo }: { id: number; photo: File }) =>
      employeeService.uploadEmployeePhoto(id, photo),
    onSuccess: invalidateEmployees,
  })

  const deletePhotoMutation = useMutation({
    mutationFn: employeeService.deleteEmployeePhoto,
    onSuccess: invalidateEmployees,
  })

  return {
    createMutation,
    updateMutation,
    terminateMutation,
    rehireMutation,
    hireDateMutation,
    photoMutation,
    deletePhotoMutation,
  }
}
