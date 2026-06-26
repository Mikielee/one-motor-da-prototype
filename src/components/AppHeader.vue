<script setup>
// da-logo.png lives in /public, so Vite serves it at the site root.
// The "Car Insurance" chip doubles as a sprint-review demo trigger: clicking it
// autofills the current step with consistent test data. See useDemoAutofill.js.
import { useDemoAutofill } from '../composables/useDemoAutofill'

const { trigger } = useDemoAutofill()
</script>

<template>
  <header class="da-header">
    <a class="da-logo" href="/" aria-label="DirectAsia Insurance home">
      <img src="/da-logo.png" alt="DirectAsia Insurance" class="da-logo-img" />
    </a>
    <div class="da-header-right">
      <button type="button" class="da-product-chip" title="Demo: autofill this page" @click="trigger">Car Insurance</button>
      <button class="da-menu" type="button" aria-label="Open menu">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M18.6087 7.06433H5.39132C4.48751 7.06433 3.75 6.40011 3.75 5.57147C3.75 4.74284 4.48751 4.07861 5.39132 4.07861H18.6087C19.5125 4.07861 20.25 4.74941 20.25 5.57147C20.25 6.39353 19.5125 7.06433 18.6087 7.06433Z" fill="#333F48"/>
          <path d="M18.6087 13.4698H5.39132C4.48751 13.4698 3.75 12.799 3.75 11.977C3.75 11.1549 4.48751 10.4841 5.39132 10.4841H18.6087C19.5125 10.4841 20.25 11.1549 20.25 11.977C20.25 12.799 19.5125 13.4698 18.6087 13.4698Z" fill="#333F48"/>
          <path d="M18.6087 19.4413H5.39132C4.48751 19.4413 3.75 18.7705 3.75 17.9484C3.75 17.1264 4.48751 16.4556 5.39132 16.4556H18.6087C19.5125 16.4556 20.25 17.1264 20.25 17.9484C20.25 18.7705 19.5125 19.4413 18.6087 19.4413Z" fill="#333F48"/>
        </svg>
      </button>
    </div>
  </header>
</template>

<style scoped>
/* Header — Figma node 5535:5065. White bar, grey bottom divider, 84px tall. */
.da-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 84px;
  padding: 17px 16px;
  background: #fff;
  border-bottom: 1px solid var(--da-line);
}

.da-logo {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}
.da-logo-img {
  width: 72px;
  height: 51px;
  object-fit: contain;
  display: block;
}

.da-header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* "Car Insurance" chip — translucent yellow, black text, Montserrat 14/500. */
.da-product-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background: var(--da-yellow-chip);
  border: 0;
  border-radius: var(--da-radius-card);
  color: #000;
  font-family: var(--da-font);
  font-weight: 500;
  font-size: 14px;
  line-height: 1.4;
  white-space: nowrap;
  cursor: pointer;
}

.da-menu {
  width: 24px;
  height: 24px;
  background: transparent;
  border: 0;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
</style>
