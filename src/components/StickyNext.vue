<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Button from 'primevue/button'

const props = defineProps({
  disabled: { type: Boolean, default: false },
  to: { type: [String, Number, Object], default: null },
  label: { type: String, default: 'Next' },
  hideBack: { type: Boolean, default: false },
  price: { type: String, default: '' },
  // Cadence label under the running price. Defaults to "Total" — never "per
  // year": DA cover term flexes 7–18 months (KB f1898394 / 38971919), so a
  // yearly framing is inaccurate and exposes us to MAS premium-display rules.
  priceUnit: { type: String, default: 'Total' },
  // When true, a valid Next click emits `next` instead of routing — let the
  // parent decide where to go (e.g. a UW-reject branch).
  interceptNext: { type: Boolean, default: false },
})

// `blocked` fires when the user clicks Next while the step is still invalid;
// `next` fires when the parent opted into intercept and the click was valid.
const emit = defineEmits(['blocked', 'next'])

const router = useRouter()
const route = useRoute()

const step = computed(() => route.meta?.step ?? 1)
const showBack = computed(() => !props.hideBack && step.value > 1)

function onNext() {
  // The button looks grey but stays clickable: a click while invalid reveals
  // the errors instead of navigating.
  if (props.disabled) {
    emit('blocked')
    return
  }
  if (props.interceptNext) {
    emit('next')
    return
  }
  if (props.to !== null) {
    router.push(typeof props.to === 'object' ? props.to : props.to)
    return
  }
  if (step.value < 11) router.push(`/step/${step.value + 1}`)
}

function onBack() {
  if (step.value > 1) router.push(`/step/${step.value - 1}`)
  else router.back()
}
</script>

<template>
  <!-- Yellow CTA zone — Figma node 3983:2888. Rounded top corners curve over
       the white content above; the yellow continues straight into the footer. -->
  <div class="sticky-cta">
    <div v-if="price" class="sticky-price">
      <span class="sticky-price-amt">{{ price }}</span>
      <span class="sticky-price-unit">{{ priceUnit }}</span>
    </div>
    <div class="sticky-actions">
      <button
        v-if="showBack"
        type="button"
        class="sticky-back"
        aria-label="Go back"
        @click="onBack"
      >
        <i class="pi pi-chevron-left" aria-hidden="true"></i>
      </button>
      <Button
        class="da-primary"
        :class="{ 'is-blocked': disabled }"
        :aria-disabled="disabled ? 'true' : 'false'"
        :label="label"
        @click="onNext"
      />
    </div>
  </div>
</template>

<style scoped>
.sticky-cta {
  background: var(--da-yellow);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: auto -16px 0 -16px;
  border-top-left-radius: var(--da-radius-lg);
  border-top-right-radius: var(--da-radius-lg);
}

.sticky-price {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 0 4px 0;
}
.sticky-price-amt {
  font-size: 22px;
  font-weight: 700;
  color: var(--da-ink);
}
.sticky-price-unit {
  font-size: 13px;
  color: var(--da-ink);
}

.sticky-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Back button — Figma "Frame 1007": yellow fill on the yellow zone, grey M3
   outline, soft shadow, dark chevron. */
.sticky-back {
  flex: 0 0 72px;
  width: 72px;
  height: 47px;
  background: var(--da-yellow);
  border: 1px solid var(--da-outline);
  border-radius: var(--da-radius-card);
  box-shadow: var(--da-btn-shadow);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #1D1B20;
  cursor: pointer;
  padding: 0;
}
.sticky-back:hover { background: #F3D200; }
.sticky-back .pi { font-size: 16px; }

.sticky-actions :deep(.p-button.da-primary) {
  flex: 1 1 auto;
}
</style>
