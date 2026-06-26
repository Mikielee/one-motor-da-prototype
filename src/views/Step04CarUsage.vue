<script setup>
import { reactive, computed, watch } from 'vue'
import StickyNext from '../components/StickyNext.vue'
import RadioOptionCard from '../components/RadioOptionCard.vue'
import FieldError from '../components/FieldError.vue'
import { useQuote } from '../store/quote'
import { useValidation } from '../composables/useValidation'

const { quote, mutable } = useQuote()
const { showErrors, reveal } = useValidation()

const usageOptions = [
  { value: 'private-only', title: 'Private only', desc: 'Social, domestic and pleasure purposes only.' },
  { value: 'private-business', title: 'Private and business', desc: 'Personal use plus business activities.' },
]
const commuteOptions = [
  { value: 'regular', title: 'Regular commuting', desc: 'The car is driven to work or study at least once a week.' },
  { value: 'none', title: 'No commuting', desc: 'You work from home and/or the car is rarely or never driven to work or study.' },
]

const stored = quote.carUsage || {}
const form = reactive({
  usage: stored.usage ?? null,     // Q1
  commute: stored.commute ?? null, // Q2
  offPeak: stored.offPeak ?? null, // Q3
})
watch(form, () => { mutable.carUsage = { ...form } }, { deep: true })

// Progressive disclosure (OMP-90 AC):
//  - Disclaimer shows once Q1 is answered.
//  - Q2 (commute) only when Q1 = Private only.
//  - Q3 (off-peak) when Q1 = Private and business, OR when Q2 is answered.
const showQ2 = computed(() => form.usage === 'private-only')
const showQ3 = computed(() =>
  form.usage === 'private-business' ||
  (form.usage === 'private-only' && form.commute !== null)
)

function pickUsage(v) {
  // Switching Q1 clears the commute answer so Q2 is re-asked fresh.
  if (form.usage !== v) form.commute = null
  form.usage = v
}

const canContinue = computed(() =>
  form.usage !== null &&
  (form.usage === 'private-business' || form.commute !== null) &&
  showQ3.value && form.offPeak !== null
)

// Per-question errors — only the topmost unanswered VISIBLE question fires.
const q1Error = computed(() => showErrors.value && !form.usage)
const q2Error = computed(() => showErrors.value && showQ2.value && !form.commute)
const q3Error = computed(() => showErrors.value && showQ3.value && form.offPeak === null)

// Demo autofill — header "Car Insurance" chip.
import { useDemoAutofill } from '../composables/useDemoAutofill'
useDemoAutofill().register(() => { form.usage = 'private-business'; form.commute = null; form.offPeak = false })
</script>

<template>
  <section class="step">
    <h1 class="da-section-title">Tell us about your car</h1>

    <div class="usage-form">
      <!-- Q1 -->
      <div class="q-block">
        <p class="q-label">How do you use your car?</p>
        <div class="opt-stack q1-stack" role="radiogroup" aria-label="Car usage"
             :data-error="q1Error ? 'true' : null">
          <RadioOptionCard
            v-for="o in usageOptions"
            :key="o.value"
            :title="o.title"
            :description="o.desc"
            :selected="form.usage === o.value"
            :error="q1Error"
            @select="pickUsage(o.value)"
          />
          <div v-if="form.usage" class="disclaimer">
            <i class="pi pi-info-circle" aria-hidden="true"></i>
            <p><strong>Disclaimer</strong>: we do not cover ride hailing.</p>
          </div>
        </div>
        <FieldError :show="q1Error" message="Select your car usage." />
      </div>

      <!-- Q2 + Q3 -->
      <div v-if="showQ2 || showQ3" class="q2q3">
        <div v-if="showQ2" class="q-block">
          <p class="q-label">Do you use this car for any part of your commute to work or school?</p>
          <div class="opt-stack" role="radiogroup" aria-label="Commute"
               :data-error="q2Error ? 'true' : null">
            <RadioOptionCard
              v-for="o in commuteOptions"
              :key="o.value"
              :title="o.title"
              :description="o.desc"
              :selected="form.commute === o.value"
              :error="q2Error"
              @select="form.commute = o.value"
            />
          </div>
          <FieldError :show="q2Error" message="Tell us if you use your car for commuting." />
        </div>

        <div v-if="showQ3" class="q-block">
          <p class="q-label">Is this an off-peak car?</p>
          <div class="segment" :class="{ 'is-error': q3Error }"
               role="radiogroup" aria-label="Off-peak car"
               :data-error="q3Error ? 'true' : null">
            <button type="button" class="seg-btn" :class="{ 'is-on': form.offPeak === true }"
                    role="radio" :aria-checked="form.offPeak === true"
                    @click="form.offPeak = true">Yes</button>
            <button type="button" class="seg-btn" :class="{ 'is-on': form.offPeak === false }"
                    role="radio" :aria-checked="form.offPeak === false"
                    @click="form.offPeak = false">No</button>
          </div>
          <FieldError :show="q3Error" message="Tell us if this is an off-peak car." />
        </div>
      </div>
    </div>

    <StickyNext :disabled="!canContinue" @blocked="reveal" />
  </section>
</template>

<style scoped>
.step {
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.usage-form { display: flex; flex-direction: column; gap: 24px; }
.q2q3 { display: flex; flex-direction: column; gap: 16px; }
.q-block { display: flex; flex-direction: column; gap: 8px; }

.q-label {
  margin: 0;
  font-size: 14px;
  font-weight: 400;
  color: var(--da-ink);
  line-height: 20px;
}

.opt-stack { display: flex; flex-direction: column; gap: 8px; }
.q1-stack { gap: 16px; }

/* Disclaimer card — neutral blue-grey surface, info icon + text (node 5584:7813). */
.disclaimer {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #E6E9ED;
  border: 1px solid #CCCCCC;
  border-radius: var(--da-radius-card);
  padding: 8px;
}
.disclaimer .pi { color: var(--da-ink); font-size: 18px; margin-top: 1px; flex-shrink: 0; }
.disclaimer p { margin: 0; font-size: 14px; font-weight: 400; color: var(--da-ink); line-height: 20px; }
.disclaimer strong { font-weight: 700; }

/* Off-peak Yes/No segmented pair (node 5584:7850). Selected = blue fill + white
   text; both keep the M3 outline. */
.segment { display: flex; gap: 8px; }
.seg-btn {
  flex: 1;
  height: 48px;
  background: #fff;
  border: 1px solid var(--da-outline);
  border-radius: var(--da-radius-card);
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--da-ink);
  cursor: pointer;
}
.seg-btn.is-on {
  background: var(--da-blue);
  border-color: var(--da-outline);
  color: #fff;
}
.segment.is-error .seg-btn { border-color: var(--da-error); }
</style>
