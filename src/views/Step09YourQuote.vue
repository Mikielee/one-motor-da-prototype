<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuote } from '../store/quote'
import DaSheet from '../components/DaSheet.vue'
import DaQuoteFooter from '../components/DaQuoteFooter.vue'
import { useDaPricing } from '../composables/useDaPricing'

const { quote, mutable } = useQuote()
const router = useRouter()

// Headline price + breakdown share one source with the sticky footer so the
// excess / driver / promo choices move the card AND the footer together.
const pricing = useDaPricing()

// Billing term (KB f1898394: "Single" / "Instalment", Single pre-selected).
const billing = ref(quote.quoteSelection.billingCycle === 'instalment' ? 'instalment' : 'single')
function setBilling(v) {
  billing.value = v
  mutable.quoteSelection.billingCycle = v
}

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

// --- Promotions (inline) — Figma OMP-28 ---
// A selector card chooses Promo Code or Shell Go+ ID; the matching field shows
// below. On Apply, valid entries become a stacked chip; invalid ones show a red
// inline error. Promo codes stack with each other AND with one Shell Go+ ID;
// only a single Shell Go+ ID can be linked.
// Valid demo promo codes: DRIVE150, EV100. Valid Shell Go+ ID: 16-19 digits.
const PROMO_CATALOG = {
  TEST: 'Enjoy your $50 eCapitavoucher',
  DRIVE150: 'Enjoy your 1 month free car insurance + $50 eCapitavoucher',
  EV100: 'Enjoy your $100 eCapitavoucher',
}
const PROMO_ERR = 'This promo code is invalid or cannot be combined with other promo codes!'

const promoType = ref('promo') // 'promo' | 'shell' — selected card
const promoInput = ref('')
const shellInput = ref('')
const promoError = ref('')
const shellError = ref('')

const appliedPromos = computed(() => quote.appliedPromos)
const hasShell = computed(() => quote.appliedPromos.some((p) => p.type === 'shell'))

function selectType(t) {
  if (t === 'shell' && hasShell.value) return // Shell Go+ ID is single-use
  promoType.value = t
  promoError.value = ''
  shellError.value = ''
}
function applyPromoCode() {
  const code = promoInput.value.trim().toUpperCase()
  if (!code) return
  const dup = quote.appliedPromos.some((p) => p.type === 'code' && p.name === code)
  const desc = PROMO_CATALOG[code]
  if (!desc || dup) { promoError.value = PROMO_ERR; return }
  mutable.appliedPromos.push({ type: 'code', name: code, desc })
  promoInput.value = ''
  promoError.value = ''
}
function applyShell() {
  const raw = shellInput.value.trim()
  if (!raw) return
  const isTest = raw.toLowerCase() === 'test'
  const id = raw.replace(/\D/g, '')
  const valid = isTest || (id.length >= 16 && id.length <= 19)
  if (!valid || hasShell.value) { shellError.value = PROMO_ERR; return }
  mutable.appliedPromos.push({
    type: 'shell',
    name: `Shell Go+ ID: ${isTest ? 'TEST' : id}`,
    desc: 'Enjoy your $100 Shell Fuel + FREE 24 Hour Breakdown Assistance',
  })
  shellInput.value = ''
  shellError.value = ''
  promoType.value = 'promo' // Shell now linked — fall back to the promo field for stacking
}
function removePromo(i) { mutable.appliedPromos.splice(i, 1) }

// --- Save & email quote ---
const saveOpen = ref(false)
const saveSent = ref(false)
const saveEmail = ref('')
function openSave() {
  saveSent.value = false
  saveEmail.value = quote.contact?.email || ''
  saveOpen.value = true
}
function sendQuote() { if (saveEmail.value.trim()) saveSent.value = true }
function closeSave() { saveOpen.value = false }

