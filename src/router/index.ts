import { createRouter, createWebHistory } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import LoginView from '@/modules/auth/views/LoginView.vue'
import HomeView from '@/modules/auth/views/HomeView.vue'
import { registerNavigationGuards } from '@/router/guards'
import { registerLoadingGuards } from '@/router/loading'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/login',
      component: AuthLayout,
      meta: { guestOnly: true },
      children: [
        {
          path: '',
          name: 'login',
          component: LoginView,
        },
      ],
    },
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: { name: 'home' },
        },
        {
          path: 'inicio',
          name: 'home',
          component: HomeView,
        },
        {
          path: 'usuarios',
          name: 'users',
          component: () => import('@/modules/users/views/UsersView.vue'),
        },
        {
          path: 'departamentos',
          name: 'departments',
          component: () => import('@/modules/departments/views/DepartmentsView.vue'),
        },
        {
          path: 'puestos',
          name: 'positions',
          component: () => import('@/modules/positions/views/PositionsView.vue'),
        },
        {
          path: 'rubros',
          name: 'concepts',
          component: () => import('@/modules/concepts/views/ConceptsView.vue'),
        },
        {
          path: 'empleados',
          name: 'employees',
          component: () => import('@/modules/employees/views/EmployeesView.vue'),
        },
        {
          path: 'empleados/nuevo',
          name: 'employee-new',
          component: () => import('@/modules/employees/views/EmployeeDetailView.vue'),
        },
        {
          path: 'empleados/:id(\\d+)',
          name: 'employee-detail',
          component: () => import('@/modules/employees/views/EmployeeDetailView.vue'),
        },
        {
          path: 'asistencia',
          name: 'attendance',
          component: () => import('@/modules/attendance/views/AttendanceView.vue'),
        },
        {
          path: 'planillas',
          name: 'payrolls',
          component: () => import('@/modules/payrolls/views/PayrollsView.vue'),
        },
        {
          path: 'planillas/nueva',
          name: 'payroll-new',
          component: () => import('@/modules/payrolls/views/PayrollNewView.vue'),
        },
        {
          path: 'planillas/:id',
          name: 'payroll-detail',
          component: () => import('@/modules/payrolls/views/PayrollDetailView.vue'),
        },
      ],
    },
    {
      path: '/inicio/usuarios',
      redirect: { name: 'users' },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login',
    },
  ],
})

registerLoadingGuards(router)
registerNavigationGuards(router)

export default router
