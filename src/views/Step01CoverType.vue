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

/* Radio-option card states — DA "Frame 683" component sheet. The outline is an
   inset box-shadow (not a border) so the 1px -> 2px selected change never
   shifts the card's content. Background stays WHITE in every state except
   disabled — the selected state is a 2px blue ring, NOT a tint. */
.cover-card {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  background: #fff;
  border: 0;
  border-radius: var(--da-radius-card);
  padding: 16px;
  text-align: left;
  cursor: pointer;
  box-shadow: inset 0 0 0 1px var(--da-card-line);
  transition: box-shadow 120ms ease;
}

/* Hover (desktop only) — default outline + soft drop shadow. */
@media (hover: hover) {
  .cover-card:hover {
    box-shadow: inset 0 0 0 1px var(--da-card-line),
                0 2px 4px rgba(0, 0, 0, 0.10), 0 1px 1px rgba(0, 0, 0, 0.05);
  }
}

/* Focus — 1px blue ring for keyboard users (OMP-6 AC 3). */
.cover-card:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 1px var(--da-blue);
}

/* Selected — 2px blue ring + blue-filled radio, white bg (OMP-6 AC 4). */
.cover-card.is-selected,
.cover-card.is-selected:hover {
  box-shadow: inset 0 0 0 2px var(--da-blue);
}

/* Error — 1px error-red ring on every card until one is picked (OMP-6 AC 5). */
.cover-card.is-error {
  box-shadow: inset 0 0 0 1px var(--da-error);
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
