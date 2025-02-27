import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/LoginView.vue'
import Home from '../views/HomeView.vue'


// 定义路由
const routes = [
  { path: '/', redirect: '/login'},
  { path: '/login', component: Login },
  { path: '/home', component: Home }
  // 其他路由...
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(), // 使用 History 模式
  routes,
});

router.beforeEach((to, from, next) => {
  console.log(to);
  console.log(from);
  if(window.localStorage.getItem('token') || to.path === '/login'){
    next()
  }
  else {
    router.push('/')
  }

})

export default router;