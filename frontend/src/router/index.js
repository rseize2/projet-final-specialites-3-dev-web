import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/userStore'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/LoginPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../pages/RegisterPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/HomePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/developer/:projectId',
    name: 'DeveloperProject',
    component: () => import('../pages/DeveloperProject.vue'),
    meta: { requiresAuth: true, requiresRole: 'developer' }
  },
  {
    path: '/manager/:projectId',
    name: 'ManagerProject',
    component: () => import('../pages/ManagerProject.vue'),
    meta: { requiresAuth: true, requiresRole: 'manager' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  userStore.loadCurrentUser()

  if (!userStore.isAuthenticated() && to.meta.requiresAuth) {
    next('/login')
  } else if (userStore.isAuthenticated() && to.path === '/login') {
    next('/')
  } else {
    next()
  }
})

export default router
