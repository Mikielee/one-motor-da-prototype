<script setup>
import { ref, reactive, computed } from 'vue'
import DaFloatingInput from '../components/DaFloatingInput.vue'
import DaDateField from '../components/DaDateField.vue'
import DaSearchSelect from '../components/DaSearchSelect.vue'
import StickyNext from '../components/StickyNext.vue'
import { useQuote } from '../store/quote'

// Additional Drivers — OMP-361, DA-only. Figma 5269-3520 ("Who drives your car?").
//
// Three questions, revealed progressively:
//   Q1  Does anyone else IN your household drive this car?  (Yes/No)
//   Q2  Are there any drivers under the age of 30?          (only if Q1 = Yes)
//   Q3  Will anyone OUTSIDE your household drive this car?   (always, at the bottom)
//
// Branch behaviour (matches the mockup states):
//   Q1 = No                  -> no household capture, straight to Q3.
//   Q1 = Yes & Q2 = Yes      -> each under-30 household driver is NAMED individually
//                               via the full form. Flat "Impact on Premium +$50.00".
//   Q1 = Yes & Q2 = No        -> flat "Household plan +$250.00", covers all 30+ household
//                               drivers as a group — no individual capture.
//   Q3 = Yes                  -> "Authorised driver plan +$200.00" for non-household drivers.
//
// Conditional notices:
//   - Total at-fault accidents across ALL drivers (main + additional) > 2  ->  excess
//     rises to $3,000.
//   - Max 8 drivers TOTAL (main + 7 additional). At the cap the Add button is replaced
//     by a red "Maximum 8 drivers reached" notice.

const { quote, mutable } = useQuote()

const MAX_ADDITIONAL = 7 // main driver + 7 = 8 total

const maritalOptions = [
  { label: 'Single', value: 'single' },
  { label: 'Married', value: 'married' },
  { label: 'Divorced', value: 'divorced' },
  { label: 'Widowed', value: 'widowed' },
]
const yearsOptions = [
  { label: 'Less than 1 year', value: '<1' },
  { label: '1 year', value: '1' },
  { label: '2 years', value: '2' },
  { label: '3 years', value: '3' },
  { label: '4 years', value: '4' },
  { label: '5 years', value: '5' },
  { label: '6 to 10 years', value: '6-10' },
  { label: 'More than 10 years', value: '>10' },
]
const afOptions = ['0', '1', '2', '3', '4+']
const nafOptions = ['0', '1', '2', '3', '4', '5+']

// Local working copies (committed to the store on Save / answer).
const hasHousehold = ref(quote.hasAdditionalDrivers)
const hasUnder30 = ref(quote.hasUnder30Drivers)
const hasOutside = ref(quote.hasOutsideDrivers)
const drivers = reactive([...(quote.additionalDrivers || [])])

const showForm = ref(false)
const editingIndex = ref(null)
const draft = reactive(blankDriver())

function blankDriver() {
  return {
    name: '',
    nric: '',
    dob: null,
    gender: '',
    maritalStatus: null,
    yearsLicensed: null,
    atFault: null,
    notAtFault: null,
  }
}

const dobMax = new Date()
const dobMin = new Date(dobMax.getFullYear() - 100, 0, 1)

function commitDrivers() {
  mutable.additionalDrivers = drivers.map((d) => ({ ...d }))
}

function setHousehold(v) {
  hasHousehold.value = v
  mutable.hasAdditionalDrivers = v
  if (!v) {
    // No household drivers — clear any captured under-30 state.
    hasUnder30.value = null
    mutable.hasUnder30Drivers = null
    drivers.splice(0)
    commitDrivers()
    showForm.value = false
  }
}

function setUnder30(v) {
  hasUnder30.value = v
  mutable.hasUnder30Drivers = v
  if (v && drivers.length === 0) {
    // First under-30 driver: open the capture form straight away.
    startAdd()
  } else if (!v) {
    drivers.splice(0)
    commitDrivers()
    showForm.value = false
  }
}

function setOutside(v) {
  hasOutside.value = v
  mutable.hasOutsideDrivers = v
}

function startAdd() {
  Object.assign(draft, blankDriver())
  editingIndex.value = null
  showForm.value = true
}

function editDriver(i) {
  Object.assign(draft, { ...drivers[i] })
  editingIndex.value = i
  showForm.value = true
}

function removeDriver(i) {
  drivers.splice(i, 1)
  commitDrivers()
}

function cancelForm() {
  showForm.value = false
  editingIndex.value = null
  // If the user cancelled the very first driver, fall back to "No under-30".
  if (drivers.length === 0) {
    hasUnder30.value = null
    mutable.hasUnder30Drivers = null
  }
}

