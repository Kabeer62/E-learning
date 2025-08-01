// e-learning-app/src/main.js

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

const app = createApp(App)
app.config.globalProperties.$axios = axios

app.use(router)
app.mount('#app')