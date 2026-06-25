<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import DaSearchSelect from '../components/DaSearchSelect.vue'
import StickyNext from '../components/StickyNext.vue'
import FieldError from '../components/FieldError.vue'
import { useQuote } from '../store/quote'
import { useValidation } from '../composables/useValidation'

const { quote, mutable } = useQuote()
const { showErrors, reveal } = useValidation()
const router = useRouter()
const dh = computed(() => quote.drivingHistory)

// --- Options ---
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
// DA includes the 60% tier (KB #6); BD stops at 50%.
const ncdOptions = ['0', '10', '20', '30', '40', '50', '60'].map((n) => ({ label: `${n}%`, value: n }))
const zeroReasonOptions = [
  { label: 'New driver', value: 'new-driver' },
  { label: 'No previous insurance', value: 'no-prev-insurance' },
  { label: 'Claims in past year', value: 'claims-past-year' },
  { label: 'I have NCD on another car', value: 'other-car' },
]
const otherCarNcdOptions = ['0', '10', '20', '30', '40', '50'].map((n) => ({ label: `${n}%`, value: n }))
const transferFromOptions = [
  { label: 'Current insurer', value: 'current' },
  { label: 'Previous insurer', value: 'previous' },
]
const ncd60YearsOptions = [
  { label: '1 year', value: '1' },
  { label: '2 years', value: '2' },
  { label: '3 years', value: '3' },
  { label: '4 years', value: '4' },
  { label: '5 or more years', value: '5+' },
]

// --- Dropdown v-models (with cascade clearing) ---
const years = computed({
  get: () => dh.value.yearsLicensed,
  set: (v) => { mutable.drivingHistory.yearsLicensed = v },
})
const ncd = computed({
  get: () => dh.value.ncd,
  set: (v) => {
    mutable.drivingHistory.ncd = v
    if (v !== '0') {
      mutable.drivingHistory.ncdZeroReason = null
      mutable.drivingHistory.otherCarNcd = null
      mutable.drivingHistory.ncdTransferFrom = null
    }
    if (v !== '50') mutable.drivingHistory.ncd60Years = null // DA NCD60 follow-up
  },
})
const zeroReason = computed({
  get: () => dh.value.ncdZeroReason,
  set: (v) => {
    mutable.drivingHistory.ncdZeroReason = v
    if (v !== 'other-car') {
      mutable.drivingHistory.otherCarNcd = null
      mutable.drivingHistory.ncdTransferFrom = null
    }
  },
})
const otherCarNcd = computed({
  get: () => dh.value.otherCarNcd,
  set: (v) => { mutable.drivingHistory.otherCarNcd = v },
})
const transferFrom = computed({
  get: () => dh.value.ncdTransferFrom,
  set: (v) => { mutable.drivingHistory.ncdTransferFrom = v },
})
const ncd60Years = computed({
  get: () => dh.value.ncd60Years,
  set: (v) => { mutable.drivingHistory.ncd60Years = v },
})

function setAf(v) { mutable.drivingHistory.atFaultClaims = v }
function setNaf(v) { mutable.drivingHistory.notAtFaultClaims = v }
function setCom(v) { mutable.drivingHistory.certificateOfMerit = v }

// --- Conditional reveals ---
const showZeroReason = computed(() => dh.value.ncd === '0')
const showOtherCar = computed(() => dh.value.ncd === '0' && dh.value.ncdZeroReason === 'other-car')
const showNcd60 = computed(() => dh.value.ncd === '50') // DA-only

// --- Validation ---
const ncdOk = computed(() => {
  if (dh.value.ncd === '0') {
    if (!dh.value.ncdZeroReason) return false
    if (dh.value.ncdZeroReason === 'other-car') return Boolean(dh.value.otherCarNcd && dh.value.ncdTransferFrom)
    return true
  }
  if (dh.value.ncd === '50') return Boolean(dh.value.ncd60Years)
  return true
})
const canContinue = computed(() =>
  Boolean(dh.value.yearsLicensed) &&
  Boolean(dh.value.atFaultClaims) &&
  Boolean(dh.value.notAtFaultClaims) &&
  dh.value.certificateOfMerit !== null &&
  Boolean(dh.value.ncd) &&
  ncdOk.value
)

