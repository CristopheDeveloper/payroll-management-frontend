import type {
  PayrollConcept,
  PayrollEmployee,
  PayrollVariable,
  SaveVariableRequest,
} from '@/modules/payrolls/types/payroll.types'

export interface ImportColumn {
  header: string
  label: string
  variable: PayrollVariable
  idRubro: number | null
}

export interface ImportRow {
  line: number
  code: string
  employee: PayrollEmployee | null
  cells: string[]
  values: (number | null)[]
}

export interface ImportResult {
  columns: (ImportColumn | null)[]
  rows: ImportRow[]
  errors: string[]
  requests: SaveVariableRequest[]
  valueCount: number
}

const baseVariables: { variable: PayrollVariable; label: string; aliases: string[] }[] = [
  {
    variable: 'DIAS_PAGAR',
    label: 'Días trabajados',
    aliases: ['DIAS', 'DIASTRABAJADOS', 'DIASLABORADOS', 'DIASAPAGAR', 'DIASPAGAR'],
  },
  {
    variable: 'HORAS_EXTRA',
    label: 'Horas extra',
    aliases: ['HORASEXTRA', 'HORASEXTRAS', 'HE'],
  },
  { variable: 'ISR', label: 'ISR', aliases: ['ISR', 'RETENCIONISR'] },
]

export function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
}

export function parseAmount(raw: string): number | null | undefined {
  const text = raw.replace(/[Q\s ]/gi, '')
  if (!text) return null
  let clean = text
  if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(text)) clean = text.replace(/,/g, '')
  else if (/^-?\d+,\d{1,2}$/.test(text)) clean = text.replace(',', '.')
  if (!/^-?\d+(\.\d+)?$/.test(clean)) return undefined
  return Number(clean)
}

export function importTemplate(employees: PayrollEmployee[], concepts: PayrollConcept[]): string {
  const headers = [
    'Código',
    ...baseVariables.map((item) => item.label),
    ...concepts.filter((concept) => concept.activo).map((concept) => concept.nombre),
  ]
  return [headers, ...employees.map((row) => [row.codigoEmpleado])]
    .map((cells) => cells.join('\t'))
    .join('\n')
}

function findColumn(header: string, concepts: PayrollConcept[]): ImportColumn | null {
  const key = normalize(header)
  const base = baseVariables.find((item) => item.aliases.includes(key))
  if (base) return { header, label: base.label, variable: base.variable, idRubro: null }
  const concept = concepts.find(
    (item) => normalize(item.codigo) === key || normalize(item.nombre) === key,
  )
  if (concept) return { header, label: concept.nombre, variable: 'RUBRO', idRubro: concept.idRubro }
  return null
}

function findEmployee(code: string, employees: PayrollEmployee[]): PayrollEmployee | null {
  const key = normalize(code)
  const exact = employees.find((row) => normalize(row.codigoEmpleado) === key)
  if (exact || !/^\d+$/.test(key)) return exact ?? null
  return (
    employees.find((row) => Number(row.codigoEmpleado.replace(/\D/g, '')) === Number(key)) ?? null
  )
}

export function parseClipboard(
  text: string,
  employees: PayrollEmployee[],
  concepts: PayrollConcept[],
): ImportResult {
  const result: ImportResult = { columns: [], rows: [], errors: [], requests: [], valueCount: 0 }
  const lines = text
    .split(/\r?\n/)
    .map((line, index) => ({ line: index + 1, cells: line.split('\t') }))
    .filter((item) => item.cells.some((cell) => cell.trim()))
  if (lines.length === 0) return result
  if (lines.length === 1) {
    result.errors.push('Falta al menos una fila de empleados debajo de los encabezados.')
    return result
  }

  const [header, ...data] = lines
  const width = Math.max(...lines.map((item) => item.cells.length))
  for (let index = 1; index < width; index++) {
    const name = header!.cells[index]?.trim() ?? ''
    const hasData = data.some((item) => item.cells[index]?.trim())
    if (!name) {
      result.columns.push(null)
      if (hasData) result.errors.push(`La columna ${index + 1} tiene datos pero no tiene nombre.`)
      continue
    }
    const column = findColumn(name, concepts)
    result.columns.push(column)
    if (!column) result.errors.push(`No existe la variable "${name}".`)
  }
  const used = new Map<string, string>()
  for (const column of result.columns) {
    if (!column) continue
    const key = `${column.variable}-${column.idRubro ?? ''}`
    if (used.has(key))
      result.errors.push(`"${used.get(key)}" y "${column.header}" son la misma variable.`)
    else used.set(key, column.header)
  }

  const seen = new Set<number>()
  for (const item of data) {
    const code = item.cells[0]?.trim() ?? ''
    const employee = code ? findEmployee(code, employees) : null
    const row: ImportRow = {
      line: item.line,
      code,
      employee,
      cells: item.cells.slice(1),
      values: [],
    }
    if (!code) result.errors.push(`Fila ${item.line}: falta el código del empleado.`)
    else if (!employee)
      result.errors.push(`Fila ${item.line}: el empleado "${code}" no está en la planilla.`)
    else if (seen.has(employee.idEmpleado))
      result.errors.push(`Fila ${item.line}: el empleado ${employee.codigoEmpleado} está repetido.`)
    else seen.add(employee.idEmpleado)

    result.columns.forEach((column, index) => {
      const raw = item.cells[index + 1] ?? ''
      const value = parseAmount(raw)
      row.values.push(value ?? null)
      if (!column || value === null) return
      const where = `Fila ${item.line}, ${column.label}`
      if (value === undefined) result.errors.push(`${where}: "${raw.trim()}" no es un número.`)
      else if (value < 0) result.errors.push(`${where}: no puede ser negativo.`)
      else if (column.variable === 'DIAS_PAGAR' && !Number.isInteger(value))
        result.errors.push(`${where}: los días deben ser un número entero.`)
      else if (column.variable === 'DIAS_PAGAR' && employee && value > employee.diasPeriodo)
        result.errors.push(`${where}: máximo ${employee.diasPeriodo} días.`)
      else if (column.variable === 'HORAS_EXTRA' && value > 999.99)
        result.errors.push(`${where}: máximo 999.99 horas.`)
      else if (value > 999999.99) result.errors.push(`${where}: máximo 999,999.99.`)
    })
    result.rows.push(row)
  }

  result.columns.forEach((column, index) => {
    if (!column) return
    const valores = result.rows
      .filter((row) => row.employee && row.values[index] !== null)
      .map((row) => ({
        idEmpleado: row.employee!.idEmpleado,
        valor: row.values[index]!,
        descripcion:
          column.variable === 'RUBRO'
            ? (row.employee!.valores.find((value) => value.idRubro === column.idRubro)
                ?.descripcion ?? null)
            : null,
      }))
    if (valores.length)
      result.requests.push({ variable: column.variable, idRubro: column.idRubro, valores })
    result.valueCount += valores.length
  })
  return result
}