// --- Coverage table (collapsed shows the first 5; "See more" reveals the rest) ---
const coverage = [
  { name: 'Injury or death to someone else', value: 'Unlimited cover' },
  { name: "Damage to other people's property", value: 'up to $5,000,000' },
  { name: 'Legal costs against criminal charges', value: 'up to $3,000' },
  { name: 'Towing after an accident', value: '$500 for overseas tow and $200 for local tow' },
  { name: 'Damage by fire', value: 'check' },
  { name: 'Damage or loss to your car due to theft', value: 'check' },
  { name: 'Damage to your car if someone else crashes into you', value: 'check' },
  { name: "Damage to your car when it's your fault", value: 'check' },
  { name: 'Damage by fallen trees, flood, storms or natural disaster', value: 'check' },
  { name: 'Damage by vandals', value: 'check' },
  { name: 'Damage to windscreen or windows', value: 'check' },
]
const showAllCovers = ref(false)
const visibleCovers = computed(() => (showAllCovers.value ? coverage : coverage.slice(0, 5)))

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
          <span class="price-amt">{{ pricing.displayAmount.value }}</span>
          <span class="price-period">{{ pricing.periodLabel.value }}</span>
        </div>
        <div class="breakdown">
          <div v-for="row in pricing.rows.value" :key="row.label" class="bd-row" :class="{ 'is-good': row.good }">
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
        <button type="button" class="q-email" @click="openSave">Save and email quote</button>
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

      <!-- Promotions (inline selector + field) -->
      <div class="q-section">
        <p class="q-title">Promotions</p>
        <p class="q-sub">
          Would you like to apply a promotion with promo code or
          <a href="#" @click.prevent="selectType('shell')">Shell Go+ ID</a>?
        </p>
        <div class="promo-cards">
          <button type="button" class="promo-card" :class="{ 'is-on': promoType === 'promo' }" @click="selectType('promo')">
            <span class="pc-name">Promo Code</span>
            <span class="pc-desc">Enter a code from a campaign</span>
          </button>
          <button type="button" class="promo-card" :class="{ 'is-on': promoType === 'shell', 'is-disabled': hasShell }" :disabled="hasShell" @click="selectType('shell')">
            <span class="pc-name">Shell Go+ ID</span>
            <span class="pc-desc">{{ hasShell ? 'Already applied' : 'Link your Shell GO+ membership' }}</span>
          </button>
        </div>

        <!-- Promo code field -->
        <template v-if="promoType === 'promo'">
          <div class="promo-apply" :class="{ 'has-val': promoInput, 'is-error': promoError }">
            <input v-model="promoInput" class="promo-input" type="text" placeholder="Enter Promo Code"
              @input="promoError = ''" @keyup.enter="applyPromoCode" />
            <button type="button" class="promo-apply-btn" @click="applyPromoCode">Apply</button>
          </div>
          <p v-if="promoError" class="promo-err">{{ promoError }}</p>
        </template>

        <!-- Shell Go+ ID field (hidden once one is linked — only one allowed) -->
        <template v-else-if="!hasShell">
          <div class="promo-apply" :class="{ 'has-val': shellInput, 'is-error': shellError }">
            <input v-model="shellInput" class="promo-input" type="text" inputmode="numeric" placeholder="Enter your Shell GO+ ID"
              @input="shellError = ''" @keyup.enter="applyShell" />
            <button type="button" class="promo-apply-btn" @click="applyShell">Apply</button>
          </div>
          <p v-if="shellError" class="promo-err">{{ shellError }}</p>
        </template>

        <!-- Applied promos (stacked, each removable) -->
        <div v-for="(p, i) in appliedPromos" :key="i" class="promo-applied">
          <span class="pa-check" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill="#75BB49"/><path d="M5 8.3l2 2 4-4.6" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
          <span class="pa-text">
            <span class="pa-name">{{ p.name }}</span>
            <span class="pa-desc">{{ p.desc }}</span>
          </span>
          <button type="button" class="pa-remove" aria-label="Remove promo" @click="removePromo(i)">
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
          <div v-for="row in visibleCovers" :key="row.name" class="cov-row">
            <div class="cov-name">
              <span>{{ row.name }}</span>
              <svg class="cov-chev" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4.94 5.73L8 8.78l3.06-3.05L12 6.67 8 10.67 4 6.67l.94-.94Z" fill="#000"/></svg>
            </div>
            <div class="cov-val">
              <svg v-if="row.value === 'check'" width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="#75BB49"/><path d="M8 12.3l2.6 2.6L16 8.6" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span v-else>{{ row.value }}</span>
            </div>
          </div>
          <button type="button" class="cov-more" @click="showAllCovers = !showAllCovers">
            {{ showAllCovers ? 'See less covers' : 'See more covers' }}
          </button>
        </div>
        <p class="q-policy">For more details, refer to our <a href="#" @click.prevent>policy wording</a>.</p>
      </div>
    </div>

    <!-- Sticky running-price footer (expandable breakdown) -->
    <DaQuoteFooter />

    <!-- Save & email quote sheet -->
    <DaSheet :open="saveOpen" :title="saveSent ? 'Email successfully sent' : 'Save and email my quote'" @close="closeSave">
      <template v-if="!saveSent">
        <p class="sheet-help">Enter your email address below and we'll send you a link so you can finish your quote whenever you like. We'll save all the information you've entered so your price won't change.</p>
        <label class="sheet-label">Email</label>
        <input v-model="saveEmail" class="sheet-input full" type="email" inputmode="email" placeholder="you@email.com" />
        <button type="button" class="sheet-send" @click="sendQuote">Send my quote</button>
      </template>
      <template v-else>
        <p class="sheet-help">This quote has been emailed to <strong>{{ saveEmail }}</strong>. You can always follow the link in the email to resume this quote.</p>
        <button type="button" class="sheet-send" @click="closeSave">Close</button>
      </template>
    </DaSheet>
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

