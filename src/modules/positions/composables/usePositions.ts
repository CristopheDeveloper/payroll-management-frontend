import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import * as positionService from '@/modules/positions/services/position.service'

export const positionKeys = {
  all: ['positions'] as const,
  lists: () => [...positionKeys.all, 'list'] as const,
  detail: (id: number) => [...positionKeys.all, 'detail', id] as const,
}

export function usePositionsQuery() {
  return useQuery({
    queryKey: positionKeys.lists(),
    queryFn: positionService.getPositions,
  })
}

export function usePositionMutations() {
  const queryClient = useQueryClient()
  const invalidatePositions = () => queryClient.invalidateQueries({ queryKey: positionKeys.all })

  const createMutation = useMutation({
    mutationFn: positionService.createPosition,
    onSuccess: invalidatePositions,
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: Parameters<typeof positionService.updatePosition>[1]
    }) => positionService.updatePosition(id, payload),
    onSuccess: invalidatePositions,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, activate }: { id: number; activate: boolean }) =>
      activate ? positionService.activatePosition(id) : positionService.deactivatePosition(id),
    onSuccess: invalidatePositions,
  })

  return { createMutation, updateMutation, statusMutation }
}
