import type { ReportDefinition, ReportFilters } from '@/modules/reports/types/report.types'

const planillaBase = (filters: ReportFilters) => `/Reporte/planilla/${filters.planilla}`

const generic = (url: string, params: Record<string, string | number>) => [
  { label: 'PDF', url, params: { ...params, formato: 'pdf' } },
  { label: 'Excel', url, params: { ...params, formato: 'excel' } },
]

const optional = (values: Record<string, string | number>) =>
  Object.fromEntries(Object.entries(values).filter(([, value]) => value !== '' && value !== 0))

export const reportCatalog: ReportDefinition[] = [
  {
    key: 'planilla-general',
    group: 'Planilla',
    title: 'Planilla general',
    filters: ['planilla'],
    required: ['planilla'],
    downloads: (f) => [
      { label: 'PDF', url: `/Reporte/${f.planilla}/planilla/pdf` },
      { label: 'Excel', url: `/Reporte/${f.planilla}/planilla/excel` },
    ],
  },
  {
    key: 'boletas',
    group: 'Planilla',
    title: 'Boletas de pago',
    filters: ['planilla', 'empleadoPlanilla'],
    required: ['planilla'],
    downloads: (f) => [
      {
        label: 'PDF',
        url: `/Reporte/${f.planilla}/boletas/pdf`,
        params: optional({ idEmpleado: f.empleadoPlanilla }),
      },
    ],
  },
  {
    key: 'forma-pago',
    group: 'Planilla',
    title: 'Pagos por forma de pago',
    filters: ['planilla', 'tipoPago'],
    required: ['planilla'],
    downloads: (f) => generic(`${planillaBase(f)}/forma-pago`, { tipoPago: f.tipoPago }),
  },
  {
    key: 'rubros',
    group: 'Planilla',
    title: 'Rubros de la planilla',
    filters: ['planilla', 'rubro'],
    required: ['planilla'],
    downloads: (f) => generic(`${planillaBase(f)}/rubros`, optional({ idRubro: f.rubro })),
  },
  {
    key: 'igss',
    group: 'Planilla',
    title: 'Cuota IGSS',
    filters: ['planilla'],
    required: ['planilla'],
    downloads: (f) => generic(`${planillaBase(f)}/igss`, {}),
  },
  {
    key: 'poliza',
    group: 'Planilla',
    title: 'Póliza contable',
    filters: ['planilla'],
    required: ['planilla'],
    downloads: (f) => generic(`${planillaBase(f)}/poliza`, {}),
  },
  {
    key: 'empleados',
    group: 'Empleados',
    title: 'Listado de empleados',
    filters: ['estado', 'departamento', 'puesto'],
    required: [],
    downloads: (f) =>
      generic(
        '/Reporte/empleados',
        optional({ estado: f.estado, idDepartamento: f.departamento, idPuesto: f.puesto }),
      ),
  },
  {
    key: 'altas-bajas',
    group: 'Empleados',
    title: 'Altas y bajas',
    filters: ['desde', 'hasta'],
    required: ['desde', 'hasta'],
    downloads: (f) => generic('/Reporte/altas-bajas', { desde: f.desde, hasta: f.hasta }),
  },
  {
    key: 'historial',
    group: 'Empleados',
    title: 'Historial de pagos',
    filters: ['empleado', 'desde', 'hasta'],
    required: ['empleado'],
    downloads: (f) =>
      generic(`/Reporte/historial/${f.empleado}`, optional({ desde: f.desde, hasta: f.hasta })),
  },
  {
    key: 'asistencia',
    group: 'Asistencia',
    title: 'Asistencia del mes',
    filters: ['mes', 'departamento'],
    required: ['mes'],
    downloads: (f) => generic('/Reporte/asistencia', monthParams(f)),
  },
]

function monthParams(f: ReportFilters): Record<string, string | number> {
  const [anio, mes] = f.mes.split('-').map(Number)
  return optional({ anio: anio ?? 0, mes: mes ?? 0, idDepartamento: f.departamento })
}
