<script setup>
// DA "Frame 683" radio-option card. States match the component sheet:
// default 1px #49454F · selected 2px #457CBF + filled radio · hover +shadow ·
// focus 1px #457CBF · error 1px #A94442. Outline is an inset box-shadow so the
// 1px->2px selected change never shifts content. Title 14/700, desc 12/400.
defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  selected: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
})
defineEmits(['select'])
</script>

<template>
  <button
    type="button"
    role="radio"
    :aria-checked="selected"
    class="opt-card"
    :class="{ 'is-selected': selected, 'is-error': error }"
    @click="$emit('select')"
  >
    <span class="opt-radio" :class="{ 'is-on': selected }">
      <span v-if="selected" class="opt-dot" />
    </span>
    <span class="opt-text">
      <span class="opt-title">{{ title }}</span>
      <span v-if="description" class="opt-desc">{{ description }}</span>
    </span>
  </button>
</template>

<style scoped>
.opt-card {
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
@media (hover: hover) {
  .opt-card:hover {
    box-shadow: inset 0 0 0 1px var(--da-card-line),
                0 2px 4px rgba(0, 0, 0, 0.10), 0 1px 1px rgba(0, 0, 0, 0.05);
  }
}
.opt-card:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 1px var(--da-blue);
}
.opt-card.is-selected,
.opt-card.is-selected:hover {
  box-shadow: inset 0 0 0 2px var(--da-blue);
}
.opt-card.is-error {
  box-shadow: inset 0 0 0 1px var(--da-error);
}

.opt-radio {
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
.opt-radio.is-on { border-color: var(--da-blue); }
.opt-dot { width: 10.66px; height: 10.66px; border-radius: 50%; background: var(--da-blue); }

.opt-text { display: flex; flex-direction: column; gap: 4px; }
.opt-title { font-size: 14px; font-weight: 700; color: var(--da-ink); line-height: 1.3; }
.opt-desc { font-size: 12px; font-weight: 400; color: var(--da-ink); line-height: 1.4; }
</style>