const canSaveDriver = computed(() =>
  Boolean((draft.name || '').trim()) &&
  Boolean((draft.nric || '').trim()) &&
  Boolean(draft.dob) &&
  Boolean(draft.gender) &&
  Boolean(draft.maritalStatus) &&
  Boolean(draft.yearsLicensed) &&
  draft.atFault !== null &&
  draft.notAtFault !== null
)

function saveDriver() {
  if (!canSaveDriver.value) return
  if (editingIndex.value !== null) {
    drivers[editingIndex.value] = { ...draft }
  } else {
    drivers.push({ ...draft })
  }
  commitDrivers()
  showForm.value = false
  editingIndex.value = null
}

// ---- Derived premium impacts & notices -------------------------------------

function atFaultToInt(v) {
  if (v == null) return 0
  return v === '4+' ? 4 : parseInt(v, 10) || 0
}

// Total at-fault across the main driver and every added driver.
const totalAtFault = computed(() => {
  const main = atFaultToInt(quote.drivingHistory?.atFaultClaims)
  const extra = drivers.reduce((sum, d) => sum + atFaultToInt(d.atFault), 0)
  return main + extra
})
const showExcessNotice = computed(() => totalAtFault.value > 2)

const atCap = computed(() => drivers.length >= MAX_ADDITIONAL)

// The household block is "resting" (not mid-form) — gate Q3 + Next on this.
const householdResolved = computed(() => {
  if (hasHousehold.value === null) return false
  if (hasHousehold.value === false) return true
  if (hasUnder30.value === null) return false
  if (hasUnder30.value === false) return true
  return drivers.length > 0 && !showForm.value
})

const canContinue = computed(() => householdResolved.value && hasOutside.value !== null)

function fmtDob(d) {
  if (!d) return ''
  const x = new Date(d)
  const p = (n) => String(n).padStart(2, '0')
  return `${p(x.getDate())}/${p(x.getMonth() + 1)}/${x.getFullYear()}`
}

// Demo autofill — header "Car Insurance" chip.
// Household = Yes, with one under-30 named driver; outside household = Yes.
import { useDemoAutofill } from '../composables/useDemoAutofill'
useDemoAutofill().register(() => {
  setHousehold(true)
  setUnder30(true) // opens a fresh capture form
  Object.assign(draft, {
    name: 'Jane Roe',
    nric: 'T0067890A',
    dob: new Date(2000, 2, 20),
    gender: 'female',
    maritalStatus: 'single',
    yearsLicensed: '3',
    atFault: '0',
    notAtFault: '0',
  })
  saveDriver()
  setOutside(true)
})
</script>

