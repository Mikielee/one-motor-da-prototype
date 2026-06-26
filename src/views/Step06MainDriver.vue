<script setup>
import { computed } from 'vue'
import DaSearchSelect from '../components/DaSearchSelect.vue'
import DaDateField from '../components/DaDateField.vue'
import StickyNext from '../components/StickyNext.vue'
import { useQuote } from '../store/quote'

const { quote, mutable } = useQuote()
const md = computed(() => quote.mainDriver)

const maritalOptions = [
  { label: 'Single', value: 'single' },
  { label: 'Married', value: 'married' },
  { label: 'Divorced', value: 'divorced' },
  { label: 'Widowed', value: 'widowed' },
]

const maritalStatus = computed({
  get: () => quote.mainDriver.maritalStatus || null,
  set: (v) => { mutable.mainDriver.maritalStatus = v },
})
const dob = computed({
  get: () => quote.mainDriver.dob,
  set: (v) => { mutable.mainDriver.dob = v },
})

// Driver must be at least 18; cap the calendar accordingly.
const now = new Date()
const dobMax = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate())
const dobMin = new Date(now.getFullYear() - 100, 0, 1)

function setPolicyholder(v) { mutable.mainDriver.isPolicyholder = v }
function setGender(v) { mutable.mainDriver.gender = v }

const canContinue = computed(() =>
  md.value.isPolicyholder !== null &&
  Boolean(md.value.gender) &&
  Boolean(md.value.maritalStatus) &&
  Boolean(md.value.dob)
)

// Demo autofill — header "Car Insurance" chip.
import { useDemoAutofill } from '../composables/useDemoAutofill'
useDemoAutofill().register(() => { mutable.mainDriver.isPolicyholder = true; mutable.mainDriver.gender = 'male'; mutable.mainDriver.maritalStatus = 'single'; mutable.mainDriver.dob = new Date(1990, 0, 1) })
</script>

<template>
  <section class="step">
    <h1 class="da-section-title">Main driver details</h1>

    <div class="md-form">
      <!-- Is the main driver also the policyholder? -->
      <div class="field">
        <p class="field-label">Is the main driver also the policyholder?</p>
        <div class="seg" role="radiogroup" aria-label="Main driver is policyholder">
          <button type="button" class="seg-btn" role="radio"
            :aria-checked="md.isPolicyholder === true"
            :class="{ 'is-on': md.isPolicyholder === true }"
            @click="setPolicyholder(true)">Yes</button>
          <button type="button" class="seg-btn" role="radio"
            :aria-checked="md.isPolicyholder === false"
            :class="{ 'is-on': md.isPolicyholder === false }"
            @click="setPolicyholder(false)">No</button>
        </div>
      </div>

      <!-- Gender -->
      <div class="field">
        <p class="field-label">Gender</p>
        <div class="seg" role="radiogroup" aria-label="Gender">
          <button type="button" class="seg-btn" role="radio"
            :aria-checked="md.gender === 'male'"
            :class="{ 'is-on': md.gender === 'male' }"
            @click="setGender('male')">Male</button>
          <button type="button" class="seg-btn" role="radio"
            :aria-checked="md.gender === 'female'"
            :class="{ 'is-on': md.gender === 'female' }"
            @click="setGender('female')">Female</button>
        </div>
      </div>

      <!-- Marital status -->
      <div class="field">
        <DaSearchSelect
          v-model="maritalStatus"
          :options="maritalOptions"
          placeholder="Marital status"
          field-outline="#CCCCCC"
        />
      </div>

      <!-- Date of birth -->
      <div class="field">
        <label class="field-label" for="dob">Date of birth</label>
        <DaDateField
          id="dob"
          v-model="dob"
          :min-date="dobMin"
          :max-date="dobMax"
          field-outline="#CCCCCC"
        />
      </div>
    </div>

    <StickyNext :disabled="!canContinue" />
  </section>
</template>

<style scoped>
.step {
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.md-form { display: flex; flex-direction: column; gap: 24px; }
.field { display: flex; flex-direction: column; gap: 8px; }

.field-label {
  margin: 0;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 600;
  line-height: 20px;
  color: #252525;
}

/* Yes/No · Male/Female segmented pairs (48px, #CCCCCC outline). */
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
</style>
