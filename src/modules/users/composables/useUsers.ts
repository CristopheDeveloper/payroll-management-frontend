import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import * as userService from '@/modules/users/services/user.service'

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  detail: (id: number) => [...userKeys.all, 'detail', id] as const,
  roles: () => [...userKeys.all, 'roles'] as const,
}

export function useUsersQuery() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: userService.getUsers,
  })
}

export function useRolesQuery() {
  return useQuery({
    queryKey: userKeys.roles(),
    queryFn: userService.getRoles,
    staleTime: 30 * 60 * 1000,
  })
}

export function useUserMutations() {
  const queryClient = useQueryClient()
  const invalidateUsers = () => queryClient.invalidateQueries({ queryKey: userKeys.all })

  const createMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: invalidateUsers,
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: Parameters<typeof userService.updateUser>[1]
    }) => userService.updateUser(id, payload),
    onSuccess: invalidateUsers,
  })

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, contrasena }: { id: number; contrasena: string }) =>
      userService.resetPassword(id, { contrasena }),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, activate }: { id: number; activate: boolean }) =>
      activate ? userService.activateUser(id) : userService.deactivateUser(id),
    onSuccess: invalidateUsers,
  })

  return { createMutation, updateMutation, resetPasswordMutation, statusMutation }
}
