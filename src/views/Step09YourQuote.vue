<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuote } from '../store/quote'

const { quote, mutable } = useQuote()
const router = useRouter()

// Billing term (KB f1898394: "Single" / "Instalment", Single pre-selected).
const billing = ref(quote.quoteSelection.billingCycle === 'instalment' ? 'instalment' : 'single')
function setBilling(v) {
  billing.value = v
  mutable.quoteSelection.billingCycle = v
}
// KB #38971919: never "per year". Single = "Total"; Instalment = "per month".
const periodLabel = computed(() => (billing.value === 'single' ? 'Total' : 'per month'))

// Static prototype figures (no live pricing engine).
const headlinePrice = '$416.00'
const breakdown = computed(() => {
  const rows = [
    { label: 'Subtotal', value: '$240.00' },
    { label: 'Medical expenses', value: '$80.00' },
    { label: 'GST (9%)', value: '$36.00' },
  ]
  if (quote.driveLess === true) rows.push({ label: 'Low mileage', value: '- $20.00', good: true })
  if (billing.value === 'single') rows.push({ label: 'Single payment 3% discount', value: 'Included', good: true })
  return rows
})

// Cover + car summary.
const coverLabel = computed(() => ({
  comprehensive: 'Comprehensive Car Insurance',
  'third-party-fire-theft': 'Third Party, Fire & Theft Car Insurance',
  'third-party': 'Third Party Only Car Insurance',
}[quote.coverType] || 'Comprehensive Car Insurance'))
const carLabel = computed(() => {
  const { carMake, carModel, carYear } = quote
  return [carMake, carModel, carYear].filter(Boolean).join(' ') || 'Toyota Camry 2025'
})

// Excess (KB #306cd369: top 6 options, default $600, signed delta, no /yr).
const excessOptions = [
  { value: 0, label: '$0', delta: '+$50', tone: 'up' },
  { value: 500, label: '$500', delta: '+$10', tone: 'up' },
  { value: 600, label: '$600', delta: 'Default', tone: 'default' },
  { value: 800, label: '$800', delta: '-$30', tone: 'down' },
  { value: 900, label: '$900', delta: '-$40', tone: 'down' },
  { value: 1000, label: '$1,000', delta: '-$50', tone: 'down' },
]
const excess = computed({
  get: () => quote.quoteSelection.excess ?? 600,
  set: (v) => { mutable.quoteSelection.excess = v },
})

// Promotions applied (prototype seed).
const promos = ref([])
function addDemoPromo() {
  if (!promos.value.length) {
    promos.value = [
      { code: 'Shell Go+ ID: 12345678912345678', desc: 'Enjoy your $100 Shell Fuel + FREE 24 Hour Breakdown Assistance' },
    ]
  }
}
function removePromo(i) { promos.value.splice(i, 1) }

const coverage = [
  { name: 'Injury or death to someone else', value: 'Unlimited cover' },
  { name: "Damage to other people's property", value: 'up to $5,000,000' },
  { name: 'Legal costs against criminal charges', value: 'up to $3,000' },
  { name: 'Towing after an accident', value: '$500 for overseas tow and $200 for local tow' },
  { name: 'Damage by fire', value: 'check' },
]

function onBack() { router.push('/step/8') }
function onNext() { router.push('/step/10') }
</script>

