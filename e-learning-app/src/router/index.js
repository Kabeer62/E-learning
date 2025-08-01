import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Courses from '../pages/Courses.vue'
import CourseDetails from '../pages/CourseDetails.vue'
import Login from '../pages/Login.vue'
import Dashboard from '../pages/Dashboard.vue'
import AdminLogin from '../pages/AdminLogin.vue'
import AdminHome from '../pages/AdminHome.vue'
import Users from '../pages/Users.vue'  // Import Users page
import { authState } from '../store/auth'

const routes = [
  { path: '/login', component: Login },
  {
    path: '/',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/courses',
    component: Courses,
    meta: { requiresAuth: true }
  },
  {
    path: '/courses/:id',
    component: CourseDetails,
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin-login',
    component: AdminLogin
  },
  {
    path: '/admin-home',
    component: AdminHome,
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    component: Users,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const email = localStorage.getItem('email');
  if (email) {
    authState.isAuthenticated = true;
  }

  if (to.meta.requiresAuth && !authState.isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && authState.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;