<template>
  <section class="step">
    <h1 class="da-section-title">Who drives your car?</h1>

    <!-- Q1: household drivers -->
    <div class="block">
      <p class="ad-q">Does anyone else <strong>in your household</strong> drive this car?</p>
      <div class="yn">
        <button type="button" class="yn-btn" :class="{ 'is-on': hasHousehold === true }" @click="setHousehold(true)">Yes</button>
        <button type="button" class="yn-btn" :class="{ 'is-on': hasHousehold === false }" @click="setHousehold(false)">No</button>
      </div>
    </div>

    <!-- Q2 + household capture (only when Q1 = Yes) -->
    <template v-if="hasHousehold === true">
      <div class="block">
        <p class="ad-q">Are there any drivers under the age of 30?</p>
        <div class="yn">
          <button type="button" class="yn-btn" :class="{ 'is-on': hasUnder30 === true }" @click="setUnder30(true)">Yes</button>
          <button type="button" class="yn-btn" :class="{ 'is-on': hasUnder30 === false }" @click="setUnder30(false)">No</button>
        </div>
      </div>

      <!-- Q2 = Yes : name each under-30 driver -->
      <template v-if="hasUnder30 === true">
        <div v-for="(d, i) in drivers" :key="i" class="ad-card">
          <div class="ad-card-text">
            <p class="ad-card-name">{{ d.name }}</p>
            <p class="ad-card-dob">{{ fmtDob(d.dob) }}</p>
          </div>
          <button type="button" class="ad-icon" aria-label="Edit driver" @click="editDriver(i)">
            <i class="pi pi-pencil" aria-hidden="true"></i>
          </button>
          <button type="button" class="ad-icon" aria-label="Remove driver" @click="removeDriver(i)">
            <i class="pi pi-trash" aria-hidden="true"></i>
          </button>
        </div>

        <!-- Capture form -->
        <div v-if="showForm" class="ad-form">
          <p class="ad-q">Please tell us about the driver</p>

          <DaFloatingInput v-model="draft.name" label="Full name (as per NRIC)" autocomplete="off" />
          <DaFloatingInput v-model="draft.nric" label="NRIC/FIN" />

          <div class="field">
            <label class="field-label">Date of birth</label>
            <DaDateField v-model="draft.dob" :min-date="dobMin" :max-date="dobMax" field-outline="#CCCCCC" />
          </div>

          <div class="field">
            <p class="field-label">Gender</p>
            <div class="seg" role="radiogroup" aria-label="Gender">
              <button type="button" class="seg-btn" role="radio" :aria-checked="draft.gender === 'male'"
                :class="{ 'is-on': draft.gender === 'male' }" @click="draft.gender = 'male'">Male</button>
              <button type="button" class="seg-btn" role="radio" :aria-checked="draft.gender === 'female'"
                :class="{ 'is-on': draft.gender === 'female' }" @click="draft.gender = 'female'">Female</button>
            </div>
          </div>

          <div class="field">
            <label class="field-label">Marital status</label>
            <DaSearchSelect v-model="draft.maritalStatus" :options="maritalOptions" placeholder="Select" field-outline="#CCCCCC" />
          </div>

          <div class="field">
            <label class="field-label">Years of valid driving licence</label>
            <DaSearchSelect v-model="draft.yearsLicensed" :options="yearsOptions" placeholder="Select" field-outline="#CCCCCC" />
          </div>

          <p class="ad-q">In the 3 years prior to the start of the policy, all drivers to be insured had the following:</p>

          <div class="field">
            <p class="q-label">Total number of <strong>at-fault</strong> accidents and/or claims</p>
            <div class="chips" role="radiogroup" aria-label="At-fault claims">
              <button v-for="o in afOptions" :key="o" type="button" class="chip" role="radio"
                :aria-checked="draft.atFault === o" :class="{ 'is-on': draft.atFault === o }" @click="draft.atFault = o">{{ o }}</button>
            </div>
          </div>

          <div class="field">
            <p class="q-label">Total number of <strong>not-at-fault</strong> accidents and/or claims</p>
            <div class="chips" role="radiogroup" aria-label="Not-at-fault claims">
              <button v-for="o in nafOptions" :key="o" type="button" class="chip" role="radio"
                :aria-checked="draft.notAtFault === o" :class="{ 'is-on': draft.notAtFault === o }" @click="draft.notAtFault = o">{{ o }}</button>
            </div>
          </div>

          <button type="button" class="ad-save" :class="{ 'is-ready': canSaveDriver }" :disabled="!canSaveDriver" @click="saveDriver">Save driver</button>
          <button type="button" class="ad-cancel" @click="cancelForm">Cancel</button>
        </div>

        <!-- Resting state: add another / cap reached + premium impact -->
        <template v-else>
          <button v-if="!atCap" type="button" class="ad-add" @click="startAdd">+ Add driver</button>
          <div v-else class="notice notice-error">
            <span class="notice-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#DA291C" stroke-width="1.4"/><path d="M9 9l6 6M15 9l-6 6" stroke="#DA291C" stroke-width="1.8" stroke-linecap="round"/></svg>
            </span>
            <span class="notice-text">Maximum 8 drivers reached<br />Remove a driver to add someone new</span>
          </div>

          <div v-if="drivers.length" class="impact-box">
            <span class="impact-label">Impact on Premium</span>
            <span class="impact-amt">+$50.00</span>
          </div>

          <div v-if="showExcessNotice" class="notice notice-amber">
            <span class="notice-icon" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 4.5l8 14H4l8-14z" stroke="#F2A900" stroke-width="1.4" stroke-linejoin="round"/><path d="M12 10v4" stroke="#F2A900" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="16.6" r="1" fill="#F2A900"/></svg>
            </span>
            <span class="notice-text">As the total of at-fault accidents of all drivers exceeds 2, your excess will be increased to $3,000.</span>
          </div>
        </template>
      </template>

      <!-- Q2 = No : flat household plan, no capture -->
      <template v-else-if="hasUnder30 === false">
        <div class="impact-box">
          <span class="impact-label">Impact on Premium</span>
          <span class="impact-amt">+$250.00</span>
        </div>
        <div class="notice notice-amber">
          <span class="notice-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 4.5l8 14H4l8-14z" stroke="#F2A900" stroke-width="1.4" stroke-linejoin="round"/><path d="M12 10v4" stroke="#F2A900" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="16.6" r="1" fill="#F2A900"/></svg>
          </span>
          <span class="notice-text">We will cover all household drivers who are aged 30 and above with less than 2 at-fault accidents in the last 3 years.</span>
        </div>
      </template>
    </template>

    <!-- Q3: outside-household drivers -->
    <template v-if="householdResolved">
      <div v-if="hasHousehold === true" class="ad-divider"></div>
      <div class="block">
        <p class="ad-q">Will anyone <strong>outside your household</strong> drive this car?</p>
        <div class="yn">
          <button type="button" class="yn-btn" :class="{ 'is-on': hasOutside === true }" @click="setOutside(true)">Yes</button>
          <button type="button" class="yn-btn" :class="{ 'is-on': hasOutside === false }" @click="setOutside(false)">No</button>
        </div>
      </div>

      <template v-if="hasOutside === true">
        <div class="plan-box">
          <span class="impact-label">Authorised driver plan</span>
          <span class="impact-amt">+$200.00</span>
        </div>
        <div class="notice notice-amber">
          <span class="notice-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 4.5l8 14H4l8-14z" stroke="#F2A900" stroke-width="1.4" stroke-linejoin="round"/><path d="M12 10v4" stroke="#F2A900" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="16.6" r="1" fill="#F2A900"/></svg>
          </span>
          <span class="notice-text">We will cover all non-household drivers with less than 2 at-fault accidents in the last 3 years.</span>
        </div>
      </template>
    </template>

    <StickyNext :disabled="!canContinue" />
  </section>
