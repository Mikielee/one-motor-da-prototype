<script setup>
/**
 * DaQuoteFooter — the DA running-price sticky bar, used from Step 9 onward.
 * The chevron handle expands a white breakdown panel showing how the customer's
 * selections move the premium (same idea as the BDI footer; DA styling + logic).
 *
 * Layout: yellow bar (back · running price · Next) with a floating chevron chip;
 * expanding reveals the cover breakdown + any applied promos above the bar.
 */
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDaPricing } from '../composables/useDaPricing'

const props = defineProps({
  disabled: { type: Boolean, default: false },
  nextLabel: { type: String, default: 'Next' },
  // When true a valid Next emits `next` instead of routing (e.g. a custom branch
  // or the final Pay action).
  interceptNext: { type: Boolean, default: false },
})
const emit = defineEmits(['blocked', 'next'])

const router = useRouter()
const route = useRoute()
const pricing = useDaPricing()

const expanded = ref(false)
const step = computed(() => route.meta?.step ?? 1)
const LAST_STEP = 15

function onNext() {
  if (props.disabled) { emit('blocked'); return }
  if (props.interceptNext) { emit('next'); return }
  if (step.value < LAST_STEP) router.push(`/step/${step.value + 1}`)
}
function onBack() {
  if (step.value > 1) router.push(`/step/${step.value - 1}`)
  else router.back()
}
</script>

<template>
  <div class="da-qf" :class="{ 'is-expanded': expanded }">
    <button
      type="button"
      class="da-qf-chip"
      :aria-expanded="expanded"
      :aria-label="expanded ? 'Hide price details' : 'Show price details'"
      @click="expanded = !expanded"
    >
      <i :class="expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-up'" aria-hidden="true"></i>
    </button>

    <div v-if="expanded" class="da-qf-panel">
      <p class="bd-title">{{ pricing.coverLabel.value }}</p>
      <div v-for="r in pricing.rows.value" :key="r.label" class="bd-row" :class="{ 'is-good': r.good }">
        <span>{{ r.label }}</span>
        <span>{{ r.value }}</span>
      </div>
      <div v-for="(p, i) in pricing.promos.value" :key="'p' + i" class="bd-row is-good">
        <span>Promo</span>
        <span>{{ p.name }}</span>
      </div>
    </div>

    <div class="da-qf-bar">
      <button type="button" class="qf-back" aria-label="Go back" @click="onBack">
        <i class="pi pi-chevron-left" aria-hidden="true"></i>
      </button>
      <div class="qf-price">
        <span class="qf-amt">{{ pricing.displayAmount.value }}</span>
        <span class="qf-period">{{ pricing.periodLabel.value }}</span>
      </div>
      <button
        type="button"
        class="qf-next"
        :class="{ 'is-blocked': disabled }"
        :aria-disabled="disabled ? 'true' : 'false'"
        @click="onNext"
      >
        {{ nextLabel }}
        <i class="pi pi-chevron-right" aria-hidden="true"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* margin-top: auto pins the bar to the bottom of the .step flex column on short
   pages; it scrolls with content on long ones. */
.da-qf {
  position: sticky;
  bottom: 0;
  z-index: 20;
  margin: auto -16px 0 -16px;
  padding: 24px 16px 12px;
  background: var(--da-yellow);
  border-top-left-radius: var(--da-radius-lg);
  border-top-right-radius: var(--da-radius-lg);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.da-qf-chip {
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
.da-qf-chip .pi { font-size: 16px; font-weight: 700; }

/* Expanded breakdown — white card on the yellow bar. */
.da-qf-panel {
  background: #fff;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 50vh;
  overflow-y: auto;
}
.bd-title { margin: 0 0 2px; font-family: var(--da-font); font-size: 14px; font-weight: 800; color: #000; }
.bd-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-family: var(--da-font);
  font-size: 14px;
  font-weight: 500;
  color: #000;
}
.bd-row.is-good, .bd-row.is-good span { color: var(--da-green); }

.da-qf-bar {
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
.qf-next.is-blocked { background: #E8E8E8; color: #979797; }
</style>
