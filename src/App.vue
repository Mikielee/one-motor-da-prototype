<script setup>
import { ref, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import StepIndicator from './components/StepIndicator.vue'

// The scrolling region is this inner div, not the window — so the router's
// scrollBehavior can't reset it. Without this, navigating from a scrolled step
// (e.g. Step 8 -> Quote) lands mid-page and looks blank until a refresh.
const scrollEl = ref(null)
const route = useRoute()
watch(
  () => route.fullPath,
  () => { nextTick(() => scrollEl.value?.scrollTo(0, 0)) }
)
</script>

<template>
  <div class="da-shell">
    <AppHeader />
    <StepIndicator />
    <!-- The only scrolling region: step content + footer. The CTA bar inside a
         step sticks to the bottom of this region while the content scrolls. -->
    <div class="da-scroll" ref="scrollEl">
      <main class="da-page">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
      <AppFooter />
    </div>
  </div>
</template>

<style>
.da-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  display: flex;
  flex-direction: column;
}
/* Grows to fill the scroll region on short pages so the sticky CTA rests at the
   bottom; grows with content on long pages so it scrolls. */
.da-page {
  flex: 1 0 auto;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 160ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
