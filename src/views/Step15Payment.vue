<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuote } from '../store/quote'

// Payment — Figma 4962-3081. Choose Single (Save 3%) or Instalment.
//  - Single    : pay by Card (Amex/Mastercard/Visa) or PayNow.
//  - Instalment: credit card only, choose an instalment bank (UOB/DBS/OCBC).
// The CTA reads "Pay" and sends the customer to the secure gateway (out of scope).

const { quote, mutable } = useQuote()
const router = useRouter()

const headlinePrice = '$416.00'

const option = computed(() => quote.paymentOption)
function setOption(v) {
  mutable.paymentOption = v
  // Reset the method that doesn't apply to the new option.
  if (v === 'instalment') mutable.paymentMethod = null
  else mutable.instalmentBank = null
}
function setMethod(v) { mutable.paymentMethod = v }
function setBank(v) { mutable.instalmentBank = v }

const banks = [
  { value: 'uob', label: 'UOB', color: '#E1091D' },
  { value: 'dbs', label: 'DBS', color: '#FF3333' },
  { value: 'ocbc', label: 'OCBC', color: '#ED1C24' },
]

const canPay = computed(() =>
  (option.value === 'single' && Boolean(quote.paymentMethod)) ||
  (option.value === 'instalment' && Boolean(quote.instalmentBank))
)

function onBack() { router.push('/step/14') }
function onPay() {
  // End of the prototype — the real flow hands off to the secure payment gateway.
  if (!canPay.value) return
}
</script>

