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
