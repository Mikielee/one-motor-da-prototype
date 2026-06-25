<script setup>
/**
 * DA search-select (Year / Car brand / Car model) — matches the OMP-89 Figma
 * component. The closed field is a Material outlined "search bar" with a
 * chevron-down. Tapping it opens a panel (white, 16px radius, #2196F3 border,
 * soft shadow) holding an optional in-panel search field (magnifier + "Search"
 * + X clear) and a grouped, scrollable list that filters as the user types.
 */
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { default: null },
  // Flat [{label,value}] or grouped [{label, items:[{label,value}]}].
  options: { type: Array, default: () => [] },
  grouped: { type: Boolean, default: false },
  searchable: { type: Boolean, default: false },
  placeholder: { type: String, default: 'Select' },
  disabled: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const query = ref('')
const root = ref(null)
const searchInput = ref(null)

const allItems = computed(() =>
  props.grouped ? props.options.flatMap((g) => g.items) : props.options
)
const selectedLabel = computed(() => {
  const found = allItems.value.find((o) => o.value === props.modelValue)
  return found ? found.label : ''
})

const filteredGroups = computed(() => {
  const q = query.value.trim().toLowerCase()
  const match = (o) => o.label.toLowerCase().includes(q)
  if (props.grouped) {
    return props.options
      .map((g) => ({ label: g.label, items: g.items.filter(match) }))
      .filter((g) => g.items.length)
  }
  const items = props.options.filter(match)
  return items.length ? [{ label: null, items }] : []
})

async function toggle() {
  if (props.disabled) return
  open.value = !open.value
  if (open.value) {
    query.value = ''
    if (props.searchable) {
      await nextTick()
      searchInput.value?.focus()
    }
  }
}
function pick(o) {
  emit('update:modelValue', o.value)
  open.value = false
}
function onDocClick(e) {
  if (root.value && !root.value.contains(e.target)) open.value = false
}
onMounted(() => document.addEventListener('mousedown', onDocClick))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocClick))
</script>

<template>
  <div
    ref="root"
    class="da-ss"
    :class="{ 'is-open': open, 'is-disabled': disabled, 'is-invalid': invalid }"
  >
    <button type="button" class="da-ss-field" :disabled="disabled" @click="toggle">
      <span class="da-ss-value" :class="{ 'is-placeholder': !selectedLabel }">
        {{ selectedLabel || placeholder }}
      </span>
      <span class="da-ss-chev" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 15.4L6 9.4L7.4 8L12 12.6L16.6 8L18 9.4L12 15.4Z" fill="currentColor" />
        </svg>
      </span>
    </button>

    <div v-if="open" class="da-ss-panel">
      <div v-if="searchable" class="da-ss-search">
        <span class="da-ss-search-ic" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19.6 21L13.3 14.7C12.8 15.1 12.225 15.4167 11.575 15.65C10.925 15.8833 10.2333 16 9.5 16C7.68333 16 6.14583 15.3708 4.8875 14.1125C3.62917 12.8542 3 11.3167 3 9.5C3 7.68333 3.62917 6.14583 4.8875 4.8875C6.14583 3.62917 7.68333 3 9.5 3C11.3167 3 12.8542 3.62917 14.1125 4.8875C15.3708 6.14583 16 7.68333 16 9.5C16 10.2333 15.8833 10.925 15.65 11.575C15.4167 12.225 15.1 12.8 14.7 13.3L21 19.6L19.6 21Z" fill="#49454F" />
          </svg>
        </span>
        <input
          ref="searchInput"
          v-model="query"
          type="text"
          class="da-ss-search-input"
          placeholder="Search"
        />
        <button v-if="query" type="button" class="da-ss-clear" aria-label="Clear search" @click="query = ''">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M6.4 19L5 17.6L10.6 12L5 6.4L6.4 5L12 10.6L17.6 5L19 6.4L13.4 12L19 17.6L17.6 19L12 13.4L6.4 19Z" fill="#49454F" />
          </svg>
        </button>
      </div>

      <ul class="da-ss-list">
        <template v-for="(g, gi) in filteredGroups" :key="gi">
          <li v-if="g.label" class="da-ss-group">{{ g.label }}</li>
          <li
            v-for="o in g.items"
            :key="o.value"
            class="da-ss-item"
            :class="{ 'is-sel': o.value === modelValue }"
            @click="pick(o)"
          >
            {{ o.label }}
          </li>
        </template>
        <li v-if="!filteredGroups.length" class="da-ss-empty">No matches</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.da-ss { position: relative; width: 100%; }

/* Closed field — Material outlined search bar with chevron-down. */
.da-ss-field {
  width: 100%;
  height: 56px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fff;
  border: 1px solid var(--da-outline);
  border-radius: 4px;
  padding: 0 8px 0 20px;
  cursor: pointer;
  text-align: left;
}
.da-ss-value {
  flex: 1 1 auto;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 400;
  line-height: 1.4;
  color: #1D1B20;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.da-ss-value.is-placeholder { color: #49454F; }
.da-ss-chev {
  flex: 0 0 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #49454F;
  transition: transform 120ms ease;
}

.da-ss.is-open .da-ss-field { border: 2px solid #2196F3; padding-left: 19px; }
.da-ss.is-open .da-ss-chev { transform: rotate(180deg); }
.da-ss.is-invalid .da-ss-field { border-color: var(--da-error); }

.da-ss.is-disabled .da-ss-field {
  background: #E8E8E8;
  border-color: #D1CDD4;
  cursor: not-allowed;
}
.da-ss.is-disabled .da-ss-value.is-placeholder { color: #49454F; }
.da-ss.is-disabled .da-ss-chev { color: #49454F; }

/* Open panel — blue border, rounded, shadow (Figma "Rectangle 8"). */
.da-ss-panel {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 40;
  background: #fff;
  border: 1px solid #2196F3;
  border-radius: 16px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.25);
  padding: 13px;
  max-height: 320px;
  overflow-y: auto;
}

/* In-panel search field. */
.da-ss-search {
  position: relative;
  display: flex;
  align-items: center;
  height: 56px;
  border: 1px solid var(--da-outline);
  border-radius: 4px;
  padding: 0 8px 0 14px;
  margin-bottom: 8px;
}
.da-ss-search:focus-within { border: 2px solid #2196F3; }
.da-ss-search-ic { flex: 0 0 24px; display: inline-flex; align-items: center; }
.da-ss-search-input {
  flex: 1 1 auto;
  border: 0;
  outline: 0;
  background: transparent;
  font-family: var(--da-font);
  font-size: 16px;
  color: #1D1B20;
  padding: 0 8px 0 16px;
  height: 100%;
}
.da-ss-search-input::placeholder { color: #49454F; }
.da-ss-clear {
  flex: 0 0 40px;
  height: 40px;
  background: transparent;
  border: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #49454F;
}

.da-ss-list { list-style: none; margin: 0; padding: 0; }
.da-ss-group {
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 400;
  color: var(--da-outline);
  line-height: 24px;
  padding: 8px 16px 4px;
}
.da-ss-item {
  min-height: 56px;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  font-family: var(--da-font);
  font-size: 16px;
  font-weight: 400;
  color: #1D1B20;
  line-height: 1.4;
  cursor: pointer;
  border-radius: 4px;
}
.da-ss-item:hover { background: #F5F6F7; }
.da-ss-item.is-sel { color: var(--da-blue); font-weight: 700; }
.da-ss-empty {
  padding: 16px;
  font-family: var(--da-font);
  font-size: 14px;
  color: var(--da-step-off);
}
</style>
