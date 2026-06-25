<script setup>
/**
 * DA date field — Material outlined field (4px radius, calendar icon).
 *  - Type digits and slashes auto-insert: 21062025 -> 21/06/2025.
 *  - Tap the calendar icon to open a BOTTOM SHEET calendar (so it never
 *    overflows the viewport or overlaps the sticky CTA / back button). Focusing
 *    the input just lets you type — the sheet only opens via the icon.
 *  - Filled / focused border = DA blue; error = #A94442; disabled = greyed.
 */
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import DatePicker from 'primevue/datepicker'

const props = defineProps({
  modelValue: { type: [Date, Object, null], default: null },
  minDate: { type: Date, default: undefined },
  maxDate: { type: Date, default: undefined },
  disabled: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  placeholder: { type: String, default: 'DD/MM/YYYY' },
  id: { type: String, default: undefined },
  // Resting outline colour (Material steps use #79747E; some forms #CCCCCC).
  fieldOutline: { type: String, default: '#79747E' },
})
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const focused = ref(false)

function pad(n) { return String(n).padStart(2, '0') }
function fmt(date) {
  if (!date) return ''
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

const text = ref(fmt(props.modelValue))
watch(() => props.modelValue, (v) => { text.value = fmt(v) })

const calValue = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const filled = computed(() => Boolean(props.modelValue))

function maskDigits(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  if (digits.length > 4) return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return digits
}

function stripTime(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
function withinRange(d) {
  if (props.minDate && d < stripTime(props.minDate)) return false
  if (props.maxDate && d > props.maxDate) return false
  return true
}

function onInput(e) {
  const masked = maskDigits(e.target.value)
  text.value = masked
  e.target.value = masked

  if (masked.length === 10) {
    const [dd, mm, yyyy] = masked.split('/').map(Number)
    const d = new Date(yyyy, mm - 1, dd)
    const valid =
      d.getFullYear() === yyyy && d.getMonth() === mm - 1 && d.getDate() === dd
    if (valid && withinRange(d)) {
      emit('update:modelValue', d)
      return
    }
  }
  if (props.modelValue) emit('update:modelValue', null)
}

function onCalSelect(v) {
  emit('update:modelValue', v)
  open.value = false
}

// Calendar opens only via the icon (typing stays unobstructed).
function openCal() {
  if (props.disabled) return
  open.value = true
}
function onFocus() { focused.value = true }
function onBlur() { focused.value = false }

// Lock background scroll while the sheet is up.
watch(open, (v) => { document.body.style.overflow = v ? 'hidden' : '' })
onBeforeUnmount(() => { document.body.style.overflow = '' })
</script>

<template>
  <div
    class="da-datefield"
    :class="{ 'is-filled': filled, 'is-focused': focused || open, 'is-error': invalid, 'is-disabled': disabled }"
    :style="{ '--df-outline': fieldOutline }"
  >
    <input
      :id="id"
      class="da-datefield-input"
      type="text"
      inputmode="numeric"
      autocomplete="off"
      :placeholder="placeholder"
      :value="text"
      :disabled="disabled"
      maxlength="10"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
    />
    <button
      type="button"
      class="da-datefield-icon"
      aria-label="Open calendar"
      tabindex="-1"
      :disabled="disabled"
      @click="openCal"
    >
      <i class="pi pi-calendar" aria-hidden="true"></i>
    </button>

    <Teleport to="body">
      <Transition name="ds">
        <div v-if="open" class="da-df-overlay">
          <div class="da-df-backdrop" @click="open = false" />
          <div class="da-df-sheet" role="dialog" aria-modal="true">
            <span class="da-df-grip" aria-hidden="true" />
            <DatePicker
              v-model="calValue"
              inline
              :min-date="minDate"
              :max-date="maxDate"
              @update:model-value="onCalSelect"
            />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.da-datefield {
  position: relative;
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid var(--df-outline, var(--da-outline));
  border-radius: 4px;
  min-height: var(--da-field-height);
  transition: border-color 120ms ease;
}
.da-datefield.is-filled,
.da-datefield.is-focused { border-color: var(--da-blue); }
.da-datefield.is-error { border-color: var(--da-error); }
.da-datefield.is-disabled { background: #F5F6F7; }

.da-datefield-input {
  flex: 1 1 auto;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.5px;
  color: var(--da-ink);
  padding: 0 8px 0 16px;
  min-height: calc(var(--da-field-height) - 2px);
  border-radius: 4px;
}
.da-datefield-input::placeholder { color: #49454F; font-weight: 500; }
.da-datefield.is-disabled .da-datefield-input { color: #49454F; }

.da-datefield-icon {
  flex: 0 0 auto;
  background: transparent;
  border: 0;
  padding: 0 16px 0 8px;
  color: #49454F;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}
.da-datefield-icon:disabled { cursor: not-allowed; color: var(--da-radio-line); }
.da-datefield-icon .pi { font-size: 20px; }

/* ---- Bottom sheet calendar ---- */
.da-df-overlay { position: fixed; inset: 0; z-index: 1000; }
.da-df-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(29, 27, 32, 0.45);
}
.da-df-sheet {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: min(420px, 100vw);
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -10px 32px rgba(0, 0, 0, 0.22);
  padding: 8px 13px max(16px, env(safe-area-inset-bottom));
}
.da-df-grip {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: #D1CDD4;
  margin: 4px auto 12px;
}
.da-df-sheet :deep(.p-datepicker-panel),
.da-df-sheet :deep(.p-datepicker) {
  border: 0;
  box-shadow: none;
  width: 100%;
}
/* Selected day uses the DA blue accent (not the green CTA primary). */
.da-df-sheet :deep(.p-datepicker-day-selected) {
  background: var(--da-blue);
  color: #fff;
}

/* Sheet motion — backdrop fades, sheet rises (ease-out). */
.ds-enter-active .da-df-backdrop,
.ds-leave-active .da-df-backdrop { transition: opacity 200ms ease-out; }
.ds-enter-from .da-df-backdrop,
.ds-leave-to .da-df-backdrop { opacity: 0; }
.ds-enter-active .da-df-sheet,
.ds-leave-active .da-df-sheet { transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1); }
.ds-enter-from .da-df-sheet,
.ds-leave-to .da-df-sheet { transform: translate(-50%, 100%); }
</style>
