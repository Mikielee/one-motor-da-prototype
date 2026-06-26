<script setup>
import { computed } from 'vue'
import DaDateField from '../components/DaDateField.vue'
import StickyNext from '../components/StickyNext.vue'
import { useQuote } from '../store/quote'

const { quote, mutable } = useQuote()

// Cover end-date window: min 7 months, max 18 months from the start date
// (KB cccf64c6 / f1898394). Default end = start + 12 months.
const endMin = computed(() => {
  if (!quote.coverStartDate) return null
  const d = new Date(quote.coverStartDate)
  d.setMonth(d.getMonth() + 7)
  return d
})
const endMax = computed(() => {
  if (!quote.coverStartDate) return null
  const d = new Date(quote.coverStartDate)
  d.setMonth(d.getMonth() + 18)
  return d
})

const startDate = computed({
  get: () => quote.coverStartDate,
  set: (v) => {
    mutable.coverStartDate = v
    if (!v) return
    if (!quote.coverEndDate) {
      // Auto-fill end date to start + 1 year, then enable the field.
      const end = new Date(v)
      end.setFullYear(end.getFullYear() + 1)
      mutable.coverEndDate = end
    } else {
      // Keep an existing end date inside the new 7-18 month window.
      const current = new Date(quote.coverEndDate)
      if (current < endMin.value) mutable.coverEndDate = endMin.value
      else if (current > endMax.value) mutable.coverEndDate = endMax.value
    }
  },
})

const endDate = computed({
  get: () => quote.coverEndDate,
  set: (v) => { mutable.coverEndDate = v },
})

const minStart = new Date() // past dates not selectable

// Next is disabled (not blocked) until both dates are set — no error message (OMP-88 AC).
const canContinue = computed(() => Boolean(quote.coverStartDate && quote.coverEndDate))

// Demo autofill — header "Car Insurance" chip.
import { useDemoAutofill } from '../composables/useDemoAutofill'
useDemoAutofill().register(() => { const s = new Date(); s.setHours(0,0,0,0); const e = new Date(s); e.setFullYear(e.getFullYear() + 1); e.setDate(e.getDate() - 1); mutable.coverStartDate = s; mutable.coverEndDate = e })
</script>

<template>
  <section class="step">
    <h1 class="da-section-title">When would you like your Policy to start?</h1>

    <div class="date-form">
      <div class="field">
        <label class="date-label" for="start-date">Policy start date</label>
        <DaDateField id="start-date" v-model="startDate" :min-date="minStart" />
      </div>

      <div class="field">
        <label class="date-label" for="end-date">Policy end date</label>
        <DaDateField
          id="end-date"
          v-model="endDate"
          :min-date="endMin"
          :max-date="endMax"
          :disabled="!quote.coverStartDate"
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

.date-form { display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 5px; }

.date-label {
  font-size: 16px;
  font-weight: 700;
  color: var(--da-ink);
  line-height: 1.4;
}
</style>
