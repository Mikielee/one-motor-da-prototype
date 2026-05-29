import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import { definePreset } from '@primevue/themes'

import 'primeicons/primeicons.css'
import './style.css'

import App from './App.vue'
import router from './router'

// DirectAsia primary CTA / focus / selected state is TEAL #00B2A9 (One Motor PRD §3.2).
// Calm, trustworthy, detail-oriented — the DA brand personality.
const DAPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#E6FBF8',
      100: '#C0F2EC',
      200: '#86E5DC',
      300: '#4DD6CB',
      400: '#1FC2B6',
      500: '#00B2A9',
      600: '#009990',
      700: '#007F78',
      800: '#006660',
      900: '#004D48',
      950: '#003330',
    },
    focusRing: {
      width: '2px',
      style: 'solid',
      color: '#00B2A9',
      offset: '2px',
    },
  },
})

const app = createApp(App)

app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: DAPreset,
    options: {
      darkModeSelector: '.da-dark',
    },
  },
  ripple: false,
})

app.mount('#app')
