<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import DaFloatingInput from '../components/DaFloatingInput.vue'
import DaDateField from '../components/DaDateField.vue'
import DaSearchSelect from '../components/DaSearchSelect.vue'
import FieldError from '../components/FieldError.vue'
import { useQuote } from '../store/quote'
import { useValidation } from '../composables/useValidation'

// Finalise & Pay details — Figma 4962-3081 ("Just a few more details to get you
// covered"). Last step before payment. Most fields are PREFILLED from earlier
// steps (name/NRIC/DOB/gender from the main-driver step, email/mobile from
// contact, NCD from driving history) and show as "verified" (blue outline).

const { quote, mutable } = useQuote()
const { showErrors, reveal } = useValidation()
const router = useRouter()

// Demo headline premium. KB 38971919: never claim "per year" — the DA cover term
// flexes 7-18 months — so we label the figure "Total", matching the Step 9 footer.
const headlinePrice = '$416.00'

const ncdOptions = [
  { label: '0%', value: '0' },
  { label: '10%', value: '10' },
  { label: '20%', value: '20' },
  { label: '30%', value: '30' },
  { label: '40%', value: '40' },
  { label: '50%', value: '50' },
]

const md = computed(() => quote.mainDriver)
const c = computed(() => quote.contact)
const dh = computed(() => quote.drivingHistory)

const fullName = computed({ get: () => md.value.name, set: (v) => { mutable.mainDriver.name = v } })
const nric = computed({ get: () => md.value.nric, set: (v) => { mutable.mainDriver.nric = v } })
const dob = computed({ get: () => md.value.dob, set: (v) => { mutable.mainDriver.dob = v } })
const email = computed({ get: () => c.value.email, set: (v) => { mutable.contact.email = v } })
const ncd = computed({ get: () => dh.value.ncd, set: (v) => { mutable.drivingHistory.ncd = v } })
const postal = computed({ get: () => c.value.postalCode, set: (v) => { mutable.contact.postalCode = v.replace(/\D/g, '').slice(0, 6) } })

const now = new Date()
const dobMax = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate())
const dobMin = new Date(now.getFullYear() - 100, 0, 1)

function setGender(v) { mutable.mainDriver.gender = v }
function onMobileInput(e) { mutable.contact.phone = e.target.value.replace(/\D/g, '').slice(0, 8) }

const channels = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'whatsapp', label: 'Whatsapp' },
]
function toggleChannel(ch) {
  const arr = mutable.contact.marketingChannels
  const i = arr.indexOf(ch)
  if (i >= 0) arr.splice(i, 1)
  else arr.push(ch)
}

const validEmail = computed(() => /\S+@\S+\.\S+/.test(c.value.email || ''))
const validMobile = computed(() => /^[89]\d{7}$/.test(c.value.phone || ''))
const validPostal = computed(() => /^\d{6}$/.test(c.value.postalCode || ''))

const canContinue = computed(() =>
  Boolean((md.value.name || '').trim()) &&
  Boolean((md.value.nric || '').trim()) &&
  Boolean(md.value.dob) &&
  Boolean(md.value.gender) &&
  validEmail.value &&
  validMobile.value &&
  Boolean(dh.value.ncd) &&
  validPostal.value
)

const nameError = computed(() => showErrors.value && !(md.value.name || '').trim())
const nricError = computed(() => showErrors.value && !(md.value.nric || '').trim())
const dobError = computed(() => showErrors.value && !md.value.dob)
const genderError = computed(() => showErrors.value && !md.value.gender)
const emailError = computed(() => showErrors.value && !validEmail.value)
const mobileError = computed(() => showErrors.value && !validMobile.value)
const ncdError = computed(() => showErrors.value && !dh.value.ncd)
const postalError = computed(() => showErrors.value && !validPostal.value)

function onBack() { router.push('/step/11') }
function onNext() {
  if (!canContinue.value) { reveal(); return }
  router.push('/step/13')
}
</script>

