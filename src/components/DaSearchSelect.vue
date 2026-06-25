<script setup>
/**
 * DA search-select (Year / Car brand / Car model / form dropdowns).
 *
 * Closed field: Material outlined "search bar" with a chevron-down.
 * Open: a BOTTOM SHEET slides up from the foot of the screen — a dimmed
 * backdrop covers the sticky CTA, and the option list scrolls inside the sheet.
 * This replaces the old anchored panel, which overflowed the viewport when the
 * field sat near the bottom of a mobile page. Keeps the DA look: white surface,
 * #2196F3 active accent, grab handle, in-sheet search (magnifier + X clear) and
 * a grouped list.
 */
import { ref, computed, nextTick, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { default: null },
  // Flat [{label,value}] or grouped [{label, items:[{label,value}]}].
  options: { type: Array, default: () => [] },
  grouped: { type: Boolean, default: false },
  searchable: { type: Boolean, default: false },
  placeholder: { type: String, default: 'Select' },
  disabled: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  // Resting field outline colour (Material steps use #79747E; some forms #CCCCCC).
  fieldOutline: { type: String, default: '#79747E' },
})
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const query = ref('')
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

async function openSheet() {
  if (props.disabled) return
  query.value = ''
  open.value = true
  if (props.searchable) {
    await nextTick()
    searchInput.value?.focus()
  }
}
function close() { open.value = false }
function pick(o) {
  emit('update:modelValue', o.value)
  open.value = false
}

// Lock background scroll while the sheet is up.
watch(open, (v) => { document.body.style.overflow = v ? 'hidden' : '' })
onBeforeUnmount(() => { document.body.style.overflow = '' })
</script>

<template>
  <div
    class="da-ss"
    :class="{ 'is-open': open, 'is-disabled': disabled, 'is-invalid': invalid }"
    :style="{ '--ss-outline': fieldOutline }"
  >
    <button type="button" class="da-ss-field" :disabled="disabled" @click="openSheet">
      <span class="da-ss-value" :class="{ 'is-placeholder': !selectedLabel }">
        {{ selectedLabel || placeholder }}
      </span>
      <span class="da-ss-chev" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 15.4L6 9.4L7.4 8L12 12.6L16.6 8L18 9.4L12 15.4Z" fill="currentColor" />
        </svg>
      </span>
    </button>

    <Teleport to="body">
      <Transition name="ss">
        <div v-if="open" class="da-ss-overlay">
          <div class="da-ss-backdrop" @click="close" />
          <div class="da-ss-sheet" role="dialog" aria-modal="true">
            <span class="da-ss-grip" aria-hidden="true" />

            <div v-if="searchable" class="da-ss-search">
              <span class="da-ss-search-ic" aria-hidden="true">
                <img src="/search-icon.png" alt="" width="24" height="24" />
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
      </Transition>
    </Teleport>
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
  border: 1px solid var(--ss-outline, var(--da-outline));
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
  transition: transform 160ms ease;
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

/* ---- Bottom sheet ---- */
.da-ss-overlay { position: fixed; inset: 0; z-index: 1000; }
.da-ss-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(29, 27, 32, 0.45);
}
.da-ss-sheet {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: min(420px, 100vw);
  max-height: 78vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -10px 32px rgba(0, 0, 0, 0.22);
  padding: 8px 13px max(16px, env(safe-area-inset-bottom));
}
.da-ss-grip {
  flex: 0 0 auto;
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: #D1CDD4;
  margin: 4px auto 12px;
}

/* In-sheet search field. */
.da-ss-search {
  flex: 0 0 auto;
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
  min-width: 0;
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

.da-ss-list {
  flex: 1 1 auto;
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}
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
.da-ss-item:active { background: #F5F6F7; }
@media (hover: hover) { .da-ss-item:hover { background: #F5F6F7; } }
.da-ss-item.is-sel { color: var(--da-blue); font-weight: 700; }
.da-ss-empty {
  padding: 16px;
  font-family: var(--da-font);
  font-size: 14px;
  color: var(--da-step-off);
}

/* Sheet motion — backdrop fades, sheet rises (ease-out). */
.ss-enter-active .da-ss-backdrop,
.ss-leave-active .da-ss-backdrop { transition: opacity 200ms ease-out; }
.ss-enter-from .da-ss-backdrop,
.ss-leave-to .da-ss-backdrop { opacity: 0; }
.ss-enter-active .da-ss-sheet,
.ss-leave-active .da-ss-sheet { transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1); }
.ss-enter-from .da-ss-sheet,
.ss-leave-to .da-ss-sheet { transform: translate(-50%, 100%); }
</style>
