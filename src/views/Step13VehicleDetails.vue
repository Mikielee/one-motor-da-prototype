<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import DaSearchSelect from '../components/DaSearchSelect.vue'
import DaFloatingInput from '../components/DaFloatingInput.vue'
import FieldError from '../components/FieldError.vue'
import { useQuote } from '../store/quote'
import { useValidation } from '../composables/useValidation'

// "Tell us more about your vehicle" — Figma 4962-... (Finalise & Pay group).
// Confirms the vehicle (make/model/year prefilled + verified) and gathers the
// registration number, odometer, current insurer and financing flag before pay.

const { quote, mutable } = useQuote()
const { showErrors, reveal } = useValidation()
const router = useRouter()

const headlinePrice = '$416.00'

// --- Make / model / year option sets (same source as Step 3) ---
const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 31 }, (_, i) => currentYear - i).map((y) => ({ label: String(y), value: y }))

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
  Toyota: ['Corolla Altis', 'Camry', 'Yaris', 'RAV4', 'Vios', 'Fortuner'],
  Volkswagen: ['Polo', 'Golf', 'T-Cross', 'Tiguan'],
  Volvo: ['S60', 'XC40', 'XC60', 'XC90'],
}
const modelOptions = computed(() => {
  const list = (quote.carMake && modelMap[quote.carMake]) || []
  return list.map((m) => ({ label: m, value: m }))
})

const insurerOptions = [
  'AIG', 'AXA', 'Budget Direct', 'DirectAsia', 'Etiqa', 'FWD', 'HL Assurance',
  'Income', 'Liberty', 'MSIG', 'Sompo', 'Tokio Marine', 'Other', 'No current insurer',
].map((i) => ({ label: i, value: i }))

// --- v-models ---
const make = computed({
  get: () => quote.carMake,
  set: (v) => { mutable.carMake = v; mutable.carModel = null },
})
const model = computed({ get: () => quote.carModel, set: (v) => { mutable.carModel = v } })
const year = computed({ get: () => quote.carYear, set: (v) => { mutable.carYear = v } })
const regNo = computed({
  get: () => quote.vehicleRegNo || '',
  set: (v) => { mutable.vehicleRegNo = v.toUpperCase() },
})
const odometer = computed({
  get: () => (quote.odometerReading == null ? '' : String(quote.odometerReading)),
  set: (v) => {
    const digits = v.replace(/\D/g, '')
    mutable.odometerReading = digits ? Number(digits) : null
  },
})
const insurer = computed({ get: () => quote.currentInsurer, set: (v) => { mutable.currentInsurer = v } })

function toggleNoVrn() {
  mutable.vrnNotYet = !quote.vrnNotYet
  if (quote.vrnNotYet) mutable.vehicleRegNo = null
}
function setFinancing(v) { mutable.carFinancing = v }

const canContinue = computed(() =>
  Boolean(quote.carMake) &&
  Boolean(quote.carModel) &&
  Boolean(quote.carYear) &&
  (quote.vrnNotYet || Boolean((quote.vehicleRegNo || '').trim())) &&
  quote.odometerReading != null &&
  Boolean(quote.currentInsurer) &&
  quote.carFinancing !== null
)

const makeError = computed(() => showErrors.value && !quote.carMake)
const modelError = computed(() => showErrors.value && !quote.carModel)
const yearError = computed(() => showErrors.value && !quote.carYear)
const regError = computed(() => showErrors.value && !quote.vrnNotYet && !(quote.vehicleRegNo || '').trim())
const odoError = computed(() => showErrors.value && quote.odometerReading == null)
const insurerError = computed(() => showErrors.value && !quote.currentInsurer)
const finError = computed(() => showErrors.value && quote.carFinancing === null)

function onBack() { router.push('/step/12') }
function onNext() {
  if (!canContinue.value) { reveal(); return }
  router.push('/step/14')
}

// Demo autofill — header "Car Insurance" chip.
import { useDemoAutofill } from '../composables/useDemoAutofill'
useDemoAutofill().register(() => { mutable.carMake = 'Toyota'; mutable.carModel = 'RAV4'; mutable.carYear = 2025; mutable.vehicleRegNo = 'SMP1234A'; mutable.vrnNotYet = false; mutable.odometerReading = 7500; mutable.currentInsurer = 'Income'; mutable.carFinancing = false })
</script>