<template>
  <section class="step">
    <h1 class="da-section-title">Just a few more details to get you covered</h1>

    <!-- Your Details -->
    <div class="group">
      <h2 class="group-title">Your Details</h2>

      <div class="field" :data-error="nameError ? 'true' : null">
        <DaFloatingInput v-model="fullName" label="Full name (as per NRIC)" :invalid="nameError" autocomplete="name" />
        <FieldError :show="nameError" message="Enter your full name." />
      </div>

      <div class="field" :data-error="nricError ? 'true' : null">
        <DaFloatingInput v-model="nric" label="NRIC/FIN" :invalid="nricError" />
        <FieldError :show="nricError" message="Enter your NRIC/FIN." />
      </div>

      <div class="field" :data-error="dobError ? 'true' : null">
        <label class="field-label">Date of birth</label>
        <DaDateField v-model="dob" :min-date="dobMin" :max-date="dobMax" field-outline="#CCCCCC" :invalid="dobError" />
        <FieldError :show="dobError" message="Enter your date of birth." />
      </div>

      <div class="field" :data-error="genderError ? 'true' : null">
        <p class="field-label">Gender</p>
        <div class="seg" :class="{ 'is-error': genderError }" role="radiogroup" aria-label="Gender">
          <button type="button" class="seg-btn" role="radio" :aria-checked="md.gender === 'male'"
            :class="{ 'is-on': md.gender === 'male' }" @click="setGender('male')">Male</button>
          <button type="button" class="seg-btn" role="radio" :aria-checked="md.gender === 'female'"
            :class="{ 'is-on': md.gender === 'female' }" @click="setGender('female')">Female</button>
        </div>
        <FieldError :show="genderError" message="Select a gender." />
      </div>

      <div class="field" :data-error="emailError ? 'true' : null">
        <DaFloatingInput v-model="email" label="Email" type="email" inputmode="email" :invalid="emailError" autocomplete="email" />
        <FieldError :show="emailError" message="Enter a valid email address." />
      </div>

      <!-- Mobile — +65 prefix + 8 digits, 252px wide (Figma), floating "Mobile" label. -->
      <div class="field" :data-error="mobileError ? 'true' : null">
        <div class="mobile" :class="{ 'is-filled': !!c.phone, 'is-error': mobileError }">
          <span class="mobile-prefix">+65</span>
          <div class="mobile-num">
            <input
              class="mobile-input"
              :value="c.phone"
              type="tel"
              inputmode="numeric"
              maxlength="8"
              autocomplete="tel-national"
              aria-label="Mobile"
              @input="onMobileInput"
            />
            <label class="mobile-label">Mobile</label>
          </div>
        </div>
        <FieldError :show="mobileError" message="Enter a valid SG mobile (8 digits, starts with 8 or 9)." />
      </div>

      <div class="field" :data-error="ncdError ? 'true' : null">
        <label class="field-label">No Claim Discount (NCD) at renewal</label>
        <DaSearchSelect v-model="ncd" :options="ncdOptions" placeholder="Select" field-outline="#CCCCCC" :invalid="ncdError" />
        <FieldError :show="ncdError" message="Select your NCD at renewal." />
      </div>
    </div>

    <!-- Your Address -->
    <div class="group">
      <h2 class="group-title">Your Address</h2>
      <div class="field" :data-error="postalError ? 'true' : null">
        <DaFloatingInput v-model="postal" label="Postal code" inputmode="numeric" :invalid="postalError" autocomplete="postal-code" />
        <button type="button" class="autofill">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10.16 5.78L12.52 3.42 12.05 2.95 9.69 5.31 10.16 5.78ZM9.22 6.72 8.75 6.25 2.62 12.38 3.09 12.85 9.22 6.72ZM12.52 1.54 13.93 2.95C14.05 3.07 14.13 3.25 14.13 3.42 14.13 3.6 14.05 3.77 13.93 3.9L3.56 14.27C3.44 14.39 3.27 14.46 3.09 14.46 2.91 14.46 2.74 14.39 2.62 14.27L1.21 12.85C1.08 12.73 1.01 12.56 1.01 12.38 1.01 12.21 1.08 12.04 1.21 11.91L11.58 1.54C11.7 1.41 11.87 1.34 12.05 1.34 12.22 1.34 12.39 1.41 12.52 1.54Z" fill="#49454F"/></svg>
          Autofill address from postal code
        </button>
      </div>
    </div>

    <!-- Marketing channels (optional, 252px cards, round checkboxes) -->
    <div class="group">
      <h2 class="mkt-title">Keep me updated for any special deals.</h2>
      <div class="mkt-list">
        <button
          v-for="ch in channels"
          :key="ch.value"
          type="button"
          class="mkt-card"
          :class="{ 'is-on': c.marketingChannels.includes(ch.value) }"
          :aria-pressed="c.marketingChannels.includes(ch.value)"
          @click="toggleChannel(ch.value)"
        >
          <span class="da-check" :class="{ 'is-on': c.marketingChannels.includes(ch.value) }">
            <svg v-if="c.marketingChannels.includes(ch.value)" width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span class="mkt-label">{{ ch.label }}</span>
        </button>
      </div>
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
.group { display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 8px; }

