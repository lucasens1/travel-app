import { createApp } from 'vue'
import './sass/general.scss'
import { router } from "./router";
import App from './App.vue'

createApp(App).
use(router)
.mount('#app')
