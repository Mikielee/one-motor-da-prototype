<script setup>
import { computed, reactive } from 'vue'
import Select from 'primevue/select'
import StickyNext from '../components/StickyNext.vue'
import { useQuote } from '../store/quote'

const { quote, mutable } = useQuote()

const yearsOptions = Array.from({ length: 41 }, (_, i) => ({
  label: i === 0 ? 'Less than 1 year' : `${i} year${i === 1 ? '' : 's'}`,
  value: i,
}))

const ncdOptions = [
  { label: '0%', value: 0 },
  { label: '10%', value: 10 },
  { label: '20%', value: 20 },
  { label: '30%', value: 30 },
  { label: '40%', value: 40 },
  { label: '50%', value: 50 },
]

// DA-only: customers at 50% NCD are asked how long they've held it. Holding
// 50% for long enough qualifies for NCD60 (NCD protector). DirectAsia only.
const ncd60Options = [
  { label: 'Less than 3 years', value: 'under-3' },
  { label: '3 to 5 years', value: '3-5' },
  { label: '6 years or more', value: '6-plus' },
]

const atFaultOptions = [
  { label: '0', value: 0 },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3+', value: 3 },
]

const notAtFaultOptions = [
  { label: '0', value: 0 },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4+', value: 4 },
]

const local = reactive({
  yearsLicensed: quote.drivingHistory?.yearsLicensed ?? null,
  atFault: quote.drivingHistory?.atFaultClaims ?? null,
  notAtFault: quote.drivingHistory?.notAtFaultClaims ?? null,
  certOfMerit: quote.drivingHistory?.certificateOfMerit ?? null,
  ncd: quote.drivingHistory?.ncd ?? null,
  ncd60: quote.drivingHistory?.ncd60 ?? null,
})

function sync() {
  mutable.drivingHistory = {
    ...quote.drivingHistory,
    yearsLicensed: local.yearsLicensed,
    atFaultClaims: local.atFault,
    notAtFaultClaims: local.notAtFault,
    certificateOfMerit: local.certOfMerit,
    ncd: local.ncd,
    ncd60: local.ncd60,
  }
}

function setAtFault(v) { local.atFault = v; sync() }
function setNotAtFault(v) { local.notAtFault = v; sync() }
function setCertOfMerit(v) { local.certOfMerit = v; sync() }
function onYearsChange(v) { local.yearsLicensed = v; sync() }
function onNcdChange(v) {
  local.ncd = v
  if (v !== 50) local.ncd60 = null   // NCD60 only applies at 50% NCD
  sync()
}
function onNcd60Change(v) { local.ncd60 = v; sync() }

const canContinue = computed(() =>
  local.yearsLicensed !== null
  && local.atFault !== null
  && local.notAtFault !== null
  && local.certOfMerit !== null
  && local.ncd !== null
  && (local.ncd !== 50 || local.ncd60 !== null)
)
</script>

<template>
  <section class="step">
    <h1 class="da-section-title">Your driving history</h1>

    <div class="field">
      <label class="field-label">Years of valid driving licence</label>
      <Select
        :model-value="local.yearsLicensed"
        @update:model-value="onYearsChange"
        :options="yearsOptions"
        option-label="label"
        option-value="value"
        placeholder=" "
        class="da-select"
        fluid
      />
    </div>

    <p class="prefix">
      In the 3 years prior to the start of the policy, all drivers to be insured had the following:
    </p>

    <div class="field">
      <p class="field-label">
        Total number of <strong>at-fault</strong> accidents and/or claims
      </p>
      <div class="chip-row">
        <button
          v-for="o in atFaultOptions"
          :key="o.value"
          type="button"
          class="chip"
          :class="{ 'is-selected': local.atFault === o.value }"
          @click="setAtFault(o.value)"
        >{{ o.label }}</button>
      </div>
    </div>

    <div class="field">
      <p class="field-label">
        Total number of <strong>not-at-fault</strong> accidents and/or claims
      </p>
      <div class="chip-row">
        <button
          v-for="o in notAtFaultOptions"
          :key="o.value"
          type="button"
          class="chip"
          :class="{ 'is-selected': local.notAtFault === o.value }"
          @click="setNotAtFault(o.value)"
        >{{ o.label }}</button>
      </div>
    </div>

    <div class="field">
      <p class="field-label">Entitled to Certificate of Merit?</p>
      <div class="yes-no">
        <button
          type="button"
          class="yn-button"
          :class="{ 'is-selected': local.certOfMerit === true }"
          @click="setCertOfMerit(true)"
        >Yes</button>
        <button
          type="button"
          class="yn-button"
          :class="{ 'is-selected': local.certOfMerit === false }"
          @click="setCertOfMerit(false)"
        >No</button>
      </div>
    </div>

    <div class="field">
      <label class="field-label">No Claim Discount (NCD) at renewal</label>
      <Select
        :model-value="local.ncd"
        @update:model-value="onNcdChange"
        :options="ncdOptions"
        option-label="label"
        option-value="value"
        placeholder=" "
        class="da-select"
        fluid
      />
    </div>

    <div v-if="local.ncd === 50" class="field">
      <label class="field-label">How long have you held 50% NCD?</label>
      <p class="ncd60-hint">Holding 50% NCD may qualify you for added NCD protection.</p>
      <Select
        :model-value="local.ncd60"
        @update:model-value="onNcd60Change"
        :options="ncd60Options"
        option-label="label"
        option-value="value"
        placeholder=" "
        class="da-select"
        fluid
      />
    </div>

    <StickyNext :disabled="!canContinue" />
  </section>
</template>

<style scoped>
.step {
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field { display: flex; flex-direction: column; gap: 8px; }

.field-label {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--da-carbon);
  line-height: 1.4;
}
.field-label strong { font-weight: 900; }

.prefix {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--da-carbon);
  line-height: 1.4;
}

.ncd60-hint {
  margin: 0 0 4px 0;
  font-size: 12px;
  font-weight: 500;
  color: var(--da-grey-600);
  line-height: 1.4;
}

.chip-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.chip {
  flex: 1 1 0;
  min-width: 0;
  background: #fff;
  border: 1px solid var(--da-grey-300);
  border-radius: var(--da-radius-card);
  padding: 16px;
  min-height: 56px;
  font-size: 16px;
  font-weight: 700;
  color: var(--da-carbon);
  text-align: center;
  cursor: pointer;
  font-family: var(--da-font);
}
.chip.is-selected {
  border-color: var(--da-green);
  box-shadow: 0 0 0 1px var(--da-green) inset;
}

.yes-no { display: flex; gap: 8px; }
.yn-button {
  flex: 1;
  background: #fff;
  border: 1px solid var(--da-grey-300);
  border-radius: var(--da-radius-card);
  padding: 16px;
  min-height: 56px;
  font-size: 16px;
  font-weight: 700;
  color: var(--da-carbon);
  cursor: pointer;
  font-family: var(--da-font);
}
.yn-button.is-selected {
  border-color: var(--da-green);
  box-shadow: 0 0 0 1px var(--da-green) inset;
}

/* Field styling comes from global style.css — no Select overrides needed. */
</style>
