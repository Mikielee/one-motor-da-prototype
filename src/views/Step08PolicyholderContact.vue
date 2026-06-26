<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import StickyNext from '../components/StickyNext.vue'
import FieldError from '../components/FieldError.vue'
import { useQuote } from '../store/quote'
import { useValidation } from '../composables/useValidation'

const { quote, mutable } = useQuote()
const { showErrors, reveal } = useValidation()
const router = useRouter()
const c = computed(() => quote.contact)

const channels = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'whatsapp', label: 'WhatsApp' },
]

function onMobileInput(e) {
  mutable.contact.phone = e.target.value.replace(/\D/g, '').slice(0, 8)
}
function toggleChannel(ch) {
  const arr = mutable.contact.marketingChannels
  const i = arr.indexOf(ch)
  if (i >= 0) arr.splice(i, 1)
  else arr.push(ch)
}
function togglePdpa() {
  mutable.contact.consentPdpa = !mutable.contact.consentPdpa
}

const validEmail = computed(() => /\S+@\S+\.\S+/.test(c.value.email || ''))
const validMobile = computed(() => /^[89]\d{7}$/.test(c.value.phone || ''))

const canContinue = computed(() =>
  Boolean((c.value.preferredName || '').trim()) &&
  validEmail.value &&
  validMobile.value &&
  c.value.consentPdpa
)

const nameError = computed(() => showErrors.value && !(c.value.preferredName || '').trim())
const emailError = computed(() => showErrors.value && !validEmail.value)
const mobileError = computed(() => showErrors.value && !validMobile.value)
const pdpaError = computed(() => showErrors.value && !c.value.consentPdpa)

// First IDIT call — holding overlay, then on to the quote.
const tips = [
  'Comprehensive cover protects you against accidents, theft, and third-party claims.',
  'No Claim Discount rewards careful drivers with up to 50% off.',
  'Adding a named driver can lower your premium if they have a clean record.',
]
const loading = ref(false)
const currentTip = ref('')
function onNext() {
  currentTip.value = tips[Math.floor(Math.random() * tips.length)]
  loading.value = true
  window.setTimeout(() => router.push('/step/9'), 2500)
}

// Demo autofill — header "Car Insurance" chip.
import { useDemoAutofill } from '../composables/useDemoAutofill'
useDemoAutofill().register(() => { mutable.contact.preferredName = 'Mikie'; mutable.contact.email = 'user@mail.com'; mutable.contact.phone = '91234567'; mutable.contact.consentPdpa = true })
</script>

