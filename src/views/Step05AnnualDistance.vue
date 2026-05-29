<script setup>
import { computed, reactive, watch } from 'vue'
import StickyNext from '../components/StickyNext.vue'
import { useQuote } from '../store/quote'

const { quote, mutable } = useQuote()

// Figma OMP-91 note: Drive Less, Pay Less is DirectAsia only. In the DA
// journey, choosing the lowest band (< 8,000km/year) flags the customer as
// ELIGIBLE for Drive Less, Pay Less. The actual opt-in (and the odometer
// reading it requires) happens later, on the Optional Benefits step.
const options = [
  { value: 'under-8000', label: 'Less than 8,000km' },
  { value: '8000-12000', label: '8,000 to 12,000km' },
  { value: '12000-18000', label: '12,000 to 18,000km' },
  { value: 'over-18000', label: 'More than 18,000km' },
]

const local = reactive({
  band: quote.annualDistance || null,
  showError: false,
})

const driveLessEligible = computed(() => local.band === 'under-8000')

function select(value) {
  local.band = value
  local.showError = false
  mutable.annualDistance = value
  mutable.driveLessEligible = value === 'under-8000'
}

const canContinue = computed(() => Boolean(local.band))

watch(canContinue, (v) => { if (v) local.showError = false })
</script>

<template>
  <section class="step">
    <h1 class="da-section-title">How far do you drive in a year?</h1>

    <p class="hint">
      Most Singapore drivers cover under 8,000km a year. As a rough guide,
      <strong>22km a day = 154km a week = around 8,000km a year</strong>.
    </p>

    <div class="distance-grid" role="radiogroup" aria-label="Annual distance">
      <button
        v-for="o in options"
        :key="o.value"
        type="button"
        role="radio"
        :aria-checked="local.band === o.value"
        class="distance-card"
        :class="{ 'is-selected': local.band === o.value }"
        @click="select(o.value)"
      >
        {{ o.label }}
      </button>
    </div>

    <p v-if="local.showError" class="da-inline-error" role="alert">
      Please select a mileage band to continue.
    </p>

    <div v-if="driveLessEligible" class="dlpl-badge" role="status">
      <i class="pi pi-verified" aria-hidden="true"></i>
      <span>
        Good news, you may qualify for our <strong>Drive Less, Pay Less</strong> discount.
        We'll show you the details before your quote.
      </span>
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

.hint {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--da-grey-600);
}
.hint strong {
  color: var(--da-carbon);
  font-weight: 700;
}

.distance-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.distance-card {
  background: #fff;
  border: 1px solid var(--da-grey-300);
  border-radius: var(--da-radius-card);
  padding: 16px 12px;
  min-height: 58px;
  font-size: 14px;
  font-weight: 700;
  color: var(--da-carbon);
  text-align: center;
  cursor: pointer;
  transition: border-color 120ms ease, box-shadow 120ms ease, color 120ms ease;
  font-family: var(--da-font);
}
.distance-card:hover { border-color: var(--da-grey-500); }
.distance-card.is-selected {
  border-color: var(--da-green);
  box-shadow: 0 0 0 1px var(--da-green) inset;
  color: var(--da-green);
}

.dlpl-badge {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: var(--da-success-bg);
  border: 1px solid var(--da-green);
  border-radius: var(--da-radius-card);
  padding: 12px 14px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--da-carbon);
}
.dlpl-badge .pi {
  color: var(--da-green);
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 1px;
}
.dlpl-badge strong { font-weight: 800; color: var(--da-green-darker); }
</style>
