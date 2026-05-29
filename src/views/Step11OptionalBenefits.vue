<script setup>
import { computed, reactive, ref } from 'vue'
import InputText from 'primevue/inputtext'
import StickyNext from '../components/StickyNext.vue'
import { useQuote } from '../store/quote'

const { quote, mutable } = useQuote()

// DA-only: Drive Less, Pay Less. This pre-price upsell is shown ONLY to
// customers flagged eligible on the mileage step (annual distance < 8,000km).
// Opting in requires a current odometer reading so usage can be verified, so
// the reading field is revealed inline the moment they switch it on.
const driveLessEligible = computed(() => quote.driveLessEligible)

const dlpl = reactive({
  optedIn: quote.driveLess === true,
  odometer: quote.odometerReading != null ? String(quote.odometerReading) : '',
})

function toggleDriveLess() {
  dlpl.optedIn = !dlpl.optedIn
  mutable.driveLess = dlpl.optedIn
  if (!dlpl.optedIn) {
    dlpl.odometer = ''
    mutable.odometerReading = null
  }
}

function onOdometer(v) {
  const digits = String(v ?? '').replace(/[^0-9]/g, '')
  dlpl.odometer = digits
  mutable.odometerReading = digits ? Number(digits) : null
}

// NCD Protector is NOT shown to users — internal memory rule from product.
const benefits = [
  {
    id: 'breakdown-assistance',
    title: '24-hour Breakdown Assistance',
    price: '$8.11',
    blurb: 'Round-the-clock help if your car breaks down, including tow-to-workshop service.',
    recommended: true,
  },
  {
    id: 'personal-accident',
    title: 'Personal accident',
    price: '$8.11',
    blurb: 'A lump-sum payment if a covered accident leads to death or permanent disability.',
    recommended: false,
  },
]

const selected = ref(new Set(quote.optionalBenefits || []))

function toggle(id) {
  if (selected.value.has(id)) selected.value.delete(id)
  else selected.value.add(id)
  mutable.optionalBenefits = Array.from(selected.value)
  // force reactivity by reassigning
  selected.value = new Set(selected.value)
}

// If they opted in to Drive Less, Pay Less, an odometer reading is required.
const canContinue = computed(() => {
  if (driveLessEligible.value && dlpl.optedIn) return Boolean(dlpl.odometer)
  return true
})
</script>

<template>
  <section class="step">
    <h1 class="da-section-title">Want extra coverage?</h1>

    <!-- DA-only: Drive Less, Pay Less — shown only to eligible low-mileage drivers. -->
    <div v-if="driveLessEligible" class="dlpl-card" :class="{ 'is-on': dlpl.optedIn }">
      <div class="dlpl-head">
        <div class="dlpl-title-wrap">
          <span class="dlpl-eyebrow">
            <i class="pi pi-verified" aria-hidden="true"></i>
            You qualify · drives under 8,000km/year
          </span>
          <p class="dlpl-title">Drive Less, Pay Less</p>
        </div>
        <button
          type="button"
          class="switch"
          :class="{ 'is-on': dlpl.optedIn }"
          :aria-pressed="dlpl.optedIn"
          aria-label="Opt in to Drive Less, Pay Less"
          @click="toggleDriveLess"
        >
          <span class="switch-handle" />
        </button>
      </div>

      <p class="dlpl-blurb">
        Pay a premium based on how little you drive. We set your price from your
        current mileage, and you simply confirm your odometer reading to get started.
        Drive more than expected? You can top up to unlimited cover anytime.
      </p>

      <ul class="dlpl-points">
        <li><i class="pi pi-check" aria-hidden="true"></i> Lower premium for low-mileage drivers</li>
        <li><i class="pi pi-check" aria-hidden="true"></i> Odometer reading required to confirm usage</li>
        <li><i class="pi pi-check" aria-hidden="true"></i> Top up to unlimited km whenever you need</li>
      </ul>

      <div v-if="dlpl.optedIn" class="odo">
        <label class="da-field-label" for="odo-input">Your current odometer reading (km)</label>
        <InputText
          id="odo-input"
          :model-value="dlpl.odometer"
          @update:model-value="onOdometer"
          inputmode="numeric"
          placeholder="e.g. 45200"
          class="odo-input"
          fluid
        />
        <p class="odo-help">
          <i class="pi pi-camera" aria-hidden="true"></i>
          You'll be asked to upload a photo of your odometer so we can verify this reading.
        </p>
      </div>
    </div>

    <div class="benefits">
      <div
        v-for="b in benefits"
        :key="b.id"
        class="benefit-card"
        :class="{ 'is-on': selected.has(b.id) }"
      >
        <div v-if="b.recommended" class="badge">Recommended</div>
        <div class="benefit-row">
          <p class="benefit-title">{{ b.title }}</p>
          <button
            type="button"
            class="switch"
            :class="{ 'is-on': selected.has(b.id) }"
            :aria-pressed="selected.has(b.id)"
            @click="toggle(b.id)"
          >
            <span class="switch-handle" />
          </button>
        </div>
        <div class="price-pill">{{ b.price }}</div>
        <p class="benefit-blurb">{{ b.blurb }}</p>
        <a href="#" class="learn-more">Learn more</a>
      </div>
    </div>

    <StickyNext :disabled="!canContinue" label="Get my quote" />
  </section>
