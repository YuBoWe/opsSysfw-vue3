import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import router from './router'
import 'element-plus/dist/index.css'
import './assets/css/main.css'
import axios from 'axios'

axios.defaults.baseURL = 'https://httpbin.org';


const app = createApp(App)
app.provide('http', axios)
app.use(ElementPlus)
app.use(router)
app.mount('#app')