<template>
  <section class="step">
    <h1 class="da-section-title">Tell us more about your vehicle</h1>

    <h2 class="group-title">Vehicle to be Insured</h2>

    <div class="field" :data-error="makeError ? 'true' : null">
      <DaSearchSelect v-model="make" :options="brandGroups" grouped searchable label="Car make"
        placeholder="Car make" field-outline="#CCCCCC" :invalid="makeError" />
    </div>

    <div class="field" :data-error="modelError ? 'true' : null">
      <DaSearchSelect v-model="model" :options="modelOptions" searchable label="Car model"
        placeholder="Car model" :disabled="!quote.carMake" field-outline="#CCCCCC" :invalid="modelError" />
    </div>

    <div class="field" :data-error="yearError ? 'true' : null">
      <DaSearchSelect v-model="year" :options="yearOptions" label="Car registration year"
        placeholder="Car registration year" field-outline="#CCCCCC" :invalid="yearError" />
      <p class="cover-note">We provide Comprehensive cover for cars up to 15 years of age.</p>
    </div>

    <div class="field" :data-error="regError ? 'true' : null">
      <DaFloatingInput v-model="regNo" label="Vehicle Registration Number" :invalid="regError" :disabled="quote.vrnNotYet" />
      <button type="button" class="link-toggle" :class="{ 'is-on': quote.vrnNotYet }" @click="toggleNoVrn">
        I don't have Vehicle Registration Number yet
      </button>
      <FieldError :show="regError" message="Enter your vehicle registration number." />
    </div>

    <div class="field" :data-error="odoError ? 'true' : null">
      <DaFloatingInput v-model="odometer" label="Current odometer reading (km)" inputmode="numeric" :invalid="odoError" />
      <FieldError :show="odoError" message="Enter the current odometer reading." />
    </div>

    <div class="field" :data-error="insurerError ? 'true' : null">
      <DaSearchSelect v-model="insurer" :options="insurerOptions" searchable
        placeholder="Current insurer" field-outline="#CCCCCC" :invalid="insurerError" />
      <FieldError :show="insurerError" message="Select your current insurer." />
    </div>

    <div class="field" :data-error="finError ? 'true' : null">
      <p class="q-label">Is your car under any financing?</p>
      <div class="yn" :class="{ 'is-error': finError }" role="radiogroup" aria-label="Financing">
        <button type="button" class="yn-btn" role="radio" :aria-checked="quote.carFinancing === true"
          :class="{ 'is-on': quote.carFinancing === true }" @click="setFinancing(true)">Yes</button>
        <button type="button" class="yn-btn" role="radio" :aria-checked="quote.carFinancing === false"
          :class="{ 'is-on': quote.carFinancing === false }" @click="setFinancing(false)">No</button>
      </div>
      <FieldError :show="finError" message="Tell us if your car is under financing." />
    </div>

    <!-- Sticky price footer: back · total · Next -->
    <div class="quote-footer">
      <button type="button" class="qf-chip" aria-label="Price breakdown">
        <i class="pi pi-chevron-up" aria-hidden="true"></i>
      </button>
      <button type="button" class="qf-back" aria-label="Go back" @click="onBack">
        <i class="pi pi-chevron-left" aria-hidden="true"></i>
      </button>
      <div class="qf-price">
        <span class="qf-amt">{{ headlinePrice }}</span>
        <span class="qf-period">Total</span>
      </div>
      <button type="button" class="qf-next" :class="{ 'is-blocked': !canContinue }" @click="onNext">
        Next
        <i class="pi pi-chevron-right" aria-hidden="true"></i>
      </button>
    </div>
  </section>
</template>

<style scoped>
.step { padding-top: 24px; display: flex; flex-direction: column; gap: 24px; }
.field { display: flex; flex-direction: column; gap: 8px; }

.group-title {
  margin: 0;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 700;
  color: #000;
}
.q-label {
  margin: 0;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 600;
  line-height: 20px;
  color: #252525;
}

/* Comprehensive-cover note — blue rule + body, per Figma. */
.cover-note {
  margin: 0;
  padding-left: 16px;
  border-left: 3px solid var(--da-blue);
  font-family: var(--da-font);
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: #000;
}

.link-toggle {
  align-self: flex-start;
  background: transparent;
  border: 0;
  padding: 0;
  font-family: var(--da-font);
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: #000;
  text-decoration: underline;
  cursor: pointer;
}
.link-toggle.is-on { color: var(--da-blue); }

/* Financing Yes/No — selected fills DA blue. */
.yn { display: flex; gap: 8px; }
.yn-btn {
  flex: 1;
  height: 48px;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #CCCCCC;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 500;
  color: #49454F;
}
.yn-btn.is-on { background: var(--da-blue); color: #fff; }
.yn.is-error .yn-btn { border-color: var(--da-error); }

/* Sticky price footer (chip · back · total · Next). */
.quote-footer {
  position: sticky;
  bottom: 0;
  z-index: 20;
  margin: auto -16px 0 -16px;
  padding: 24px 16px 12px;
  background: var(--da-yellow);
  border-top-left-radius: var(--da-radius-lg);
  border-top-right-radius: var(--da-radius-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.qf-chip {
  position: absolute;
  top: -13px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  border-radius: 100px;
  background: var(--da-yellow);
  border: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #000;
  cursor: pointer;
}
.qf-back {
  flex: 0 0 72px;
  height: 47px;
  background: var(--da-yellow);
  border: 1px solid var(--da-outline);
  border-radius: 8px;
  box-shadow: var(--da-btn-shadow);
  color: #1D1B20;
  cursor: pointer;
}
.qf-price { display: flex; align-items: baseline; gap: 4px; }
.qf-amt { font-size: 20px; font-weight: 700; color: #000; }
.qf-period { font-size: 14px; font-weight: 400; color: #000; }
.qf-next {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 47px;
  padding: 0 18px;
  background: var(--da-green);
  border: 0;
  border-radius: 8px;
  box-shadow: var(--da-btn-shadow);
  color: #fff;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}
.qf-next.is-blocked { background: #B7D8A0; }
</style>