<template>
  <section class="step quote">
    <div class="quote-stack">
      <!-- Premium summary -->
      <div class="q-card">
        <div class="billing">
          <button type="button" class="billing-btn" :class="{ 'is-on': billing === 'single' }" @click="setBilling('single')">Single</button>
          <button type="button" class="billing-btn" :class="{ 'is-on': billing === 'instalment' }" @click="setBilling('instalment')">Instalment</button>
        </div>
        <div class="price">
          <span class="price-amt">{{ headlinePrice }}</span>
          <span class="price-period">{{ periodLabel }}</span>
        </div>
        <div class="breakdown">
          <div v-for="row in breakdown" :key="row.label" class="bd-row" :class="{ 'is-good': row.good }">
            <span>{{ row.label }}</span>
            <span class="bd-val">{{ row.value }}</span>
          </div>
        </div>
      </div>

      <!-- Quote ID + vehicle -->
      <div class="q-card">
        <p class="q-id">Quote ID: P11254149R00</p>
        <div class="q-vehicle">
          <span>{{ coverLabel }}</span>
          <span>{{ carLabel }}</span>
        </div>
        <button type="button" class="q-email">Save and email quote</button>
      </div>

      <!-- Excess -->
      <div class="q-section">
        <div class="q-head">
          <p class="q-title">Choose your excess</p>
          <p class="q-sub">
            The amount you pay towards a claim. A higher excess means a lower premium.
            <span class="q-info" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x=".67" y=".67" width="14.67" height="14.67" rx="7.33" stroke="currentColor" stroke-width="1.33"/><path d="M7.4 9.54v-.52c0-1.69 1.89-1.93 1.89-3.21 0-.62-.53-1.1-1.27-1.1-.7 0-1.26.47-1.26.47l-.6-.77s.73-.71 1.94-.71c1.26 0 2.32.8 2.32 2.03 0 1.83-1.97 2.02-1.97 3.36v.46H7.4Zm-.02 2.15v-1.08h1.1v1.08h-1.1Z" fill="currentColor"/></svg>
            </span>
          </p>
        </div>
        <div class="excess-grid">
          <button
            v-for="o in excessOptions"
            :key="o.value"
            type="button"
            class="excess-tile"
            :class="{ 'is-on': excess === o.value }"
            @click="excess = o.value"
          >
            <span class="ex-val">{{ o.label }}</span>
            <span class="ex-delta" :class="`tone-${o.tone}`">{{ o.delta }}</span>
          </button>
        </div>
      </div>

      <!-- Promotions -->
      <div class="q-section">
        <p class="q-title">Promotions</p>
        <p class="q-sub">
          Would you like to apply a promotion with promo code or
          <a href="#" @click.prevent="addDemoPromo">Shell Go+ ID</a>?
        </p>
        <div class="promo-cards">
          <button type="button" class="promo-card" @click="addDemoPromo">
            <span class="promo-name">Promo Code</span>
            <span class="promo-desc">Enter a code from a campaign</span>
          </button>
          <button type="button" class="promo-card" @click="addDemoPromo">
            <span class="promo-name">Shell Go+ ID</span>
            <span class="promo-desc">Link your Shell GO+ membership</span>
          </button>
        </div>
        <div v-for="(p, i) in promos" :key="p.code" class="promo-applied">
          <span class="promo-check" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill="#75BB49"/><path d="M5 8.3l2 2 4-4.6" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
          <span class="promo-applied-text">
            <span class="promo-name">{{ p.code }}</span>
            <span class="promo-desc">{{ p.desc }}</span>
          </span>
          <button type="button" class="promo-remove" aria-label="Remove promo" @click="removePromo(i)">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5.3 4V2.7h5.4V4M3.3 4v9.3a1.3 1.3 0 001.4 1.4h6.6a1.3 1.3 0 001.4-1.4V4" stroke="#1E1E1E" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>

      <!-- Coverage details -->
      <div class="q-section">
        <p class="q-title">Coverage Details</p>
        <p class="q-sub">Included in your comprehensive plan</p>
        <div class="cov-table">
          <div class="cov-head">Core Cover(s)</div>
          <div v-for="row in coverage" :key="row.name" class="cov-row">
            <div class="cov-name">
              <span>{{ row.name }}</span>
              <svg class="cov-chev" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4.94 5.73L8 8.78l3.06-3.05L12 6.67 8 10.67 4 6.67l.94-.94Z" fill="#000"/></svg>
            </div>
            <div class="cov-val">
              <svg v-if="row.value === 'check'" width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="#75BB49"/><path d="M8 12.3l2.6 2.6L16 8.6" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span v-else>{{ row.value }}</span>
            </div>
          </div>
          <button type="button" class="cov-more">See more covers</button>
        </div>
        <p class="q-policy">For more details, refer to our <a href="#" @click.prevent>policy wording</a>.</p>
      </div>
    </div>

    <!-- Sticky quote footer: back · running price · Next -->
    <div class="quote-footer">
      <button type="button" class="qf-back" aria-label="Go back" @click="onBack">
        <i class="pi pi-chevron-left" aria-hidden="true"></i>
      </button>
      <div class="qf-price">
        <span class="qf-amt">{{ headlinePrice }}</span>
        <span class="qf-period">{{ periodLabel }}</span>
      </div>
      <button type="button" class="qf-next" @click="onNext">
        Next
        <i class="pi pi-chevron-right" aria-hidden="true"></i>
      </button>
    </div>
  </section>
</template>

<style scoped>
.quote { padding-top: 24px; display: flex; flex-direction: column; }
.quote-stack { display: flex; flex-direction: column; gap: 16px; }

