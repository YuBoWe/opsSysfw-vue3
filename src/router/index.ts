import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/LoginView.vue'
import Home from '../views/HomeView.vue'
import User from '../views/users/UserView.vue'
import Role from  '../views/users/UserRolesView.vue'
import Welcome from '../views/WelcomeView.vue'
import Perm from '../views/users/PermView.vue'
import CiType from '../views/cmdb/CiTypesView.vue'
import Ci from '../views/cmdb/CiView.vue'

// 定义路由
const routes = [
  { path: '/', redirect: '/login'},
  { path: '/login', component: Login },
  { 
    path: '/home',
    component: Home,
    redirect: '/welcome', // 使用相对路径
    children: [
      { path: 'users', component: User, name: '用户列表'}, // 子路由路径不以 '/' 开头
      { path: 'users/roles', component: Role, name: '角色管理'},
      { path: 'users/perm', component: Perm, name: '权限列表'},
      { path: 'citypes', component: CiType, name: '资产类型'},
      { path: 'cis', component: Ci, name: '资产列表'},
      { path: '/welcome', component: Welcome, name: '欢迎页'}, // 子路由路径不以 '/' 开头
      // ...other sub routes
    ] 
  },
  // 其他路由...
];

// 创建路由实例
const router = createRouter({ 
  history: createWebHistory(),
  routes
});

// 全局前置守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    next();
  } else {
    const token = window.localStorage.getItem('token');
    // console.log(token);
    if (token) {
      next();
    } else {
      next('/login');
    }
  }
})

export default router;