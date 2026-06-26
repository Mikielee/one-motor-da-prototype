<script setup>
/**
 * DA Material text field with a notched floating label.
 *  - Empty + unfocused: the label sits inside as a placeholder.
 *  - Focused or filled: the label floats up onto the outline (notched).
 *  - Focus = 2px blue; filled (verified) = 1px blue; error = #A94442.
 */
import { ref } from 'vue'

defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  inputmode: { type: String, default: undefined },
  autocomplete: { type: String, default: 'off' },
  invalid: { type: Boolean, default: false },
  id: { type: String, default: undefined },
})
defineEmits(['update:modelValue'])

const focused = ref(false)
</script>

<template>
  <div
    class="da-fi"
    :class="{ 'is-focus': focused, 'is-filled': !!modelValue, 'is-invalid': invalid }"
  >
    <input
      :id="id"
      class="da-fi-input"
      :type="type"
      :inputmode="inputmode"
      :autocomplete="autocomplete"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @focus="focused = true"
      @blur="focused = false"
    />
    <label class="da-fi-label" :for="id">{{ label }}</label>
  </div>
</template>

<style scoped>
.da-fi {
  position: relative;
  height: 56px;
  background: #fff;
  border: 1px solid #CCCCCC;
  border-radius: 4px;
  transition: border-color 100ms ease;
}
.da-fi.is-filled:not(.is-focus) { border-color: var(--da-blue); }
.da-fi.is-focus { border: 2px solid var(--da-blue); }
.da-fi.is-invalid { border-color: var(--da-error); }

.da-fi-input {
  width: 100%;
  height: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  padding: 0 16px;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 500;
  color: #1D1B20;
}

.da-fi-label {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #49454F;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 500;
  line-height: 1;
  pointer-events: none;
  transition: top 120ms ease, font-size 120ms ease, left 120ms ease, color 120ms ease;
}
.da-fi.is-focus .da-fi-label,
.da-fi.is-filled .da-fi-label {
  top: 0;
  left: 12px;
  font-size: 12px;
  line-height: 16px;
  background: #fff;
  padding: 0 4px;
}
.da-fi.is-focus .da-fi-label { color: var(--da-blue); }
.da-fi.is-invalid .da-fi-label { color: var(--da-error); }
</style>
