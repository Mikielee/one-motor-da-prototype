<script setup>
/**
 * DA bottom sheet — generic shell for short input flows (promo code, Shell Go+
 * ID, save & email). Same pattern as DaSearchSelect: Teleport to body, dimmed
 * backdrop, white sheet rising from the foot of the screen with a grab handle.
 */
import { watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
})
const emit = defineEmits(['close'])

// Lock background scroll while the sheet is up.
watch(() => props.open, (v) => { document.body.style.overflow = v ? 'hidden' : '' })
onBeforeUnmount(() => { document.body.style.overflow = '' })
</script>

<template>
  <Teleport to="body">
    <Transition name="ds">
      <div v-if="open" class="da-sheet-overlay">
        <div class="da-sheet-backdrop" @click="emit('close')" />
        <div class="da-sheet" role="dialog" aria-modal="true">
          <button type="button" class="da-sheet-x" aria-label="Close" @click="emit('close')">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#D9D9D9"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>
          </button>
          <span class="da-sheet-grip" aria-hidden="true" />
          <h2 v-if="title" class="da-sheet-title">{{ title }}</h2>
          <div class="da-sheet-body">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.da-sheet-overlay { position: fixed; inset: 0; z-index: 1100; }
.da-sheet-backdrop { position: absolute; inset: 0; background: rgba(29, 27, 32, 0.45); }
.da-sheet {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: min(420px, 100vw);
  max-height: 86vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -10px 32px rgba(0, 0, 0, 0.22);
  padding: 8px 16px max(20px, env(safe-area-inset-bottom));
}
.da-sheet-x {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  line-height: 0;
}
.da-sheet-grip {
  flex: 0 0 auto;
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: #D1CDD4;
  margin: 4px auto 16px;
}
.da-sheet-title {
  margin: 0 0 12px;
  font-family: var(--da-font);
  font-size: 20px;
  font-weight: 700;
  color: var(--da-ink);
}
.da-sheet-body { overflow-y: auto; }

.ds-enter-active .da-sheet-backdrop,
.ds-leave-active .da-sheet-backdrop { transition: opacity 200ms ease-out; }
.ds-enter-from .da-sheet-backdrop,
.ds-leave-to .da-sheet-backdrop { opacity: 0; }
.ds-enter-active .da-sheet,
.ds-leave-active .da-sheet { transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1); }
.ds-enter-from .da-sheet,
.ds-leave-to .da-sheet { transform: translate(-50%, 100%); }
</style>
