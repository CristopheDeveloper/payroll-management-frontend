import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import * as attendanceService from '@/modules/attendance/services/attendance.service'

export const attendanceKeys = {
  all: ['attendance'] as const,
  day: (fecha: string) => [...attendanceKeys.all, 'day', fecha] as const,
  summary: (anio: number, mes: number) => [...attendanceKeys.all, 'summary', anio, mes] as const,
  records: (idEmpleado: number, anio: number, mes: number) =>
    [...attendanceKeys.all, 'records', idEmpleado, anio, mes] as const,
  employees: () => [...attendanceKeys.all, 'employees'] as const,
}

export function useDayQuery(fecha: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => attendanceKeys.day(toValue(fecha))),
    queryFn: () => attendanceService.getDay(toValue(fecha)),
  })
}

export function useSummaryQuery(
  anio: MaybeRefOrGetter<number>,
  mes: MaybeRefOrGetter<number>,
  enabled: MaybeRefOrGetter<boolean>,
) {
  return useQuery({
    queryKey: computed(() => attendanceKeys.summary(toValue(anio), toValue(mes))),
    queryFn: () => attendanceService.getSummary(toValue(anio), toValue(mes)),
    enabled: computed(() => toValue(enabled)),
  })
}

export function useEmployeeRecordsQuery(
  idEmpleado: MaybeRefOrGetter<number>,
  anio: MaybeRefOrGetter<number>,
  mes: MaybeRefOrGetter<number>,
  enabled: MaybeRefOrGetter<boolean>,
) {
  return useQuery({
    queryKey: computed(() =>
      attendanceKeys.records(toValue(idEmpleado), toValue(anio), toValue(mes)),
    ),
    queryFn: () =>
      attendanceService.getEmployeeRecords(toValue(idEmpleado), toValue(anio), toValue(mes)),
    enabled: computed(() => toValue(enabled) && toValue(idEmpleado) > 0),
  })
}

export function useAttendanceEmployeesQuery(enabled: MaybeRefOrGetter<boolean>) {
  return useQuery({
    queryKey: attendanceKeys.employees(),
    queryFn: attendanceService.getEmployees,
    enabled: computed(() => toValue(enabled)),
    staleTime: 5 * 60 * 1000,
  })
}

export function useAttendanceMutations() {
  const queryClient = useQueryClient()
  const invalidateAttendance = () => queryClient.invalidateQueries({ queryKey: attendanceKeys.all })

  const saveDayMutation = useMutation({
    mutationFn: attendanceService.saveDay,
    onSuccess: invalidateAttendance,
  })

  const rangeMutation = useMutation({
    mutationFn: attendanceService.registerRange,
    onSuccess: invalidateAttendance,
  })

  const deleteMutation = useMutation({
    mutationFn: attendanceService.deleteRecord,
    onSuccess: invalidateAttendance,
  })

  return { saveDayMutation, rangeMutation, deleteMutation }
}
