import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import * as conceptService from '@/modules/concepts/services/concept.service'
import type { UpdateConceptRequest } from '@/modules/concepts/types/concept.types'

export const conceptKeys = {
  all: ['concepts'] as const,
  lists: () => [...conceptKeys.all, 'list'] as const,
}

export function useConceptsQuery() {
  return useQuery({
    queryKey: conceptKeys.lists(),
    queryFn: conceptService.getConcepts,
  })
}

export function useConceptMutations() {
  const queryClient = useQueryClient()
  const invalidateConcepts = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: conceptKeys.all }),
      queryClient.invalidateQueries({ queryKey: ['payrolls', 'concepts'] }),
    ])

  const createMutation = useMutation({
    mutationFn: conceptService.createConcept,
    onSuccess: invalidateConcepts,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateConceptRequest }) =>
      conceptService.updateConcept(id, payload),
    onSuccess: invalidateConcepts,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, activate }: { id: number; activate: boolean }) =>
      activate ? conceptService.activateConcept(id) : conceptService.deactivateConcept(id),
    onSuccess: invalidateConcepts,
  })

  return { createMutation, updateMutation, statusMutation }
}
