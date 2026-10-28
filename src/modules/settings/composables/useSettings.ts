import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import * as settingsService from '@/modules/settings/services/settings.service'
import type { UpdateParameterRequest } from '@/modules/settings/types/settings.types'

export const settingsKeys = {
  all: ['settings'] as const,
  parameters: () => [...settingsKeys.all, 'parameters'] as const,
}

export function useParametersQuery(enabled: MaybeRefOrGetter<boolean>) {
  return useQuery({
    queryKey: settingsKeys.parameters(),
    queryFn: settingsService.getParameters,
    enabled: computed(() => toValue(enabled)),
  })
}

export function useParameterMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateParameterRequest }) =>
      settingsService.updateParameter(id, payload),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: settingsKeys.all })
      void queryClient.invalidateQueries({ queryKey: ['employees', 'default-bonus'] })
    },
  })
}