const yearsError = computed(() => showErrors.value && !dh.value.yearsLicensed)
const afError = computed(() => showErrors.value && !dh.value.atFaultClaims)
const nafError = computed(() => showErrors.value && !dh.value.notAtFaultClaims)
const comError = computed(() => showErrors.value && dh.value.certificateOfMerit === null)
const ncdError = computed(() => showErrors.value && !dh.value.ncd)
const zeroReasonError = computed(() => showErrors.value && showZeroReason.value && !dh.value.ncdZeroReason)
const otherCarError = computed(() => showErrors.value && showOtherCar.value && !dh.value.otherCarNcd)
const transferError = computed(() => showErrors.value && showOtherCar.value && !dh.value.ncdTransferFrom)
const ncd60Error = computed(() => showErrors.value && showNcd60.value && !dh.value.ncd60Years)

// --- UW reject (front-end gate): at-fault 4+ or not-at-fault 5+ ---
const rejected = ref(false)
function onNext() {
  if (dh.value.atFaultClaims === '4+' || dh.value.notAtFaultClaims === '5+') {
    rejected.value = true
    window.scrollTo(0, 0)
    return
  }
  router.push('/step/8')
}
</script>

<template>
  <!-- UW reject screen -->
  <section v-if="rejected" class="step reject-step">
    <div class="reject">
      <h1 class="da-section-title">We can’t insure you online</h1>
      <p class="reject-body">
        Based on the driving history you entered, we’re not able to offer a quote online right now.
        Please call our team and we’ll take it from here.
      </p>
      <a class="reject-call" href="tel:+6562218688">Call us: +65 6221 8688</a>
      <button type="button" class="reject-back" @click="rejected = false">Back to driving history</button>
    </div>
  </section>

  <!-- Form -->
  <section v-else class="step">
    <h1 class="da-section-title">Main driver</h1>

    <div class="dh-form">
      <!-- Years of valid driving licence -->
      <div class="field" :data-error="yearsError ? 'true' : null">
        <p class="field-label">Years of valid driving licence</p>
        <DaSearchSelect v-model="years" :options="yearsOptions" placeholder="Select"
          field-outline="#CCCCCC" :invalid="yearsError" />
        <FieldError :show="yearsError" message="Select your years of driving licence." />
      </div>

      <!-- At-fault -->
      <div class="field" :data-error="afError ? 'true' : null">
        <p class="q-label">Total number of <strong>at-fault</strong> accidents and/or claims in the past 3 years</p>
        <div class="chips" :class="{ 'is-error': afError }" role="radiogroup" aria-label="At-fault claims">
          <button v-for="o in afOptions" :key="o" type="button" class="chip" role="radio"
            :aria-checked="dh.atFaultClaims === o" :class="{ 'is-on': dh.atFaultClaims === o }"
            @click="setAf(o)">{{ o }}</button>
        </div>
        <FieldError :show="afError" message="Select your at-fault claims." />
      </div>

      <!-- Not-at-fault -->
      <div class="field" :data-error="nafError ? 'true' : null">
        <p class="q-label">Total number of <strong>not-at-fault</strong> accidents and/or claims in the past 3 years</p>
        <div class="chips" :class="{ 'is-error': nafError }" role="radiogroup" aria-label="Not-at-fault claims">
          <button v-for="o in nafOptions" :key="o" type="button" class="chip" role="radio"
            :aria-checked="dh.notAtFaultClaims === o" :class="{ 'is-on': dh.notAtFaultClaims === o }"
            @click="setNaf(o)">{{ o }}</button>
        </div>
        <FieldError :show="nafError" message="Select your not-at-fault claims." />
      </div>

      <!-- Certificate of Merit -->
      <div class="field" :data-error="comError ? 'true' : null">
        <p class="field-label">Entitled to Certificate of Merit?</p>
        <div class="chips" :class="{ 'is-error': comError }" role="radiogroup" aria-label="Certificate of Merit">
          <button type="button" class="chip" role="radio" :aria-checked="dh.certificateOfMerit === true"
            :class="{ 'is-on': dh.certificateOfMerit === true }" @click="setCom(true)">Yes</button>
          <button type="button" class="chip" role="radio" :aria-checked="dh.certificateOfMerit === false"
            :class="{ 'is-on': dh.certificateOfMerit === false }" @click="setCom(false)">No</button>
        </div>
        <FieldError :show="comError" message="Tell us if you’re entitled to a Certificate of Merit." />
      </div>

      <!-- NCD -->
      <div class="field" :data-error="ncdError ? 'true' : null">
        <p class="field-label">No Claim Discount (NCD) at renewal</p>
        <DaSearchSelect v-model="ncd" :options="ncdOptions" placeholder="Select"
          field-outline="#CCCCCC" :invalid="ncdError" />
        <FieldError :show="ncdError" message="Select the policyholder’s NCD." />
      </div>

      <!-- NCD = 0% cascade -->
      <div v-if="showZeroReason" class="field" :data-error="zeroReasonError ? 'true' : null">
        <p class="field-label">NCD is 0% because</p>
        <DaSearchSelect v-model="zeroReason" :options="zeroReasonOptions" placeholder="Select"
          field-outline="#CCCCCC" :invalid="zeroReasonError" />
        <FieldError :show="zeroReasonError" message="Tell us why the NCD is 0%." />
      </div>
      <template v-if="showOtherCar">
        <div class="field" :data-error="otherCarError ? 'true' : null">
          <p class="field-label">What is your NCD on the other car?</p>
          <DaSearchSelect v-model="otherCarNcd" :options="otherCarNcdOptions" placeholder="Select"
            field-outline="#CCCCCC" :invalid="otherCarError" />
          <FieldError :show="otherCarError" message="Select the NCD on the other car." />
        </div>
        <div class="field" :data-error="transferError ? 'true' : null">
          <p class="field-label">NCD transferred from</p>
          <DaSearchSelect v-model="transferFrom" :options="transferFromOptions" placeholder="Select"
            field-outline="#CCCCCC" :invalid="transferError" />
          <FieldError :show="transferError" message="Select where the NCD is transferred from." />
        </div>
      </template>

      <!-- DA-only NCD60 follow-up (NCD = 50%) -->
      <div v-if="showNcd60" class="field" :data-error="ncd60Error ? 'true' : null">
        <p class="field-label">How many years has the vehicle held 50% NCD?</p>
        <DaSearchSelect v-model="ncd60Years" :options="ncd60YearsOptions" placeholder="Select"
          field-outline="#CCCCCC" :invalid="ncd60Error" />
        <FieldError :show="ncd60Error" message="Select how long the vehicle has held 50% NCD." />
      </div>
    </div>

    <StickyNext :disabled="!canContinue" intercept-next @next="onNext" @blocked="reveal" />
  </section>
