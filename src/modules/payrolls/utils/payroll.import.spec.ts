import { describe, expect, it } from 'vitest'
import type { PayrollConcept, PayrollEmployee } from '@/modules/payrolls/types/payroll.types'
import {
  importTemplate,
  parseAmount,
  parseClipboard,
} from '@/modules/payrolls/utils/payroll.import'

function employee(id: number, code: string, extra: Partial<PayrollEmployee> = {}): PayrollEmployee {
  return {
    idNominaEmpleado: id,
    idEmpleado: id,
    codigoEmpleado: code,
    nombreCompleto: `Empleado ${id}`,
    idPuesto: 1,
    nombrePuesto: null,
    idDepartamento: 1,
    nombreDepartamento: null,
    salario: 5000,
    retencionIsr: 0,
    bonificacionIncentivo: 250,
    tipoPago: 'TRANSFERENCIA',
    banco: null,
    cuentaBancaria: null,
    diasPeriodo: 30,
    diasFalta: 0,
    diasSuspension: 0,
    diasPagarSugeridos: 30,
    diasPagar: 30,
    horasExtraSugeridas: 0,
    horasExtra: 0,
    isr: 0,
    datosAjustados: false,
    totalIngresos: 0,
    totalDescuentos: 0,
    liquido: 0,
    totalPatronal: 0,
    valores: [],
    rubros: [],
    advertencias: [],
    ...extra,
  }
}

const employees = [
  employee(1, 'EMP-0001', {
    valores: [
      {
        idRubro: 10,
        codigoRubro: 'COMISION',
        nombreRubro: 'Comisión por ventas',
        tipo: 'INGRESO',
        monto: 50,
        descripcion: 'Septiembre',
      },
    ],
  }),
  employee(2, 'EMP-0002', { diasPeriodo: 15 }),
]
const concepts: PayrollConcept[] = [
  {
    idRubro: 10,
    codigo: 'COMISION',
    nombre: 'Comisión por ventas',
    tipo: 'INGRESO',
    origen: 'MANUAL',
    afectoIgss: true,
    orden: 100,
    activo: true,
  },
  {
    idRubro: 20,
    codigo: 'ANTICIPO',
    nombre: 'Anticipo',
    tipo: 'DESCUENTO',
    origen: 'MANUAL',
    afectoIgss: false,
    orden: 200,
    activo: true,
  },
]

describe('parseAmount', () => {
  it('reads the formats Excel copies', () => {
    expect(parseAmount('1,250.50')).toBe(1250.5)
    expect(parseAmount('Q 300')).toBe(300)
    expect(parseAmount('12,5')).toBe(12.5)
    expect(parseAmount('  ')).toBeNull()
    expect(parseAmount('abc')).toBeUndefined()
  })
})

describe('parseClipboard', () => {
  it('builds one request per column, matching names without accents and numeric codes', () => {
    const text =
      'Código\tDIAS TRABAJADOS\tcomision por ventas\tANTICIPO\r\nEMP-0001\t28\t1,000.00\t\r\n2\t15\t\t200\r\n'
    const result = parseClipboard(text, employees, concepts)

    expect(result.errors).toEqual([])
    expect(result.valueCount).toBe(4)
    expect(result.requests).toEqual([
      {
        variable: 'DIAS_PAGAR',
        idRubro: null,
        valores: [
          { idEmpleado: 1, valor: 28, descripcion: null },
          { idEmpleado: 2, valor: 15, descripcion: null },
        ],
      },
      {
        variable: 'RUBRO',
        idRubro: 10,
        valores: [{ idEmpleado: 1, valor: 1000, descripcion: 'Septiembre' }],
      },
      {
        variable: 'RUBRO',
        idRubro: 20,
        valores: [{ idEmpleado: 2, valor: 200, descripcion: null }],
      },
    ])
  })

  it('reports unknown columns, unknown employees and invalid values', () => {
    const text = 'Código\tDías\tBono raro\nEMP-0009\t10\t5\nEMP-0002\t20\tx\nEMP-0002\t1.5\t'
    const result = parseClipboard(text, employees, concepts)

    expect(result.errors).toEqual([
      'No existe la variable "Bono raro".',
      'Fila 2: el empleado "EMP-0009" no está en la planilla.',
      'Fila 3, Días trabajados: máximo 15 días.',
      'Fila 4: el empleado EMP-0002 está repetido.',
      'Fila 4, Días trabajados: los días deben ser un número entero.',
    ])
  })

  it('creates a template with the employee codes in the first column', () => {
    expect(importTemplate(employees, concepts).split('\n')).toEqual([
      'Código\tDías trabajados\tHoras extra\tISR\tComisión por ventas\tAnticipo',
      'EMP-0001',
      'EMP-0002',
    ])
  })
})
