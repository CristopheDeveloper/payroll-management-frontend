import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import { definePreset } from '@primeuix/themes'

import App from './App.vue'
import router from './router'
import { hideLoading } from '@/composables/useLoading'

import './assets/css/main.css'
import 'primeicons/primeicons.css'

const app = createApp(App)
const payrollPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#fa6900',
      600: '#d95800',
      700: '#b94700',
      800: '#933b0b',
      900: '#78350f',
      950: '#431407',
    },
  },
})
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

app.use(createPinia())
app.use(VueQueryPlugin, { queryClient })
app.use(PrimeVue, {
  theme: {
    preset: payrollPreset,
    options: {
      darkModeSelector: false,
      cssLayer: {
        name: 'primevue',
        order: 'theme, base, primevue',
      },
    },
  },
  locale: {
    startsWith: 'Comienza con',
    contains: 'Contiene',
    notContains: 'No contiene',
    endsWith: 'Termina con',
    equals: 'Igual a',
    notEquals: 'Diferente de',
    noFilter: 'Sin filtro',
    filter: 'Filtrar',
    clear: 'Limpiar',
    apply: 'Aplicar',
    matchAll: 'Coincidir con todos',
    matchAny: 'Coincidir con cualquiera',
    addRule: 'Agregar regla',
    removeRule: 'Eliminar regla',
    accept: 'Sí',
    reject: 'No',
    choose: 'Elegir',
    upload: 'Subir',
    cancel: 'Cancelar',
    completed: 'Completado',
    pending: 'Pendiente',
    fileSizeTypes: ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
    dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
    monthNames: [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ],
    monthNamesShort: [
      'ene',
      'feb',
      'mar',
      'abr',
      'may',
      'jun',
      'jul',
      'ago',
      'sep',
      'oct',
      'nov',
      'dic',
    ],
    today: 'Hoy',
    weekHeader: 'Sem',
    firstDayOfWeek: 1,
    dateFormat: 'dd/mm/yy',
    weak: 'Débil',
    medium: 'Media',
    strong: 'Fuerte',
    passwordPrompt: 'Ingrese una contraseña',
    emptyFilterMessage: 'No se encontraron resultados',
    searchMessage: '{0} resultados disponibles',
    selectionMessage: '{0} elementos seleccionados',
    emptySelectionMessage: 'Ningún elemento seleccionado',
    emptySearchMessage: 'No se encontraron resultados',
    emptyMessage: 'No hay datos disponibles',
    aria: {
      trueLabel: 'Verdadero',
      falseLabel: 'Falso',
      nullLabel: 'Sin seleccionar',
      star: '1 estrella',
      stars: '{star} estrellas',
      selectAll: 'Seleccionar todos',
      unselectAll: 'Deseleccionar todos',
      close: 'Cerrar',
      previous: 'Anterior',
      next: 'Siguiente',
      navigation: 'Navegación',
      scrollTop: 'Ir arriba',
      moveTop: 'Mover al inicio',
      moveUp: 'Mover arriba',
      moveDown: 'Mover abajo',
      moveBottom: 'Mover al final',
      moveToTarget: 'Mover al destino',
      moveToSource: 'Mover al origen',
      moveAllToTarget: 'Mover todo al destino',
      moveAllToSource: 'Mover todo al origen',
      pageLabel: 'Página {page}',
      firstPageLabel: 'Primera página',
      lastPageLabel: 'Última página',
      nextPageLabel: 'Página siguiente',
      prevPageLabel: 'Página anterior',
      rowsPerPageLabel: 'Filas por página',
      jumpToPageDropdownLabel: 'Ir a página',
      jumpToPageInputLabel: 'Ir a página',
      selectRow: 'Seleccionar fila',
      unselectRow: 'Deseleccionar fila',
      expandRow: 'Expandir fila',
      collapseRow: 'Contraer fila',
      showFilterMenu: 'Mostrar menú de filtro',
      hideFilterMenu: 'Ocultar menú de filtro',
      filterOperator: 'Operador de filtro',
      filterConstraint: 'Restricción de filtro',
      editRow: 'Editar fila',
      saveEdit: 'Guardar edición',
      cancelEdit: 'Cancelar edición',
      listView: 'Vista de lista',
      gridView: 'Vista de cuadrícula',
      slide: 'Diapositiva',
      slideNumber: '{slideNumber}',
      zoomImage: 'Ampliar imagen',
      zoomIn: 'Acercar',
      zoomOut: 'Alejar',
      rotateRight: 'Girar a la derecha',
      rotateLeft: 'Girar a la izquierda',
      resetZoom: 'Restablecer zoom',
    },
  },
})
app.use(router)

async function bootstrap(): Promise<void> {
  try {
    await router.isReady()
  } finally {
    app.mount('#app')
  }

  hideLoading(0)
}

void bootstrap()
