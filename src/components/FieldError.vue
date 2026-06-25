<script setup>
defineProps({
  show: { type: Boolean, default: false },
  message: { type: String, default: '' },
})
</script>

<template>
  <p v-if="show && message" class="da-field-error" role="alert">{{ message }}</p>
</template>
