import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import router from './router'
import 'element-plus/dist/index.css'
import './assets/css/main.css'
import axios from 'axios'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

axios.defaults.baseURL = '/api';

// 添加请求拦截器
axios.interceptors.request.use((config)=>{
  // 在发送请求之前做些什么
  console.log(config);
  if(config.url !== 'token/') {
    const token = window.localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = 'Bearer ' + token
    }
  }
  return config
});

// 添加响应拦截器
axios.interceptors.response.use(function (response) {
  // 2xx 范围内的状态码都会触发该函数。
  // 对响应数据做点什么
  console.log(33333);
  
  console.log(response);
  if ( response.data && response.data.code && response.data.code > 1000){
    window.localStorage.removeItem('token')
    router.push('/')
  }
  return response;
});


const app = createApp(App)
app.provide('http', axios)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(ElementPlus)
app.use(router)
app.mount('#app')