</template>

<style scoped>
.step { padding-top: 24px; display: flex; flex-direction: column; gap: 16px; }
.block { display: flex; flex-direction: column; gap: 8px; }
.field { display: flex; flex-direction: column; gap: 8px; }

.ad-q {
  margin: 0;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 600;
  line-height: 20px;
  color: #252525;
}
.ad-q strong { font-weight: 700; }
.field-label {
  margin: 0;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 600;
  line-height: 20px;
  color: #252525;
}
.q-label {
  margin: 0;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 500;
  line-height: 23px;
  color: #252525;
}
.q-label strong { font-weight: 800; }

/* Yes / No + Gender segments — selected fills DA blue. */
.yn, .seg { display: flex; gap: 8px; }
.yn-btn, .seg-btn {
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
.yn-btn.is-on, .seg-btn.is-on { background: var(--da-blue); color: #fff; }

/* Claim chips. */
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip {
  flex: 1 1 0;
  min-width: 0;
  height: 56px;
  padding: 12px 8px;
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
.chip.is-on { background: var(--da-blue); color: #fff; }

/* Saved driver card — white, blue left rail. */
.ad-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid var(--da-blue);
  border-left-width: 4px;
  border-radius: 8px;
  padding: 16px 16px 16px 20px;
}
.ad-card-text { flex: 1; min-width: 0; }
.ad-card-name { margin: 0; font-family: var(--da-font); font-size: 16px; font-weight: 700; line-height: 22px; color: #252525; }
.ad-card-dob { margin: 0; font-family: var(--da-font); font-size: 14px; font-weight: 500; line-height: 20px; color: #49454F; }
.ad-icon {
  flex: 0 0 auto;
  width: 41px;
  height: 41px;
  border-radius: 50%;
  border: 0;
  background: #D9D9D9;
  color: #1D1B20;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.ad-icon .pi { font-size: 16px; }
.ad-icon:hover { background: #c9c9c9; }

/* Add driver row. */
.ad-add {
  height: 59px;
  background: #fff;
  border: 1px solid #DADADA;
  border-radius: 4px;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 500;
  color: #252525;
  cursor: pointer;
}
.ad-add:hover { border-color: var(--da-blue); }

/* Impact / plan summary rows. */
.impact-box, .plan-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  border-radius: 8px;
  outline: 1px solid #CCCCCC;
  outline-offset: -1px;
}
.impact-box { background: #F5F5F5; }
.plan-box { background: #E6E9ED; }
.impact-label { font-family: var(--da-font); font-size: 14px; font-weight: 700; color: #252525; }
.impact-amt { flex: 1; text-align: right; font-family: var(--da-font); font-size: 14px; font-weight: 700; color: #252525; }

/* Amber + red notice banners. */
.notice {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 12px;
  border-radius: 8px;
  outline-offset: -1px;
}
.notice-amber { background: #E6E9ED; outline: 1px solid rgba(242, 169, 0, 0.30); }
.notice-error { background: #E4E4E4; outline: 1px solid rgba(218, 41, 28, 0.30); }
.notice-icon { flex: 0 0 auto; line-height: 0; margin-top: 1px; }
.notice-text {
  flex: 1;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 500;
  line-height: 23px;
  color: #333F48;
}

.ad-divider { height: 1px; background: #CAC4D0; margin: 8px 0; }

/* Capture form. */
.ad-form { display: flex; flex-direction: column; gap: 16px; }
.ad-save {
  height: 44px;
  border: 0;
  border-radius: 4px;
  background: #DCDCDD;
  color: #949396;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 500;
  cursor: not-allowed;
}
.ad-save.is-ready { background: var(--da-green); color: #fff; cursor: pointer; }
.ad-cancel {
  height: 44px;
  background: #fff;
  border: 1px solid var(--da-outline);
  border-radius: 8px;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 500;
  color: #333F48;
  cursor: pointer;
}
</style>