.group-title {
  margin: 0;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 700;
  color: #000;
}
.field-label {
  margin: 0;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 600;
  line-height: 20px;
  color: #252525;
}

/* Gender segment — selected fills DA blue. */
.seg { display: flex; gap: 8px; }
.seg-btn {
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
.seg-btn.is-on { background: var(--da-blue); color: #fff; }
.seg.is-error .seg-btn { border-color: var(--da-error); }

/* Mobile composite — narrower 252px, blue when filled (verified). */
.mobile { display: flex; width: 252px; max-width: 100%; height: 56px; }
.mobile-prefix {
  display: inline-flex;
  align-items: center;
  padding: 0 16px;
  background: #E8E8E8;
  border: 1px solid #CCCCCC;
  border-right: 0;
  border-radius: 4px 0 0 4px;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 400;
  color: #49454F;
}
.mobile-num { position: relative; flex: 1; min-width: 0; }
.mobile-input {
  width: 100%;
  height: 100%;
  border: 1px solid #CCCCCC;
  border-radius: 0 4px 4px 0;
  background: #fff;
  padding: 0 16px;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 500;
  color: #1D1B20;
}
.mobile-input:focus { outline: 0; }
.mobile-label {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #49454F;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 500;
  transition: top 120ms ease, font-size 120ms ease;
}
/* Verified / filled: both halves turn blue, label notches up. */
.mobile.is-filled .mobile-prefix,
.mobile.is-filled .mobile-input,
.mobile:focus-within .mobile-prefix,
.mobile:focus-within .mobile-input { border-color: var(--da-blue); }
.mobile.is-filled .mobile-label,
.mobile:focus-within .mobile-label {
  top: 0;
  font-size: 12px;
  line-height: 16px;
  background: #fff;
  padding: 0 4px;
}
.mobile.is-error .mobile-prefix,
.mobile.is-error .mobile-input { border-color: var(--da-error); }

/* Autofill link. */
.autofill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: 0;
  padding: 0;
  margin-top: -4px;
  cursor: pointer;
  font-family: var(--da-font);
  font-size: 14px;
  font-weight: 500;
  color: #49454F;
}

/* Marketing — 252px cards, round checkbox. */
.mkt-title {
  margin: 0;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
  color: #252525;
}
.mkt-list { display: flex; flex-direction: column; gap: 8px; }
.mkt-card {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 252px;
  max-width: 100%;
  min-height: 56px;
  box-sizing: border-box;
  background: #fff;
  border: 1px solid #CCCCCC;
  border-radius: 4px;
  padding: 0 16px;
  cursor: pointer;
  text-align: left;
}
.mkt-card.is-on { border-color: var(--da-blue); }
.mkt-label { font-family: var(--da-font); font-size: 16px; font-weight: 500; color: var(--da-ink); }
.da-check {
  flex: 0 0 18px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid #49454F;
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.da-check.is-on { background: var(--da-blue); border-color: var(--da-blue); }

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
.qf-next.is-blocked { background: #B7D8A0; }
</style>