</template>

<style scoped>
.step {
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dh-form { display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 8px; }

.field-label {
  margin: 0;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 600;
  line-height: 20px;
  color: #252525;
}
/* at-fault / not-at-fault labels — bold emphasis on the key phrase. */
.q-label {
  margin: 0;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 500;
  line-height: 23px;
  color: var(--da-ink);
}
.q-label strong { font-weight: 800; }

/* Segmented chip rows (at-fault, not-at-fault, COM). */
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
  text-align: center;
}
.chip.is-on { background: var(--da-blue); color: #fff; }
.chips.is-error .chip { border-color: var(--da-error); }

/* UW reject screen. */
.reject-step { justify-content: flex-start; }
.reject { display: flex; flex-direction: column; gap: 16px; padding-top: 8px; }
.reject-body {
  margin: 0;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 500;
  line-height: 23px;
  color: var(--da-ink);
}
.reject-call {
  font-family: var(--da-font);
  font-size: 18px;
  font-weight: 700;
  color: var(--da-red);
  text-decoration: none;
}
.reject-back {
  align-self: flex-start;
  background: #fff;
  border: 1px solid var(--da-ink);
  border-radius: var(--da-radius-card);
  padding: 10px 16px;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 600;
  color: var(--da-ink);
  cursor: pointer;
}
</style>
