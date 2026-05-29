<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const groups = [
  { id: 0, label: 'Your Car' },
  { id: 1, label: 'Your Details' },
  { id: 2, label: 'Your Quote' },
  { id: 3, label: 'Finalise & Pay' },
]

const activeGroup = computed(() => route.meta?.group ?? 0)
</script>

<template>
  <nav class="da-steps" aria-label="Quote progress">
    <div
      v-for="g in groups"
      :key="g.id"
      class="da-step"
      :class="{ 'is-active': g.id === activeGroup, 'is-done': g.id < activeGroup }"
    >
      <span class="da-step-label">{{ g.label }}</span>
      <span class="da-step-bar" />
    </div>
  </nav>
</template>

<style scoped>
.da-steps {
  display: flex;
  gap: 8px;
  padding: 16px 16px 0 16px;
  background: var(--da-bg);
}
.da-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.da-step-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--da-grey-600);
  text-align: center;
  line-height: 1.3;
}
.da-step-bar {
  width: 100%;
  height: 4px;
  border-radius: var(--da-radius-pill);
  background: var(--da-grey-300);
}
.da-step.is-active .da-step-label { color: var(--da-green); }
.da-step.is-active .da-step-bar { background: var(--da-green); }
.da-step.is-done .da-step-label { color: var(--da-carbon); }
.da-step.is-done .da-step-bar { background: var(--da-green); }
</style>
