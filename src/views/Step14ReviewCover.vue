<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuote } from '../store/quote'

// "Review your cover" — Figma 4962-... proposal summary. Read-only recap of
// everything captured; edit pencils jump back to the relevant step. The footer
// Next stays disabled until the customer accepts the Duty of Disclosure.

const { quote } = useQuote()
const router = useRouter()

const headlinePrice = '$416.00'

function fmtDate(d, fallback = '') {
  if (!d) return fallback
  const x = new Date(d)
  if (Number.isNaN(x.getTime())) return fallback
  const p = (n) => String(n).padStart(2, '0')
  return `${p(x.getDate())}/${p(x.getMonth() + 1)}/${x.getFullYear()}`
}
function fmtLong(d) {
  if (!d) return null
  const x = new Date(d)
  if (Number.isNaN(x.getTime())) return null
  const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${String(x.getDate()).padStart(2, '0')} ${m[x.getMonth()]} ${x.getFullYear()}`
}

// --- Value maps for the driver detail rows ---
const genderLabel = { male: 'Male', female: 'Female' }
const maritalLabel = { single: 'Single', married: 'Married', divorced: 'Divorced', widowed: 'Widowed' }
const yearsLabel = {
  '<1': 'Less than 1 year', 1: '1 year', 2: '2 years', 3: '3 years', 4: '4 years',
  5: '5 years', '6-10': '6 to 10 years', '>10': 'More than 10 years',
}

// --- Policy details ---
const policyType = computed(() => {
  const map = {
    comprehensive: 'Comprehensive cover',
    'third-party': 'Third Party Only cover',
    'third-party-fire-theft': 'Third Party, Fire & Theft cover',
  }
  return map[quote.coverType] || 'Comprehensive cover'
})
const policyDuration = computed(() => {
  const start = fmtLong(quote.coverStartDate)
  const end = fmtLong(quote.coverEndDate)
  if (start && end) return `${start} - ${end}`
  return '10 Jun 2026 - 09 Jun 2027'
})
const promoText = computed(() => quote.quoteSelection?.promoCode || 'Promo code message goes here')

// --- Car details ---
const usageLabel = computed(() => {
  const u = quote.carUsage
  if (u && typeof u === 'object') return u.usage || 'Private and business'
  return u || 'Private and business'
})
const offPeakLabel = computed(() => {
  const u = quote.carUsage
  if (u && typeof u === 'object' && typeof u.offPeak === 'boolean') return u.offPeak ? 'Yes' : 'No'
  return 'Yes'
})
const mileageLabel = computed(() => {
  if (quote.driveLessEligible) return 'Less than 8,000km'
  if (quote.annualDistance) return quote.annualDistance
  return 'Less than 8,000km'
})
const odometerLabel = computed(() =>
  quote.odometerReading != null ? `${Number(quote.odometerReading).toLocaleString()}km` : '7,500km'
)

const policyRows = computed(() => [
  { label: 'Quote ID', value: 'MT/1234567' },
  { label: 'Policy type', value: policyType.value },
  { label: 'Policy duration', value: policyDuration.value },
  { label: 'Promo', value: promoText.value },
])
const carRows = computed(() => [
  { label: 'Car brand', value: quote.carMake || 'BMW' },
  { label: 'Car model', value: quote.carModel || 'X1 M35i 2.0' },
  { label: 'Year of registration', value: String(quote.carYear || '2025') },
  { label: 'Vehicle registration number', value: quote.vrnNotYet ? 'To be advised' : (quote.vehicleRegNo || 'SKU123A') },
  { label: 'Car usage', value: usageLabel.value },
  { label: 'Off-peak car', value: offPeakLabel.value },
  { label: 'Mileage', value: mileageLabel.value },
  { label: 'Odometer reading', value: odometerLabel.value },
])

// --- Drivers (accordion) ---
function driverDetails(d) {
  return [
    d.nric && { label: 'NRIC/FIN', value: d.nric },
    d.gender && { label: 'Gender', value: genderLabel[d.gender] || d.gender },
    d.marital && { label: 'Marital status', value: maritalLabel[d.marital] || d.marital },
    d.years != null && { label: 'Years of driving licence', value: yearsLabel[d.years] || d.years },
    d.af != null && { label: 'At-fault claims (3 yrs)', value: d.af },
    d.naf != null && { label: 'Not-at-fault claims (3 yrs)', value: d.naf },
  ].filter(Boolean)
}

const mainDriver = computed(() => {
  const m = quote.mainDriver
  return {
    role: 'Policyholder & Main driver',
    name: (m.name || '').trim() || 'John Doe',
    dob: fmtDate(m.dob, '01/01/1990'),
    nric: m.nric,
    gender: m.gender,
    marital: m.maritalStatus,
    years: quote.drivingHistory?.yearsLicensed,
    af: quote.drivingHistory?.atFaultClaims,
    naf: quote.drivingHistory?.notAtFaultClaims,
  }
})
const namedDrivers = computed(() =>
  (quote.additionalDrivers || []).map((d) => ({
    role: 'Named driver',
    name: (d.name || '').trim() || 'Named driver',
    dob: fmtDate(d.dob),
    nric: d.nric,
    gender: d.gender,
    marital: d.maritalStatus,
    years: d.yearsLicensed,
    af: d.atFault,
    naf: d.notAtFault,
  }))
)

const open = ref({ main: true })
function toggle(key) { open.value[key] = !open.value[key] }

// --- Driver plans (data-driven) ---
const showHouseholdPlan = computed(() => quote.hasAdditionalDrivers === true && quote.hasUnder30Drivers === false)
const showAuthorisedPlan = computed(() => quote.hasOutsideDrivers === true)

// --- Selected benefits (included cover) ---
const benefits = [
  'NCD Protector',
  'New for Old Replacement Car',
  '24 Hours Roadside Assistance',
  'Overseas Emergency Allowance/Repatriation',
]

// --- Duty of disclosure statements ---
const disclosureGroups = [
  {
    title: 'Driver eligibility and profile',
    items: [
      'The main driver of the car resides in Singapore, is between 25 and 75 years of age and has held a valid driving licence for 2 or more years as at the start date of the proposed policy.',
      'You and/or other driver(s) is not a foreign diplomat, work as a foreign diplomatic staff or for a foreign armed force.',
    ],
  },
  {
    title: 'Driving record and claims history',
    items: [
      'No driver has had any class of licence suspended or revoked in the last 3 years from the start date of the proposed policy.',
      'No driver has previously been refused, declined renewal, or had car insurance terminated for reasons other than their accidents/claim records.',
      'No driver has been involved in 4 or more at-fault accidents and/or claims in the last 3 years from the start of the proposed policy.',
    ],
    note: 'Drivers with 2 or more at-fault accidents and/or claims in the last 3 years must be named as a driver in order to be covered under your policy.',
  },
  {
    title: 'Legal and financial status',
    items: [
      'No driver is an undischarged bankrupt or is the subject of a bankruptcy application or order within the 12 months.',
    ],
  },
  {
    title: 'Vehicle registration & usage restrictions',
    items: [
      'The car is not registered with LTA under the R - Private hire (Self-drive) motor cars/station wagons or Z - Private hire (Chauffeur) motor cars/station wagons vehicle registration schemes, which are excluded under the Policy.',
      'The car is not, has not been, and will not be, used for hire or reward, commercial purposes, delivery of goods or food and/or made available for use on car sharing or ride-hailing platforms such as lalamove, FoodPanda, Deliveroo, Grab, Grabhitch, Go-Jek, TADA, Drive lah, Drive.sg and others.',
    ],
  },
  {
    title: 'Vehicle compliance & driver health',
    items: [
      'The car is registered in Singapore and its modifications/accessories (if any) are LTA compliant.',
      'Each driver is medically fit to drive and satisfy all driving regulations.',
    ],
  },
]

const agreed = ref(false)
function agree() { agreed.value = true }

function editPolicy() { router.push('/step/2') }
function editCar() { router.push('/step/13') }
function editBenefits() { router.push('/step/12') }
function onBack() { router.push('/step/13') }
function onNext() {
  // End of the prototype — payment is out of scope. Gated on the disclosure.
  if (!agreed.value) return
}
</script>

<template>
  <section class="step">
    <header class="review-head">
      <h1 class="review-title">Review your cover</h1>
      <p class="review-sub">Take a moment to verify your details before we finalise your policy.</p>
    </header>

    <!-- Policy details -->
    <h2 class="sec-title">Policy details</h2>
    <div class="card">
      <button type="button" class="card-edit" aria-label="Edit policy details" @click="editPolicy">
        <i class="pi pi-pencil" aria-hidden="true"></i>
      </button>
      <dl class="rows">
        <div v-for="r in policyRows" :key="r.label" class="row">
          <dt class="row-label">{{ r.label }}</dt>
          <dd class="row-value">{{ r.value }}</dd>
        </div>
      </dl>
    </div>

    <!-- Car details -->
    <h2 class="sec-title">Car details</h2>
    <div class="card">
      <button type="button" class="card-edit" aria-label="Edit car details" @click="editCar">
        <i class="pi pi-pencil" aria-hidden="true"></i>
      </button>
      <dl class="rows">
        <div v-for="r in carRows" :key="r.label" class="row">
          <dt class="row-label">{{ r.label }}</dt>
          <dd class="row-value">{{ r.value }}</dd>
        </div>
      </dl>
    </div>

    <!-- Policyholder & Main driver -->
    <h2 class="sec-title">Policyholder &amp; Main driver</h2>
    <div class="driver-card" :class="{ 'is-open': open.main }">
      <button type="button" class="driver-head" :aria-expanded="open.main" @click="toggle('main')">
        <span class="driver-id">
          <span class="driver-name">{{ mainDriver.name }}</span>
          <span class="driver-dob">{{ mainDriver.dob }}</span>
        </span>
        <i class="pi" :class="open.main ? 'pi-chevron-up' : 'pi-chevron-down'" aria-hidden="true"></i>
      </button>
      <dl v-if="open.main" class="driver-detail">
        <div v-for="r in driverDetails(mainDriver)" :key="r.label" class="row">
          <dt class="row-label">{{ r.label }}</dt>
          <dd class="row-value">{{ r.value }}</dd>
        </div>
      </dl>
    </div>

    <!-- Named drivers -->
    <template v-if="namedDrivers.length">
      <h2 class="sec-title">Named driver</h2>
      <div v-for="(d, i) in namedDrivers" :key="i" class="driver-card" :class="{ 'is-open': open['n' + i] }">
        <button type="button" class="driver-head" :aria-expanded="!!open['n' + i]" @click="toggle('n' + i)">
          <span class="driver-id">
            <span class="driver-name">{{ d.name }}</span>
            <span class="driver-dob">{{ d.dob }}</span>
          </span>
          <i class="pi" :class="open['n' + i] ? 'pi-chevron-up' : 'pi-chevron-down'" aria-hidden="true"></i>
        </button>
        <dl v-if="open['n' + i]" class="driver-detail">
          <div v-for="r in driverDetails(d)" :key="r.label" class="row">
            <dt class="row-label">{{ r.label }}</dt>
            <dd class="row-value">{{ r.value }}</dd>
          </div>
        </dl>
      </div>
    </template>

    <!-- Driver plans -->
    <div v-if="showHouseholdPlan" class="plan-card">
      <span class="check" aria-hidden="true"><i class="pi pi-check"></i></span>
      <div class="plan-text">
        <p class="plan-name">Household driver plan</p>
        <p class="plan-desc">All household members who are aged 30 and above with less than 2 at-fault accidents in the last 3 years are covered.</p>
      </div>
    </div>
    <div v-if="showAuthorisedPlan" class="plan-card">
      <span class="check" aria-hidden="true"><i class="pi pi-check"></i></span>
      <div class="plan-text">
        <p class="plan-name">Authorised driver plan</p>
        <p class="plan-desc">All non-household drivers with less than 2 at-fault accidents in the last 3 years are covered.</p>
      </div>
    </div>

    <!-- Selected benefits -->
    <h2 class="sec-title">Selected benefits</h2>
    <div class="card">
      <button type="button" class="card-edit" aria-label="Edit benefits" @click="editBenefits">
        <i class="pi pi-pencil" aria-hidden="true"></i>
      </button>
      <ul class="benefits">
        <li v-for="b in benefits" :key="b" class="benefit">
          <span class="check" aria-hidden="true"><i class="pi pi-check"></i></span>
          <span class="benefit-name">{{ b }}</span>
        </li>
      </ul>
    </div>

    <!-- Duty of disclosure -->
    <h2 class="sec-title">Your Duty of Disclosure</h2>
    <div class="disclosure">
      <p class="disclosure-intro">
        All questions we ask of you are relevant to our decision to insure you and on what terms. You must
        tell us anything that you know and that a reasonable person in the circumstances would include in
        answering the questions.
        <br /><br />
        If you do not tell us anything you are required to tell us, we may cancel your policy or reduce the
        amount we will pay you if you make a claim or we may even refuse to pay such amount. We may also treat
        your policy as if it never existed.
      </p>

      <p class="confirm-title">Please confirm the following:</p>

      <div v-for="g in disclosureGroups" :key="g.title" class="confirm-group">
        <p class="confirm-cat">{{ g.title }}</p>
        <div v-for="(it, j) in g.items" :key="j" class="confirm-item">
          <span class="check" aria-hidden="true"><i class="pi pi-check"></i></span>
          <span class="confirm-text">{{ it }}</span>
        </div>
        <div v-if="g.note" class="confirm-note">
          <span class="note-ic" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 4.5l8 14H4l8-14z" stroke="#F2A900" stroke-width="1.4" stroke-linejoin="round"/><path d="M12 10v4" stroke="#F2A900" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="16.6" r="1" fill="#F2A900"/></svg>
          </span>
          <span class="note-text"><strong>Important Note</strong>: {{ g.note }}</span>
        </div>
      </div>

      <button type="button" class="agree-btn" :class="{ 'is-agreed': agreed }" :disabled="agreed" @click="agree">
        <i v-if="agreed" class="pi pi-check" aria-hidden="true"></i>
        {{ agreed ? 'Agreed' : 'I agree' }}
      </button>
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
      <button type="button" class="qf-next" :class="{ 'is-blocked': !agreed }" @click="onNext">
        Next
        <i class="pi pi-chevron-right" aria-hidden="true"></i>
      </button>
    </div>
  </section>
</template>

<style scoped>
.step { padding-top: 24px; display: flex; flex-direction: column; gap: 16px; }

.review-head { display: flex; flex-direction: column; gap: 8px; }
.review-title { margin: 0; font-family: var(--da-font); font-size: 24px; font-weight: 700; color: #000; }
.review-sub { margin: 0; font-family: var(--da-font); font-size: 16px; font-weight: 500; color: #000; }

.sec-title { margin: 8px 0 0; font-family: var(--da-font); font-size: 20px; font-weight: 700; color: #000; }

/* Summary cards. */
.card {
  position: relative;
  background: #fff;
  border: 1px solid #CCCCCC;
  border-radius: 8px;
  padding: 16px;
}
.card-edit {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 0;
  background: #D9D9D9;
  color: #1D1B20;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.card-edit .pi { font-size: 13px; }

.rows { margin: 0; display: flex; flex-direction: column; gap: 16px; }
.row { display: flex; flex-direction: column; gap: 2px; }
.row-label { font-family: var(--da-font); font-size: 12px; font-weight: 500; color: #252525; }
.row-value { margin: 0; font-family: var(--da-font); font-size: 16px; font-weight: 700; color: #000; }

/* Driver accordion cards — grey left rail. */
.driver-card {
  background: #fff;
  border: 1px solid #CCCCCC;
  border-left-width: 4px;
  border-radius: 8px;
  overflow: hidden;
}
.driver-head {
  width: 100%;
  background: transparent;
  border: 0;
  padding: 18px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  text-align: left;
}
.driver-id { display: flex; flex-direction: column; gap: 4px; }
.driver-name { font-family: var(--da-font); font-size: 16px; font-weight: 700; color: #252525; }
.driver-dob { font-family: var(--da-font); font-size: 14px; font-weight: 500; color: #49454F; }
.driver-head .pi { color: #1E1E1E; font-size: 14px; }
.driver-detail {
  margin: 0;
  padding: 0 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1px solid #EEE;
  padding-top: 12px;
}

/* Plan + benefit checks (green). */
.check {
  flex: 0 0 18px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--da-green);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.check .pi { font-size: 10px; font-weight: 700; }

.plan-card {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: #fff;
  border: 1px solid #CCCCCC;
  border-radius: 8px;
  padding: 16px;
}
.plan-text { display: flex; flex-direction: column; gap: 4px; }
.plan-name { margin: 0; font-family: var(--da-font); font-size: 16px; font-weight: 700; color: #000; }
.plan-desc { margin: 0; font-family: var(--da-font); font-size: 16px; font-weight: 500; line-height: 22px; color: #000; }

.benefits { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.benefit { display: flex; align-items: center; gap: 12px; }
.benefit-name { font-family: var(--da-font); font-size: 16px; font-weight: 700; color: #000; }

/* Duty of disclosure. */
.disclosure {
  background: #fff;
  border: 1px solid #E4E4E4;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.disclosure-intro {
  margin: 0;
  background: #E4E4E4;
  border: 1px solid #CCCCCC;
  border-radius: 8px;
  padding: 12px;
  font-family: var(--da-font);
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: #000;
}
.confirm-title { margin: 0; font-family: var(--da-font); font-size: 18px; font-weight: 700; color: #252525; }
.confirm-group { display: flex; flex-direction: column; gap: 8px; }
.confirm-cat {
  margin: 0 0 4px;
  font-family: var(--da-font);
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  color: #252525;
}
.confirm-item { display: flex; align-items: flex-start; gap: 8px; }
.confirm-item .check { margin-top: 1px; }
.confirm-text { flex: 1; font-family: var(--da-font); font-size: 14px; font-weight: 500; line-height: 20px; color: #000; }
.confirm-note {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  background: #E4E4E4;
  border-radius: 8px;
  outline: 1px solid rgba(242, 169, 0, 0.30);
  outline-offset: -1px;
  padding: 8px;
}
.note-ic { flex: 0 0 auto; line-height: 0; }
.note-text { flex: 1; font-family: var(--da-font); font-size: 14px; font-weight: 500; line-height: 20px; color: #333F48; }

.agree-btn {
  height: 48px;
  background: #fff;
  border: 1px solid var(--da-outline);
  border-radius: 4px;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 500;
  color: #49454F;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.agree-btn.is-agreed { background: var(--da-green); border-color: var(--da-green); color: #fff; cursor: default; }

/* Sticky price footer (chip · back · total · Next). */
.quote-footer {
  position: sticky;
  bottom: 0;
  z-index: 20;
  margin: 8px -16px 0 -16px;
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
.qf-next.is-blocked { background: #E8E8E8; color: #979797; }
</style>
