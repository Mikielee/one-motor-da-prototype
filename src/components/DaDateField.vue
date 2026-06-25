<script setup>
/**
 * DA date field — matches the Step 2 Figma frame (node 3949:16083).
 *  - Material-style outlined field: 4px radius, #79747E outline, calendar icon.
 *  - Typing digits auto-inserts slashes in real time: 21062025 -> 21/06/2025.
 *  - Clicking the field or icon opens an inline calendar; picking a date fills
 *    the field and closes the popup.
 *  - Filled / focused border = DA blue (active accent); error = #A94442;
 *    disabled = greyed.
 */
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
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
const root = ref(null)

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

function toggle() {
  if (props.disabled) return
  open.value = !open.value
}
function onFocus() {
  focused.value = true
  if (!props.disabled) open.value = true
}
function onBlur() { focused.value = false }

function onDocClick(e) {
  if (root.value && !root.value.contains(e.target)) open.value = false
}
onMounted(() => document.addEventListener('mousedown', onDocClick))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocClick))
</script>

<template>
  <div
    ref="root"
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
      @click="toggle"
    >
      <i class="pi pi-calendar" aria-hidden="true"></i>
    </button>

    <div v-if="open" class="da-datefield-pop">
      <DatePicker
        v-model="calValue"
        inline
        :min-date="minDate"
        :max-date="maxDate"
        @update:model-value="onCalSelect"
      />
    </div>
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
/* Filled or focused = blue (DA active accent). */
.da-datefield.is-filled,
.da-datefield.is-focused { border-color: var(--da-blue); }
.da-datefield.is-error { border-color: var(--da-error); }
.da-datefield.is-disabled { background: #F5F6F7; }

.da-datefield-input {
  flex: 1 1 auto;
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

.da-datefield-pop {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 30;
  background: #fff;
  border: 1px solid var(--da-blue);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 4px;
}
.da-datefield-pop :deep(.p-datepicker-panel),
.da-datefield-pop :deep(.p-datepicker) {
  border: 0;
  box-shadow: none;
}
/* Selected day uses the DA blue accent (not the green CTA primary). */
.da-datefield-pop :deep(.p-datepicker-day-selected) {
  background: var(--da-blue);
  color: #fff;
}
</style>
