<script setup>
import { computed, onMounted } from 'vue'
import DaSearchSelect from '../components/DaSearchSelect.vue'
import StickyNext from '../components/StickyNext.vue'
import { useQuote } from '../store/quote'
import { useValidation } from '../composables/useValidation'

const { quote, mutable } = useQuote()
const { showErrors, reveal } = useValidation()

// --- Year range driven by Step 1 cover type (OMP-89 AC + KB f87bd966) ---
const isThirdParty = computed(() =>
  quote.coverType === 'third-party' || quote.coverType === 'third-party-fire-theft'
)
const currentYear = new Date().getFullYear()
const yearValues = computed(() => {
  const span = isThirdParty.value ? 15 : 30 // TP capped at 15 years old
  return Array.from({ length: span + 1 }, (_, i) => currentYear - i)
})
const yearOptions = computed(() => yearValues.value.map((y) => ({ label: String(y), value: y })))

// --- Brand list: grouped Popular + All (alphabetical), searchable ---
const popular = ['BMW', 'BYD', 'Honda', 'Hyundai', 'KIA']
const allBrands = [
  'Audi', 'BMW', 'BYD', 'Honda', 'Hyundai', 'KIA', 'Lexus', 'Mazda',
  'Mercedes-Benz', 'Mitsubishi', 'Nissan', 'Subaru', 'Suzuki', 'Toyota',
  'Volkswagen', 'Volvo',
]
const brandGroups = [
  { label: 'Popular brands', items: popular.map((b) => ({ label: b, value: b })) },
  { label: 'All brands', items: allBrands.map((b) => ({ label: b, value: b })) },
]

// --- Models per brand (subset; generic fallback) ---
const modelMap = {
  Audi: ['A3', 'A4', 'Q3', 'Q5'],
  BMW: ['1 Series', '3 Series', '5 Series', 'X1', 'X3'],
  BYD: ['Atto 3', 'Dolphin', 'Seal', 'Han'],
  Honda: ['Civic', 'Jazz', 'HR-V', 'CR-V', 'Vezel'],
  Hyundai: ['Avante', 'Tucson', 'Kona', 'Ioniq 5'],
  KIA: ['Cerato', 'Sportage', 'Niro', 'Seltos'],
  Lexus: ['IS', 'ES', 'NX', 'RX', 'UX'],
  Mazda: ['Mazda2', 'Mazda3', 'CX-3', 'CX-5'],
  'Mercedes-Benz': ['A-Class', 'C-Class', 'E-Class', 'GLA', 'GLC'],
  Mitsubishi: ['Attrage', 'ASX', 'Outlander', 'Xpander'],
  Nissan: ['Note', 'Qashqai', 'X-Trail', 'Leaf'],
  Subaru: ['Impreza', 'Forester', 'XV', 'Outback'],
  Suzuki: ['Swift', 'Baleno', 'Vitara', 'Jimny'],
  Toyota: ['Corolla Altis', 'Camry', 'Yaris', 'RAV4', 'Vios'],
  Volkswagen: ['Polo', 'Golf', 'T-Cross', 'Tiguan'],
  Volvo: ['S60', 'XC40', 'XC60', 'XC90'],
}
const modelOptions = computed(() => {
  const list = (quote.carMake && modelMap[quote.carMake]) || []
  return list.map((m) => ({ label: m, value: m }))
})

// --- Dependent v-models with clearing rules ---
const year = computed({
  get: () => quote.carYear,
  set: (v) => {
    mutable.carYear = v
    if (!v) { mutable.carMake = null; mutable.carModel = null }
  },
})
const make = computed({
  get: () => quote.carMake,
  set: (v) => {
    mutable.carMake = v
    mutable.carModel = null // picking a brand clears any previous model
  },
})
const model = computed({
  get: () => quote.carModel,
  set: (v) => { mutable.carModel = v },
})

// On return to Step 3, if cover type tightened and the picked year is now out of
// range, clear Year + Brand + Model (OMP-89 AC).
onMounted(() => {
  if (quote.carYear && !yearValues.value.includes(quote.carYear)) {
    mutable.carYear = null
    mutable.carMake = null
    mutable.carModel = null
  }
})

const canContinue = computed(() => Boolean(quote.carYear && quote.carMake && quote.carModel))

// Red outline on the FIRST missing dropdown only (chained conditions).
const yearError = computed(() => showErrors.value && !quote.carYear)
const makeError = computed(() => showErrors.value && quote.carYear && !quote.carMake)
const modelError = computed(() => showErrors.value && quote.carYear && quote.carMake && !quote.carModel)
</script>

<template>
  <section class="step">
    <h1 class="da-section-title">Tell us about your car</h1>

    <div class="ymm-form">
      <div class="field" :data-error="yearError ? 'true' : null">
        <DaSearchSelect
          v-model="year"
          :options="yearOptions"
          placeholder="Year"
          :invalid="yearError"
        />
      </div>

      <div class="field" :data-error="makeError ? 'true' : null">
        <DaSearchSelect
          v-model="make"
          :options="brandGroups"
          grouped
          searchable
          placeholder="Car brand"
          :disabled="!quote.carYear"
          :invalid="makeError"
        />
      </div>

      <div class="field" :data-error="modelError ? 'true' : null">
        <DaSearchSelect
          v-model="model"
          :options="modelOptions"
          searchable
          placeholder="Car model"
          :disabled="!quote.carMake"
          :invalid="modelError"
        />
      </div>
    </div>

    <StickyNext :disabled="!canContinue" @blocked="reveal" />
  </section>
</template>

<style scoped>
.step {
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ymm-form { display: flex; flex-direction: column; gap: 8px; }
.field { display: flex; flex-direction: column; gap: 4px; }

.ymm-hint {
  margin: 0;
  font-size: 12px;
  font-weight: 400;
  color: var(--da-step-off);
  line-height: 1.4;
}
</style>