<template>
  <section class="step">
    <h1 class="da-section-title">How should we contact you?</h1>

    <div class="contact-form">
      <!-- Contact inputs -->
      <div class="inputs">
        <div class="field">
          <input
            v-model="mutable.contact.preferredName"
            class="da-text-input"
            :class="{ 'is-error': nameError }"
            type="text"
            placeholder="Preferred name"
            autocomplete="given-name"
          />
          <FieldError :show="nameError" message="Enter your preferred name." />
        </div>

        <div class="field">
          <input
            v-model="mutable.contact.email"
            class="da-text-input"
            :class="{ 'is-error': emailError }"
            type="email"
            inputmode="email"
            placeholder="Email"
            autocomplete="email"
          />
          <FieldError :show="emailError" message="Enter a valid email address." />
        </div>

        <div class="field">
          <div class="mobile-row" :class="{ 'is-error': mobileError }">
            <span class="mobile-prefix">+65</span>
            <input
              :value="c.phone"
              class="da-text-input mobile-input"
              type="tel"
              inputmode="numeric"
              maxlength="8"
              placeholder="Mobile"
              autocomplete="tel-national"
              @input="onMobileInput"
            />
          </div>
          <FieldError :show="mobileError" message="Enter a valid SG mobile (8 digits, starts with 8 or 9)." />
        </div>
      </div>

      <!-- Marketing channels (optional, multi-select) -->
      <div class="mkt">
        <p class="mkt-heading">Keep me updated for any special deals.</p>
        <button
          v-for="ch in channels"
          :key="ch.value"
          type="button"
          class="mkt-card"
          :class="{ 'is-on': c.marketingChannels.includes(ch.value) }"
          :aria-pressed="c.marketingChannels.includes(ch.value)"
          @click="toggleChannel(ch.value)"
        >
          <span class="da-check" :class="{ 'is-on': c.marketingChannels.includes(ch.value) }">
            <svg v-if="c.marketingChannels.includes(ch.value)" width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span class="mkt-label">{{ ch.label }}</span>
        </button>
      </div>

      <!-- PDPA consent (required) -->
      <button
        type="button"
        class="pdpa"
        :class="{ 'is-error': pdpaError }"
        @click="togglePdpa"
      >
        <span class="da-check" :class="{ 'is-on': c.consentPdpa }">
          <svg v-if="c.consentPdpa" width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
        <span class="pdpa-text">
          I acknowledge and agree to the collection, use and disclosure of my personal data which
          has been provided for the purposes of procuring insurance products &amp; services as per the
          DirectAsia
          <a
            href="https://www.directasia.com/security-privacy"
            target="_blank"
            rel="noopener"
            @click.stop
          >Personal Data Protection Statement</a>.
        </span>
      </button>
      <FieldError :show="pdpaError" message="Please accept the Personal Data Protection Statement to continue." />
    </div>

    <StickyNext :disabled="!canContinue" intercept-next @next="onNext" @blocked="reveal" />
  </section>

  <!-- IDIT holding overlay -->
  <Teleport to="body">
    <div v-if="loading" class="idit-overlay">
      <div class="idit-card">
        <span class="idit-spinner" aria-hidden="true" />
        <p class="idit-title">Just a moment</p>
        <p class="idit-tip">{{ currentTip }}</p>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.step {
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.contact-form { display: flex; flex-direction: column; gap: 16px; }
.inputs { display: flex; flex-direction: column; gap: 8px; }
.field { display: flex; flex-direction: column; gap: 4px; }

/* Text inputs — placeholder-in-field, #CCCCCC outline, blue on focus. */
.da-text-input {
  width: 100%;
  height: 56px;
  background: #fff;
  border: 1px solid #CCCCCC;
  border-radius: 4px;
  padding: 0 16px;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 500;
  color: var(--da-ink);
}
.da-text-input::placeholder { color: #49454F; font-weight: 500; }
.da-text-input:focus { border-color: var(--da-blue); outline: 0; }
.da-text-input.is-error { border-color: var(--da-error); }

/* Mobile +65 composite — narrower field, left-aligned (Figma 252px). */
.mobile-row { display: flex; width: 252px; max-width: 100%; }
.mobile-prefix {
  display: inline-flex;
  align-items: center;
  height: 56px;
  padding: 0 16px;
  background: #E8E8E8;
  border: 1px solid #CCCCCC;
  border-right: 0;
  border-radius: 4px 0 0 4px;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 500;
  color: #49454F;
}
.mobile-input { border-radius: 0 4px 4px 0; }
.mobile-row.is-error .mobile-input,
.mobile-row.is-error .mobile-prefix { border-color: var(--da-error); }

/* Marketing channel cards (multi-select). */
.mkt { display: flex; flex-direction: column; gap: 8px; }
.mkt-heading {
  margin: 0 0 0;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
  color: #252525;
}
.mkt-card {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 252px;
  max-width: 100%;
  min-height: 56px;
  box-sizing: border-box;
  background: #fff;
  border: 1px solid #CCCCCC;
  border-radius: 4px;
  padding: 0 16px;
  cursor: pointer;
  text-align: left;
}
.mkt-card.is-on { border-color: var(--da-blue); }
.mkt-label {
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 500;
  color: var(--da-ink);
}

/* Round checkbox shared by channels + PDPA. */
.da-check {
  flex: 0 0 18px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid #49454F;
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.da-check.is-on { background: var(--da-blue); border-color: var(--da-blue); }

/* PDPA consent card. */
.pdpa {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  background: #fff;
  border: 1px solid #DDDDDD;
  border-radius: 4px;
  padding: 16px;
  cursor: pointer;
  text-align: left;
}
.pdpa .da-check { margin-top: 2px; }
.pdpa.is-error { border-color: var(--da-error); }
.pdpa-text {
  margin: 0;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #252525;
}
.pdpa-text a { color: #252525; text-decoration: underline; }

/* IDIT holding overlay. */
.idit-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(245, 245, 245, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.idit-card {
  width: min(320px, 100%);
  background: #fff;
  border-radius: var(--da-radius-lg);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}
.idit-spinner {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 4px solid #E8E8E8;
  border-top-color: var(--da-yellow);
  animation: idit-spin 0.9s linear infinite;
}
@keyframes idit-spin { to { transform: rotate(360deg); } }
.idit-title {
  margin: 0;
  font-family: var(--da-font);
  font-size: 18px;
  font-weight: 700;
  color: var(--da-ink);
}
.idit-tip {
  margin: 0;
  font-family: var(--da-font);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  color: var(--da-step-off);
}
</style>