/* Promotions — selector cards. */
.promo-cards { display: flex; gap: 16px; }
.promo-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  min-height: 81px;
  padding: 16px;
  background: #fff;
  border: 1px solid #E4E4E4;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 1px rgba(0, 0, 0, 0.05);
  text-align: left;
  cursor: pointer;
}
.promo-card.is-on { background: var(--da-blue); border-color: var(--da-outline); }
.promo-card.is-disabled {
  background: #F5F5F5;
  border-color: #E4E4E4;
  box-shadow: none;
  cursor: not-allowed;
  opacity: 0.7;
}
.promo-card.is-disabled .pc-name, .promo-card.is-disabled .pc-desc { color: #979797; }
.pc-name { font-size: 14px; font-weight: 700; color: #000; }
.pc-desc { font-size: 12px; font-weight: 500; color: #000; }
.promo-card.is-on .pc-name, .promo-card.is-on .pc-desc { color: #fff; }

/* Inline Apply field. */
.promo-apply {
  display: flex;
  align-items: stretch;
  height: 48px;
  border-radius: 8px;
}
.promo-input {
  flex: 1;
  min-width: 0;
  border: 1px solid #DADADA;
  border-right: 0;
  border-radius: 8px 0 0 8px;
  padding: 0 16px;
  background: #fff;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 400;
  color: #333F48;
}
.promo-input::placeholder { color: #CCCCCC; }
.promo-input:focus { outline: 0; }
.promo-apply.has-val .promo-input { border-color: var(--da-blue); }
.promo-apply.is-error .promo-input { border-color: var(--da-error); }
.promo-apply-btn {
  flex: 0 0 auto;
  padding: 0 18px;
  border: 0;
  border-radius: 0 8px 8px 0;
  background: var(--da-green);
  color: #fff;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}
.promo-err {
  margin: 0;
  font-family: var(--da-font);
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: var(--da-error);
}

/* Applied promo chip (stacked). */
.promo-applied {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 14px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}
.pa-check { flex: 0 0 16px; margin-top: 2px; line-height: 0; }
.pa-text { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.pa-name { font-size: 14px; font-weight: 700; color: #333F48; }
.pa-desc { font-size: 12px; font-weight: 500; color: #333F48; }
.pa-remove { background: 0; border: 0; cursor: pointer; padding: 2px; flex: 0 0 auto; }

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

/* Bottom-sheet contents (promo code / Shell Go+ / save & email). */
.sheet-help {
  margin: 0 0 16px;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 500;
  line-height: 23px;
  color: var(--da-ink);
}
.sheet-label {
  display: block;
  margin-bottom: 8px;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 600;
  color: #252525;
}
.sheet-field {
  display: flex;
  align-items: stretch;
  height: 56px;
  border: 1px solid #CCCCCC;
  border-radius: 8px;
  overflow: hidden;
}
.sheet-input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  padding: 0 16px;
  background: #fff;
  font-family: var(--da-font);
  font-size: 16px;
  color: #1D1B20;
}
.sheet-input::placeholder { color: #9a9a9a; }
.sheet-input.full {
  width: 100%;
  height: 56px;
  border: 1px solid #CCCCCC;
  border-radius: 8px;
  margin-bottom: 16px;
}
.sheet-apply {
  flex: 0 0 auto;
  padding: 0 24px;
  border: 0;
  background: var(--da-green);
  color: #fff;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}
.sheet-send {
  width: 100%;
  height: 52px;
  border: 0;
  border-radius: 8px;
  background: var(--da-green);
  color: #fff;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

/* Selected promo card (while its sheet is open). */
.promo-card.is-on { border-color: var(--da-blue); box-shadow: 0 0 0 1px var(--da-blue) inset; }
</style>
