import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import { definePreset } from '@primevue/themes'

import 'primeicons/primeicons.css'
import './style.css'

import App from './App.vue'
import router from './router'

// DirectAsia design system (One Motor Design System Figma):
//   - primary action = green CTA (Main Button) ramp around #75BB49. PrimeVue
//     derives button border/hover/active from `primary`, so it MUST be green
//     (a red ramp painted a red border on the green CTA when hovered).
//   - brand red #DC2B1E (logo/links) + error red #A94442 are applied via CSS,
//     not the PrimeVue primary.
//   - progress + selected accent #457CBF (blue) -> generic focus ring.
// Type is Montserrat (loaded in index.html).
const DAPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#F0F8EA',
      100: '#DCEFCC',
      200: '#C0E2A6',
      300: '#A3D67F',
      400: '#8FDB5F',
      500: '#75BB49',
      600: '#5FA236',
      700: '#4E8A2C',
      800: '#3D6E22',
      900: '#2E5319',
      950: '#1F3A10',
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
