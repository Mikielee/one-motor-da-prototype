<script setup>
import { computed } from 'vue'
import StickyNext from '../components/StickyNext.vue'
import { useQuote } from '../store/quote'

const { quote, mutable } = useQuote()

const bands = [
  { value: 'less-8000', label: 'Less than 8,000km' },
  { value: '8000-12000', label: '8,000– 12,000km' },
  { value: '12001-18000', label: '12,001–18,000km' },
  { value: 'over-18000', label: 'Over 18,000km' },
]

// "Drive Less, Pay Less" eligibility (DA-only) = under 8,000 km/year.
const eligible = computed(() => quote.annualDistance === 'less-8000')

function pickBand(v) {
  mutable.annualDistance = v
  mutable.driveLessEligible = v === 'less-8000'
  if (v !== 'less-8000') {
    // No longer eligible — clear the opt-in + any odometer reading.
    mutable.driveLess = null
    mutable.odometerReading = null
  }
}

function pickDriveLess(v) {
  mutable.driveLess = v
  if (!v) mutable.odometerReading = null
}

const canContinue = computed(() =>
  Boolean(quote.annualDistance) && (!eligible.value || quote.driveLess !== null)
)
</script>

<template>
  <section class="step">
    <h1 class="da-section-title">How far do you drive in a year?</h1>

    <div class="dist-form">
      <!-- Distance bands -->
      <div class="band-grid" role="radiogroup" aria-label="Annual distance">
        <button
          v-for="b in bands"
          :key="b.value"
          type="button"
          role="radio"
          :aria-checked="quote.annualDistance === b.value"
          class="band-btn"
          :class="{ 'is-on': quote.annualDistance === b.value }"
          @click="pickBand(b.value)"
        >
          {{ b.label }}
        </button>
      </div>

      <!-- Always-on helper card -->
      <div class="info-card">
        <span class="card-ic" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M2.99762 11.9977C2.99762 7.02562 7.02556 2.99768 11.9976 2.99768C16.9697 2.99768 20.9976 7.02562 20.9976 11.9977C20.9976 16.9697 16.9697 20.9977 11.9976 20.9977C7.02556 21.0024 2.99762 16.9697 2.99762 11.9977ZM6.71243 6.71249C5.3603 8.06937 4.5253 9.93389 4.5253 11.9977C4.5253 14.0662 5.3603 15.926 6.71243 17.2829C8.06457 18.635 9.92909 19.47 11.9976 19.47C14.0614 19.47 15.9259 18.635 17.2828 17.2829C18.6349 15.926 19.4699 14.0662 19.4699 11.9977C19.4699 9.92915 18.6349 8.06937 17.2828 6.71249C15.9259 5.36036 14.0662 4.52536 11.9976 4.52536C9.92909 4.52536 8.06457 5.36036 6.71243 6.71249Z" fill="#1D1B20" />
            <path d="M13.1353 10.8069V16.1585C13.1353 16.7847 12.6276 17.2924 12.0014 17.2924C11.3751 17.2924 10.8675 16.7847 10.8675 16.1585V10.8069C10.8675 10.1806 11.3751 9.67295 12.0014 9.67295C12.6276 9.67295 13.1353 10.1806 13.1353 10.8069Z" fill="#1D1B20" />
            <path d="M10.8675 7.8369C10.8675 7.21065 11.3751 6.703 12.0014 6.703C12.6276 6.703 13.1353 7.21065 13.1353 7.8369C13.1353 8.46315 12.6276 8.97079 12.0014 8.97079C11.3751 8.97079 10.8675 8.46315 10.8675 7.8369Z" fill="#1D1B20" />
          </svg>
        </span>
        <p>
          A <strong>15 km</strong> daily commute each way, like Tampines to the CBD,
          with your weekend trips, is about <strong>9,000 km</strong> a year.
        </p>
      </div>

      <!-- DA-only: Drive Less, Pay Less opt-in (shown only when eligible) -->
      <template v-if="eligible">
        <div class="opt-in">
          <p class="opt-q">Would you like to opt in to our Drive Less, Pay Less option?</p>
          <div class="yn-row" role="radiogroup" aria-label="Drive Less, Pay Less opt-in">
            <button
              type="button"
              class="yn-btn"
              role="radio"
              :aria-checked="quote.driveLess === true"
              :class="{ 'is-on': quote.driveLess === true }"
              @click="pickDriveLess(true)"
            >Yes</button>
            <button
              type="button"
              class="yn-btn"
              role="radio"
              :aria-checked="quote.driveLess === false"
              :class="{ 'is-on': quote.driveLess === false }"
              @click="pickDriveLess(false)"
            >No</button>
          </div>
        </div>

        <!-- Warning shown once they opt in -->
        <div v-if="quote.driveLess === true" class="warn-card">
          <span class="card-ic" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4.836 19.6211C3.2988 19.6211 2.67036 18.5315 3.43896 17.2023L10.6005 4.80075C11.3691 3.47153 12.626 3.47153 13.3946 4.80075L20.5561 17.2023C21.3247 18.5315 20.6962 19.6211 19.159 19.6211H4.836Z" stroke="#F2A900" stroke-width="1.35635" stroke-miterlimit="10" />
              <path d="M11.1068 9.84184V14.0375C11.1068 14.5303 11.5047 14.9282 11.9975 14.9282C12.4903 14.9282 12.8882 14.5303 12.8882 14.0375V9.84184C12.8882 9.34903 12.4903 8.95117 11.9975 8.95117C11.5047 8.95117 11.1068 9.34903 11.1068 9.84184ZM11.9975 17.2566C12.4903 17.2566 12.8882 16.8587 12.8882 16.3659C12.8882 15.8731 12.4903 15.4752 11.9975 15.4752C11.5047 15.4752 11.1068 15.8731 11.1068 16.3659C11.1068 16.8587 11.5047 17.2566 11.9975 17.2566Z" fill="#F2A900" />
            </svg>
          </span>
          <p>
            To enjoy our low mileage discount, you will need to declare and provide proof
            of your current odometer reading. If you make a claim, incorrect mileage will
            result in an additional $1,000 excess.
          </p>
        </div>
      </template>
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

.dist-form { display: flex; flex-direction: column; gap: 16px; }

/* Distance band buttons — 2x2 grid (col-gap 13, row-gap 8). */
.band-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 13px;
  row-gap: 8px;
}
.band-btn {
  height: 56px;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #CCCCCC;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  font-family: var(--da-font);
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0.1px;
  color: #000;
}
.band-btn.is-on { background: var(--da-blue); color: #fff; }

/* Helper + warning cards. */
.info-card,
.warn-card {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #E6E9ED;
  border-radius: 8px;
  padding: 8px;
}
.info-card { border: 1px solid #CCCCCC; }
.warn-card { border: 1px solid rgba(242, 169, 0, 0.3); }
.card-ic { flex: 0 0 24px; display: inline-flex; }
.info-card p,
.warn-card p {
  margin: 0;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 500;
  line-height: 23px;
  color: #000;
}
.info-card strong { font-weight: 700; }

/* Drive Less opt-in. */
.opt-in { display: flex; flex-direction: column; gap: 16px; }
.opt-q {
  margin: 0;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 700;
  line-height: 22.4px;
  color: #000;
}
.yn-row { display: flex; gap: 16px; }
.yn-btn {
  flex: 1;
  height: 56px;
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
.yn-btn.is-on { background: var(--da-blue); color: #fff; }
</style>