.q-card {
  background: #fff;
  border: 1px solid rgba(221, 221, 221, 0.87);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Billing toggle. */
.billing {
  display: flex;
  gap: 2px;
  padding: 2px;
  height: 43px;
  background: #F5F5F5;
  border: 1px solid var(--da-line-soft);
  border-radius: 12px;
}
.billing-btn {
  flex: 1;
  border: 0;
  border-radius: 12px;
  background: transparent;
  font-family: var(--da-font);
  font-size: 12px;
  font-weight: 500;
  color: #000;
  cursor: pointer;
}
.billing-btn.is-on {
  background: var(--da-blue);
  color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Headline price. */
.price { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.price-amt { font-size: 36px; font-weight: 700; color: var(--da-green); line-height: 1.1; }
.price-period { font-size: 14px; font-weight: 400; color: #000; }

.breakdown { display: flex; flex-direction: column; gap: 8px; }
.bd-row {
  display: flex;
  justify-content: space-between;
  font-family: var(--da-font);
  font-size: 14px;
  font-weight: 500;
  color: #000;
}
.bd-row.is-good, .bd-row.is-good .bd-val { color: var(--da-green); }

/* Quote ID card. */
.q-id { margin: 0; font-size: 16px; font-weight: 700; color: #000; }
.q-vehicle {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 16px;
  border-left: 1px solid var(--da-line-soft);
  font-size: 14px;
  font-weight: 500;
  color: #000;
  line-height: 16px;
}
.q-email {
  align-self: flex-start;
  width: 100%;
  padding: 8px;
  background: #fff;
  border: 1px solid var(--da-outline);
  border-radius: 8px;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 400;
  color: #000;
  cursor: pointer;
}

/* Sections. */
.q-section { display: flex; flex-direction: column; gap: 8px; }
.q-title { margin: 0; font-size: 16px; font-weight: 700; color: #000; }
.q-sub { margin: 0; font-size: 14px; font-weight: 500; color: #000; line-height: 1.45; }
.q-sub a { color: var(--da-blue); text-decoration: underline; }
.q-info { display: inline-flex; vertical-align: middle; color: #000; margin-left: 2px; }

/* Excess grid. */
.excess-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 4px;
}
.excess-tile {
  height: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: #fff;
  border: 1px solid rgba(221, 221, 221, 0.87);
  border-radius: 8px;
  cursor: pointer;
}
.excess-tile.is-on { background: var(--da-blue); }
.ex-val { font-size: 16px; font-weight: 600; color: #000; }
.ex-delta { font-size: 12px; font-weight: 500; }
.ex-delta.tone-up { color: var(--da-error); }
.ex-delta.tone-down { color: var(--da-green); }
.ex-delta.tone-default { color: #000; }
.excess-tile.is-on .ex-val, .excess-tile.is-on .ex-delta { color: #fff; }

/* Promotions. */
.promo-cards { display: flex; gap: 16px; margin-top: 8px; }
.promo-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  background: #fff;
  border: 1px solid var(--da-line-soft);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 1px rgba(0, 0, 0, 0.05);
  text-align: left;
  cursor: pointer;
}
.promo-name { font-size: 14px; font-weight: 700; color: var(--da-ink); }
.promo-desc { font-size: 12px; font-weight: 500; color: var(--da-ink); }
.promo-applied {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 14px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  margin-top: 8px;
}
.promo-check { flex: 0 0 16px; margin-top: 2px; }
.promo-applied-text { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.promo-remove { background: 0; border: 0; cursor: pointer; padding: 2px; }

/* Coverage table. */
.cov-table { display: flex; flex-direction: column; }
.cov-head {
  padding: 12px 16px;
  border: 1px solid var(--da-line-soft);
  border-radius: 8px 8px 0 0;
  font-size: 14px;
  font-weight: 800;
  color: #000;
  background: #fff;
}
.cov-row { display: flex; }
.cov-name {
  width: 60%;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
  border-left: 1px solid var(--da-line-soft);
  border-bottom: 1px solid var(--da-line-soft);
  font-size: 14px;
  font-weight: 500;
  color: #000;
  line-height: 20px;
}
.cov-chev { flex: 0 0 16px; margin-top: 2px; }
.cov-val {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 12px 16px;
  background: #E6E9ED;
  border-right: 1px solid var(--da-line-soft);
  border-bottom: 1px solid var(--da-line-soft);
  font-size: 14px;
  font-weight: 500;
  color: #000;
  line-height: 20px;
}
.cov-more {
  padding: 8px 16px;
  background: #fff;
  border: 1px solid var(--da-line-soft);
  border-top: 0;
  border-radius: 0 0 8px 8px;
  font-family: var(--da-font);
  font-size: 14px;
  font-weight: 500;
  color: #000;
  text-decoration: underline;
  cursor: pointer;
}
.q-policy { margin: 0; font-size: 14px; font-weight: 500; color: #000; }
.q-policy a { color: #000; text-decoration: underline; }

/* Sticky quote footer (back · price · Next). */
.quote-footer {
  position: sticky;
  bottom: 0;
  z-index: 20;
  margin: auto -16px 0 -16px;
  padding: 24px 16px 12px;
  background: var(--da-yellow);
  border-top-left-radius: var(--da-radius-lg);
  border-top-right-radius: var(--da-radius-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
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
.qf-next:hover { background: var(--da-green-hover, #69A841); }
</style>
