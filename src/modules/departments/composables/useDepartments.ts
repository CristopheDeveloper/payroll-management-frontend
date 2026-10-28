import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import * as departmentService from '@/modules/departments/services/department.service'

export const departmentKeys = {
  all: ['departments'] as const,
  lists: () => [...departmentKeys.all, 'list'] as const,
  detail: (id: number) => [...departmentKeys.all, 'detail', id] as const,
}

export function useDepartmentsQuery() {
  return useQuery({
    queryKey: departmentKeys.lists(),
    queryFn: departmentService.getDepartments,
  })
}

export function useDepartmentMutations() {
  const queryClient = useQueryClient()
  const invalidateDepartments = () =>
    queryClient.invalidateQueries({ queryKey: departmentKeys.all })

  const createMutation = useMutation({
    mutationFn: departmentService.createDepartment,
    onSuccess: invalidateDepartments,
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: Parameters<typeof departmentService.updateDepartment>[1]
    }) => departmentService.updateDepartment(id, payload),
    onSuccess: invalidateDepartments,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, activate }: { id: number; activate: boolean }) =>
      activate
        ? departmentService.activateDepartment(id)
        : departmentService.deactivateDepartment(id),
    onSuccess: invalidateDepartments,
  })

  return { createMutation, updateMutation, statusMutation }
}