</template>

<style scoped>
.step {
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.benefits {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Drive Less, Pay Less (DA-only) — a hero upsell card with a teal accent. */
.dlpl-card {
  position: relative;
  background: var(--da-success-bg);
  border: 1px solid var(--da-green);
  border-radius: var(--da-radius-lg);
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.dlpl-card.is-on {
  box-shadow: 0 0 0 1px var(--da-green) inset;
}
.dlpl-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.dlpl-title-wrap { display: flex; flex-direction: column; gap: 4px; }
.dlpl-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--da-green-darker);
}
.dlpl-title {
  margin: 0;
  font-size: 18px;
  font-weight: 900;
  color: var(--da-carbon);
}
.dlpl-blurb {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--da-carbon);
  line-height: 1.5;
}
.dlpl-points {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dlpl-points li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--da-carbon);
  line-height: 1.4;
}
.dlpl-points .pi { color: var(--da-green); font-size: 14px; margin-top: 1px; flex-shrink: 0; }

.odo {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--da-green);
}
.odo-help {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  color: var(--da-grey-600);
  line-height: 1.4;
}
.odo-help .pi { color: var(--da-green); font-size: 14px; margin-top: 1px; flex-shrink: 0; }

.benefit-card {
  position: relative;
  background: #fff;
  border: 1px solid #CCCCCC;
  border-radius: var(--da-radius-card);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 1px 1px rgba(0,0,0,0.05), 0 2px 2px rgba(0,0,0,0.1);
}
.benefit-card.is-on {
  border-color: var(--da-green);
  box-shadow: 0 0 0 1px var(--da-green) inset, 0 1px 1px rgba(0,0,0,0.05);
}

.badge {
  position: absolute;
  top: -11px;
  left: 17px;
  background: var(--da-green);
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 30px;
}

.benefit-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.benefit-title {
  margin: 0;
  font-size: 16px;
  font-weight: 900;
  color: var(--da-carbon);
  flex: 1;
}

.switch {
  position: relative;
  width: 52px;
  height: 32px;
  border-radius: 100px;
  border: 2px solid var(--da-grey-600);
  background: #fff;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: background-color 150ms ease, border-color 150ms ease;
}
.switch-handle {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--da-grey-600);
  transition: left 150ms ease, background-color 150ms ease;
}
.switch.is-on {
  background: var(--da-green);
  border-color: var(--da-green);
}
.switch.is-on .switch-handle {
  left: 24px;
  background: #fff;
}

.price-pill {
  align-self: flex-start;
  background: var(--da-grey-100);
  border-radius: var(--da-radius-card);
  padding: 4px 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--da-carbon);
}

.benefit-blurb {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--da-carbon);
  line-height: 1.5;
}

.learn-more {
  font-size: 14px;
  font-weight: 700;
  color: var(--da-cyan);
  text-decoration: none;
}
.learn-more:hover { text-decoration: underline; }
</style>
