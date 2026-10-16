import { createRouter, createWebHistory } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import LoginView from '@/modules/auth/views/LoginView.vue'
import HomeView from '@/modules/auth/views/HomeView.vue'
import { registerNavigationGuards } from '@/router/guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      redirect: '/inicio',
    },
    {
      path: '/login',
      name: 'login',
      component: AuthLayout,
      meta: { guestOnly: true },
      children: [
        {
          path: '',
          component: LoginView,
        },
      ],
    },
    {
      path: '/inicio',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView,
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login',
    },
  ],
})

registerNavigationGuards(router)

export default router
