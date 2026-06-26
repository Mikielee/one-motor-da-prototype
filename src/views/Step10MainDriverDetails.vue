<script setup>
import { computed } from 'vue'
import DaFloatingInput from '../components/DaFloatingInput.vue'
import DaDateField from '../components/DaDateField.vue'
import DaSearchSelect from '../components/DaSearchSelect.vue'
import StickyNext from '../components/StickyNext.vue'
import FieldError from '../components/FieldError.vue'
import { useQuote } from '../store/quote'
import { useValidation } from '../composables/useValidation'

const { quote, mutable } = useQuote()
const { showErrors, reveal } = useValidation()
const md = computed(() => quote.mainDriver)
const dh = computed(() => quote.drivingHistory)

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

// Bound directly to the store (prefilled from earlier steps).
const fullName = computed({ get: () => md.value.name, set: (v) => { mutable.mainDriver.name = v } })
const nric = computed({ get: () => md.value.nric, set: (v) => { mutable.mainDriver.nric = v } })
const dob = computed({ get: () => md.value.dob, set: (v) => { mutable.mainDriver.dob = v } })
const marital = computed({ get: () => md.value.maritalStatus || null, set: (v) => { mutable.mainDriver.maritalStatus = v } })
const years = computed({ get: () => dh.value.yearsLicensed, set: (v) => { mutable.drivingHistory.yearsLicensed = v } })

function setGender(v) { mutable.mainDriver.gender = v }
function setAf(v) { mutable.drivingHistory.atFaultClaims = v }
function setNaf(v) { mutable.drivingHistory.notAtFaultClaims = v }
function setCom(v) { mutable.drivingHistory.certificateOfMerit = v }

const now = new Date()
const dobMax = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate())
const dobMin = new Date(now.getFullYear() - 100, 0, 1)

const canContinue = computed(() =>
  Boolean((md.value.name || '').trim()) &&
  Boolean((md.value.nric || '').trim()) &&
  Boolean(md.value.dob) &&
  Boolean(md.value.gender) &&
  Boolean(md.value.maritalStatus) &&
  Boolean(dh.value.yearsLicensed) &&
  Boolean(dh.value.atFaultClaims) &&
  Boolean(dh.value.notAtFaultClaims) &&
  dh.value.certificateOfMerit !== null
)

const nameError = computed(() => showErrors.value && !(md.value.name || '').trim())
const nricError = computed(() => showErrors.value && !(md.value.nric || '').trim())
const dobError = computed(() => showErrors.value && !md.value.dob)
const genderError = computed(() => showErrors.value && !md.value.gender)
const maritalError = computed(() => showErrors.value && !md.value.maritalStatus)
const yearsError = computed(() => showErrors.value && !dh.value.yearsLicensed)
const afError = computed(() => showErrors.value && !dh.value.atFaultClaims)
const nafError = computed(() => showErrors.value && !dh.value.notAtFaultClaims)
const comError = computed(() => showErrors.value && dh.value.certificateOfMerit === null)
</script>

<template>
  <section class="step">
    <h1 class="da-section-title">Tell us more about the Main Driver</h1>

    <div class="md-form">
      <div class="field" :data-error="nameError ? 'true' : null">
        <DaFloatingInput id="md-name" v-model="fullName" label="Full name (as per NRIC)" :invalid="nameError" autocomplete="name" />
        <FieldError :show="nameError" message="Enter the main driver's full name." />
      </div>

      <div class="field" :data-error="nricError ? 'true' : null">
        <DaFloatingInput id="md-nric" v-model="nric" label="NRIC/FIN" :invalid="nricError" />
        <FieldError :show="nricError" message="Enter the main driver's NRIC/FIN." />
      </div>

      <div class="field" :data-error="dobError ? 'true' : null">
        <label class="field-label" for="md-dob">Date of birth</label>
        <DaDateField id="md-dob" v-model="dob" :min-date="dobMin" :max-date="dobMax" field-outline="#CCCCCC" :invalid="dobError" />
        <FieldError :show="dobError" message="Enter the main driver's date of birth." />
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

      <div class="field" :data-error="maritalError ? 'true' : null">
        <label class="field-label">Marital status</label>
        <DaSearchSelect v-model="marital" :options="maritalOptions" placeholder="Select" field-outline="#CCCCCC" :invalid="maritalError" />
        <FieldError :show="maritalError" message="Select a marital status." />
      </div>

      <div class="field" :data-error="yearsError ? 'true' : null">
        <label class="field-label">Years of valid driving licence</label>
        <DaSearchSelect v-model="years" :options="yearsOptions" placeholder="Select" field-outline="#CCCCCC" :invalid="yearsError" />
        <FieldError :show="yearsError" message="Select years of driving licence." />
      </div>

      <div class="field" :data-error="afError ? 'true' : null">
        <p class="q-label">Total number of <strong>at-fault</strong> accidents and/or claims in the past 3 years</p>
        <div class="chips" :class="{ 'is-error': afError }" role="radiogroup" aria-label="At-fault claims">
          <button v-for="o in afOptions" :key="o" type="button" class="chip" role="radio"
            :aria-checked="dh.atFaultClaims === o" :class="{ 'is-on': dh.atFaultClaims === o }" @click="setAf(o)">{{ o }}</button>
        </div>
        <FieldError :show="afError" message="Select at-fault claims." />
      </div>

      <div class="field" :data-error="nafError ? 'true' : null">
        <p class="q-label">Total number of <strong>not-at-fault</strong> accidents and/or claims in the past 3 years</p>
        <div class="chips" :class="{ 'is-error': nafError }" role="radiogroup" aria-label="Not-at-fault claims">
          <button v-for="o in nafOptions" :key="o" type="button" class="chip" role="radio"
            :aria-checked="dh.notAtFaultClaims === o" :class="{ 'is-on': dh.notAtFaultClaims === o }" @click="setNaf(o)">{{ o }}</button>
        </div>
        <FieldError :show="nafError" message="Select not-at-fault claims." />
      </div>

      <div class="field" :data-error="comError ? 'true' : null">
        <p class="field-label">Entitled to Certificate of Merit?</p>
        <div class="seg" :class="{ 'is-error': comError }" role="radiogroup" aria-label="Certificate of Merit">
          <button type="button" class="seg-btn" role="radio" :aria-checked="dh.certificateOfMerit === true"
            :class="{ 'is-on': dh.certificateOfMerit === true }" @click="setCom(true)">Yes</button>
          <button type="button" class="seg-btn" role="radio" :aria-checked="dh.certificateOfMerit === false"
            :class="{ 'is-on': dh.certificateOfMerit === false }" @click="setCom(false)">No</button>
        </div>
        <FieldError :show="comError" message="Tell us if the main driver is entitled to a Certificate of Merit." />
      </div>
    </div>

    <StickyNext :disabled="!canContinue" @blocked="reveal" />
  </section>
</template>

<style scoped>
.step { padding-top: 24px; display: flex; flex-direction: column; gap: 16px; }
.md-form { display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 8px; }

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
  color: var(--da-ink);
}
.q-label strong { font-weight: 800; }

/* Segments (Gender, COM) — 48px, #CCCCCC outline, selected blue. */
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
  text-align: center;
}
.chip.is-on { background: var(--da-blue); color: #fff; }
.chips.is-error .chip { border-color: var(--da-error); }
</style>
