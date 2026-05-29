<script setup>
import { computed, reactive } from 'vue'
import InputText from 'primevue/inputtext'
import StickyNext from '../components/StickyNext.vue'
import { useQuote } from '../store/quote'

const { quote, mutable } = useQuote()

const local = reactive({
  preferredName: quote.contact?.preferredName || '',
  email: quote.contact?.email || '',
  phone: quote.contact?.phone || '',
  postalCode: quote.contact?.postalCode || '',
  marketingChannels: [...(quote.contact?.marketingChannels || [])],
  consentPdpa: quote.contact?.consentPdpa ?? false,
})

function sync() {
  mutable.contact = {
    ...quote.contact,
    preferredName: local.preferredName,
    email: local.email,
    phone: local.phone,
    postalCode: local.postalCode,
    marketingChannels: [...local.marketingChannels],
    consentPdpa: local.consentPdpa,
  }
}

function toggleChannel(name) {
  const idx = local.marketingChannels.indexOf(name)
  if (idx === -1) local.marketingChannels.push(name)
  else local.marketingChannels.splice(idx, 1)
  sync()
}

function togglePdpa() {
  local.consentPdpa = !local.consentPdpa
  sync()
}

const channels = ['Email', 'SMS', 'Whatsapp']

const emailValid = computed(() => /^\S+@\S+\.\S+$/.test(local.email))
const phoneValid = computed(() => /^\d{8,}$/.test(local.phone.replace(/\s/g, '')))
const postalValid = computed(() => /^\d{6}$/.test(local.postalCode))

const canContinue = computed(() =>
  local.preferredName.trim().length > 0
  && emailValid.value
  && phoneValid.value
  && postalValid.value
  && local.consentPdpa
)
</script>

<template>
  <section class="step">
    <h1 class="da-section-title">How can we reach you?</h1>

    <div class="fields">
      <InputText
        v-model="local.preferredName"
        @update:model-value="sync"
        placeholder="Preferred name"
        class="da-input"
        fluid
      />
      <InputText
        v-model="local.email"
        @update:model-value="sync"
        placeholder="Email"
        class="da-input"
        type="email"
        fluid
      />
      <div class="phone-row">
        <div class="country-code">+65</div>
        <InputText
          v-model="local.phone"
          @update:model-value="sync"
          placeholder="Mobile"
          class="da-input phone-input"
          inputmode="numeric"
          fluid
        />
      </div>
      <InputText
        v-model="local.postalCode"
        @update:model-value="sync"
        placeholder="Postal Code"
        class="da-input"
        inputmode="numeric"
        maxlength="6"
        fluid
      />
    </div>

    <div class="channels">
      <p class="channels-title">Keep me updated for any special deals.</p>
      <button
        v-for="ch in channels"
        :key="ch"
        type="button"
        class="channel-card"
        :class="{ 'is-on': local.marketingChannels.includes(ch) }"
        @click="toggleChannel(ch)"
      >
        <span class="channel-box" :class="{ 'is-on': local.marketingChannels.includes(ch) }">
          <span v-if="local.marketingChannels.includes(ch)" class="channel-tick">&check;</span>
        </span>
        <span class="channel-label">{{ ch }}</span>
      </button>
    </div>

    <button type="button" class="pdpa" @click="togglePdpa">
      <span class="channel-box" :class="{ 'is-on': local.consentPdpa }">
        <span v-if="local.consentPdpa" class="channel-tick">&check;</span>
      </span>
      <span class="pdpa-text">
        I acknowledge and agree to the collection, use and disclosure of my personal data which has been provided for the purposes of procuring insurance products &amp; services as per the DirectAsia
        <a href="https://www.directasia.com/security-privacy/" target="_blank" rel="noopener" @click.stop>Personal Data Protection Statement</a>.
      </span>
    </button>

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

.fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.phone-row {
  display: flex;
  align-items: stretch;
}
.country-code {
  background: var(--da-grey-100);
  border: 1px solid var(--da-grey-300);
  border-right: 0;
  border-radius: var(--da-radius-card) 0 0 var(--da-radius-card);
  padding: 16px;
  font-size: 16px;
  font-weight: 700;
  color: #5c5c5c;
  display: flex;
  align-items: center;
}

.channels {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}
.channels-title {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--da-carbon);
}
.channel-card {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  background: #fff;
  border: 1px solid var(--da-grey-300);
  border-radius: var(--da-radius-card);
  padding: 16px;
  text-align: left;
  cursor: pointer;
  font-family: var(--da-font);
}
.channel-card.is-on { border-color: var(--da-green); }
.channel-label {
  font-size: 16px;
  font-weight: 500;
  color: var(--da-carbon);
}
.channel-box {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid var(--da-carbon);
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.channel-box.is-on { background: var(--da-green); border-color: var(--da-green); }
.channel-tick {
  color: #fff;
  font-size: 10px;
  line-height: 1;
}

.pdpa {
  background: transparent;
  border: 0;
  padding: 0;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  text-align: left;
  cursor: pointer;
  font-family: var(--da-font);
  margin-top: 8px;
}
.pdpa .channel-box { margin-top: 4px; }
.pdpa-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--da-carbon);
  line-height: 1.5;
}
.pdpa-text a {
  color: var(--da-cyan);
  text-decoration: underline;
}

.step :deep(.da-input.p-inputtext),
.step :deep(.da-input .p-inputtext) {
  font-family: var(--da-font);
  background: #fff;
  border: 1px solid var(--da-grey-300);
  border-radius: var(--da-radius-card);
  padding: 16px;
  font-size: 16px;
  color: var(--da-carbon);
  font-weight: 500;
  min-height: 56px;
  width: 100%;
}
.phone-row :deep(.phone-input.p-inputtext) {
  border-radius: 0 var(--da-radius-card) var(--da-radius-card) 0;
}
</style>
