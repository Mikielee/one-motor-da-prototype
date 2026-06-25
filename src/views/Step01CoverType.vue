<script setup>
import { computed } from 'vue'
import StickyNext from '../components/StickyNext.vue'
import FieldError from '../components/FieldError.vue'
import { useQuote } from '../store/quote'
import { useValidation } from '../composables/useValidation'

const { quote, mutable } = useQuote()
const { showErrors, reveal } = useValidation()

// Fixed order, no pre-selected default (OMP-6 requirements 3 & 4).
const options = [
  {
    value: 'comprehensive',
    title: 'Comprehensive',
    description: 'Full protection — covers damage to your car, other vehicles, fire, theft, and more.',
  },
  {
    value: 'third-party-fire-theft',
    title: 'Third party, fire & theft',
    description: 'Covers damage to other vehicles plus fire and theft of your car.',
  },
  {
    value: 'third-party',
    title: 'Third party only',
    description: 'Basic cover — protects against damage you cause to other vehicles and property.',
  },
]

const canContinue = computed(() => Boolean(quote.coverType))
const hasError = computed(() => showErrors.value && !canContinue.value)

function select(value) {
  mutable.coverType = value
}
</script>

<template>
  <section class="step">
    <h1 class="da-section-title">Which cover do you need?</h1>

    <div
      class="cover-options"
      role="radiogroup"
      aria-label="Cover type"
      :data-error="hasError ? 'true' : null"
    >
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        role="radio"
        :aria-checked="quote.coverType === opt.value"
        class="cover-card"
        :class="{ 'is-selected': quote.coverType === opt.value, 'is-error': hasError }"
        @click="select(opt.value)"
      >
        <span class="cover-radio" :class="{ 'is-on': quote.coverType === opt.value }">
          <span v-if="quote.coverType === opt.value" class="cover-radio-dot" />
        </span>
        <span class="cover-text">
          <span class="cover-title">{{ opt.title }}</span>
          <span class="cover-desc">{{ opt.description }}</span>
        </span>
      </button>
    </div>

    <FieldError :show="hasError" message="Select a cover option." />

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

.cover-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Default — white card, 1px slate outline (Figma node 3936:2058). */
.cover-card {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  background: #fff;
  border: 1px solid var(--da-card-line);
  border-radius: var(--da-radius-card);
  padding: 16px;
  text-align: left;
  cursor: pointer;
  transition: border-color 120ms ease, background 120ms ease;
}

/* Hover (desktop only) — subtle darken of the outline. */
@media (hover: hover) {
  .cover-card:hover { border-color: var(--da-ink); }
}

/* Focus — visible blue outline for keyboard users (OMP-6 AC 3). */
.cover-card:focus-visible {
  outline: 2px solid var(--da-blue);
  outline-offset: 2px;
}

/* Selected — blue radio + blue outline + light blue tint (OMP-6 AC 4).
   DA uses the blue accent for the selected/active card state. */
.cover-card.is-selected {
  border-color: var(--da-blue);
  background: var(--da-blue-tint);
}

/* Error — red outline on every card until one is picked (OMP-6 AC 5). */
.cover-card.is-error {
  border-color: var(--da-red);
}

.cover-radio {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid var(--da-radio-line);
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.cover-radio.is-on {
  border-color: var(--da-blue);
}
.cover-radio-dot {
  width: 10.66px;
  height: 10.66px;
  border-radius: 50%;
  background: var(--da-blue);
}

.cover-text { display: flex; flex-direction: column; gap: 4px; }
.cover-title { font-size: 16px; font-weight: 700; color: var(--da-ink); line-height: 1.3; }
.cover-desc { font-size: 12px; font-weight: 500; color: var(--da-ink); line-height: 1.4; }
</style>