<template>
  <section class="step">
    <h1 class="da-section-title">Payment</h1>

    <!-- Payment option -->
    <div class="card">
      <p class="card-title">Select your payment option</p>
      <div class="seg">
        <button type="button" class="seg-btn" :class="{ 'is-on': option === 'single' }" @click="setOption('single')">
          <span>Single</span>
          <span class="save-pill">Save 3%</span>
        </button>
        <button type="button" class="seg-btn" :class="{ 'is-on': option === 'instalment' }" @click="setOption('instalment')">
          Instalment
        </button>
      </div>
    </div>

    <!-- Payment method -->
    <div class="card">
      <p class="card-title">Payment method</p>

      <!-- Single: card or PayNow -->
      <div v-if="option === 'single'" class="method-row">
        <button type="button" class="method" :class="{ 'is-on': quote.paymentMethod === 'card' }" @click="setMethod('card')">
          <span class="brands">
            <span class="brand brand-amex">AMEX</span>
            <span class="brand brand-mc"><i></i><i></i></span>
            <span class="brand brand-visa">VISA</span>
          </span>
        </button>
        <button type="button" class="method" :class="{ 'is-on': quote.paymentMethod === 'paynow' }" @click="setMethod('paynow')">
          <span class="brand brand-paynow">PAY<span>NOW</span></span>
        </button>
      </div>

      <!-- Instalment: credit card only + bank choice -->
      <div v-else class="instalment">
        <div class="cc-only">
          <span class="cc-label">Credit card only</span>
          <span class="brands">
            <span class="brand brand-amex">AMEX</span>
            <span class="brand brand-mc"><i></i><i></i></span>
            <span class="brand brand-visa">VISA</span>
          </span>
        </div>
        <div class="bank-row">
          <button
            v-for="b in banks"
            :key="b.value"
            type="button"
            class="method bank"
            :class="{ 'is-on': quote.instalmentBank === b.value }"
            @click="setBank(b.value)"
          >
            <span class="brand-bank" :style="{ color: b.color }">{{ b.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Secure gateway note -->
    <p class="secure-note">
      <span class="lock" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.625 9.75V7.875A3.375 3.375 0 0 1 12 4.5a3.375 3.375 0 0 1 3.375 3.375V9.75H17.25c.41 0 .75.34.75.75V18.75c0 .41-.34.75-.75.75H6.75a.75.75 0 0 1-.75-.75V10.5c0-.41.34-.75.75-.75h1.875Zm1.125 0h4.5V7.875a2.25 2.25 0 0 0-4.5 0V9.75Z" fill="#333F48"/></svg>
      </span>
      You'll be directed to our secure payment gateway.
    </p>

    <!-- Sticky price footer: back · total · Pay -->
    <div class="quote-footer">
      <button type="button" class="qf-chip" aria-label="Price breakdown">
        <i class="pi pi-chevron-up" aria-hidden="true"></i>
      </button>
      <button type="button" class="qf-back" aria-label="Go back" @click="onBack">
        <i class="pi pi-chevron-left" aria-hidden="true"></i>
      </button>
      <div class="qf-price">
        <span class="qf-amt">{{ headlinePrice }}</span>
        <span class="qf-period">Total</span>
      </div>
      <button type="button" class="qf-next" :class="{ 'is-blocked': !canPay }" @click="onPay">
        Pay
        <i class="pi pi-chevron-right" aria-hidden="true"></i>
      </button>
    </div>
  </section>
</template>

<style scoped>
.step { padding-top: 24px; display: flex; flex-direction: column; gap: 16px; }

.card {
  background: #fff;
  border-radius: 8px;
  outline: 1px solid #E4E4E4;
  outline-offset: -1px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.card-title { margin: 0; font-family: var(--da-font); font-size: 16px; font-weight: 700; color: #333F48; }

/* Single / Instalment segment. */
.seg { display: flex; gap: 8px; }
.seg-btn {
  flex: 1;
  min-height: 48px;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #79747E;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 500;
  color: #333F48;
}
.seg-btn.is-on { background: var(--da-blue); color: #fff; }
.save-pill {
  padding: 1px 6px;
  background: #D2FFB6;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 400;
  color: #49454F;
  line-height: 1.2;
}

/* Method cards. */
.method-row { display: flex; gap: 8px; }
.method {
  flex: 1;
  min-height: 48px;
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #79747E;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.method.is-on { border-color: var(--da-blue); box-shadow: 0 0 0 1px var(--da-blue) inset; }

.brands { display: inline-flex; align-items: center; gap: 7px; }
.brand {
  display: inline-flex;
  align-items: center;
  font-family: var(--da-font);
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.3px;
}
.brand-amex { background: #016FD0; color: #fff; border-radius: 3px; padding: 2px 4px; }
.brand-visa { color: #1A1F71; font-style: italic; font-size: 13px; }
.brand-paynow { color: #90278B; font-size: 14px; }
.brand-paynow span { color: #D4007A; }
.brand-mc { position: relative; width: 26px; height: 16px; }
.brand-mc i {
  position: absolute;
  top: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
}
.brand-mc i:first-child { left: 0; background: #EB001B; }
.brand-mc i:last-child { right: 0; background: #F79E1B; mix-blend-mode: multiply; }

.instalment { display: flex; flex-direction: column; gap: 16px; }
.cc-only { display: flex; align-items: center; justify-content: center; gap: 8px; }
.cc-label { font-family: var(--da-font); font-size: 14px; font-weight: 500; color: #49454F; }
.bank-row { display: flex; gap: 8px; }
.bank { flex: 1; }
.brand-bank { font-family: var(--da-font); font-weight: 800; font-size: 16px; }

.secure-note {
  margin: 0;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-family: var(--da-font);
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #333F48;
}
.lock { flex: 0 0 auto; line-height: 0; }

/* Sticky price footer (chip · back · total · Pay). */
.quote-footer {
  position: sticky;
  bottom: 0;
  z-index: 20;
  margin: 8px -16px 0 -16px;
  padding: 24px 16px 12px;
  background: var(--da-yellow);
  border-top-left-radius: var(--da-radius-lg);
  border-top-right-radius: var(--da-radius-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.qf-chip {
  position: absolute;
  top: -13px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  border-radius: 100px;
  background: var(--da-yellow);
  border: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #000;
  cursor: pointer;
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
.qf-next.is-blocked { background: #E8E8E8; color: #979797; }
</style>
