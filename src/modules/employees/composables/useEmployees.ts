import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import * as employeeService from '@/modules/employees/services/employee.service'

export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: number) => [...employeeKeys.details(), id] as const,
  departments: () => [...employeeKeys.all, 'departments'] as const,
  positions: () => [...employeeKeys.all, 'positions'] as const,
}

export function useEmployeesQuery() {
  return useQuery({
    queryKey: employeeKeys.lists(),
    queryFn: () => employeeService.getEmployees(),
  })
}

export function useEmployeeQuery(id: number) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => employeeService.getEmployee(id),
    enabled: id > 0,
  })
}

export function useDepartmentsQuery() {
  return useQuery({
    queryKey: employeeKeys.departments(),
    queryFn: employeeService.getDepartments,
    staleTime: 30 * 60 * 1000,
  })
}

export function usePositionsQuery() {
  return useQuery({
    queryKey: employeeKeys.positions(),
    queryFn: employeeService.getPositions,
    staleTime: 30 * 60 * 1000,
  })
}

export function useEmployeeMutations() {
  const queryClient = useQueryClient()

  const invalidateEmployees = () =>
    queryClient.invalidateQueries({ queryKey: employeeKeys.all })

  const createMutation = useMutation({
    mutationFn: employeeService.createEmployee,
    onSuccess: invalidateEmployees,
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: Parameters<typeof employeeService.updateEmployee>[1]
    }) => employeeService.updateEmployee(id, payload),
    onSuccess: invalidateEmployees,
  })

  const terminateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: Parameters<typeof employeeService.terminateEmployee>[1]
    }) => employeeService.terminateEmployee(id, payload),
    onSuccess: invalidateEmployees,
  })

  const rehireMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: Parameters<typeof employeeService.rehireEmployee>[1]
    }) => employeeService.rehireEmployee(id, payload),
    onSuccess: invalidateEmployees,
  })

  const correctStartDateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: Parameters<typeof employeeService.correctCurrentPeriodStartDate>[1]
    }) => employeeService.correctCurrentPeriodStartDate(id, payload),
    onSuccess: invalidateEmployees,
  })

  return {
    createMutation,
    updateMutation,
    terminateMutation,
    rehireMutation,
    correctStartDateMutation,
  }
}
