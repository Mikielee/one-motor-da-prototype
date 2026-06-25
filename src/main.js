import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import { definePreset } from '@primevue/themes'

import 'primeicons/primeicons.css'
import './style.css'

import App from './App.vue'
import router from './router'

// DirectAsia design system (One Motor Design System Figma):
//   - primary action / brand red  #DC2B1E  (logo, links, CTA, error)
//   - progress + selected accent  #457CBF  (blue) -> used as focus ring
// Type is Montserrat (loaded in index.html).
const DAPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#FCEAE8',
      100: '#F7C9C5',
      200: '#EFA39D',
      300: '#E97B72',
      400: '#E35349',
      500: '#DC2B1E',
      600: '#C3261A',
      700: '#A91F15',
      800: '#8C1911',
      900: '#6E130D',
      950: '#4F0D09',
    },
    focusRing: {
      width: '2px',
      style: 'solid',
      color: '#457CBF',
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
