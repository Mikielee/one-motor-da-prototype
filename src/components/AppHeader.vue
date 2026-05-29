<script setup>
</script>

<template>
  <header class="da-header">
    <a class="da-logo" href="/" aria-label="DirectAsia Insurance home">
      <span class="da-logo-wordmark" aria-hidden="true">
        <span class="da-logo-line">
          <span class="ink">Direct</span><span class="teal">Asia</span><sup class="reg">®</sup>
        </span>
      </span>
      <span class="da-logo-tagline">Insurance made easy</span>
    </a>
    <div class="da-header-right">
      <button class="da-product-chip" type="button">
        <i class="pi pi-car da-chip-icon" aria-hidden="true"></i>
        <span>Car Insurance</span>
      </button>
      <button class="da-menu" type="button" aria-label="Open menu">
        <i class="pi pi-bars" aria-hidden="true"></i>
      </button>
    </div>
  </header>
</template>

<style scoped>
.da-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 84px;
  padding: 0 16px;
  background: #fff;
  border-bottom: 1px solid var(--da-grey-200);
}

.da-logo {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  gap: 2px;
  line-height: 1;
}

.da-logo-tagline {
  font-size: 10px;
  font-weight: 500;
  color: var(--da-grey-600);
  letter-spacing: 0.2px;
  margin-top: 2px;
}

.da-logo-wordmark {
  font-family: var(--da-font);
  font-weight: 800;
  letter-spacing: -0.02em;
  display: inline-flex;
  flex-direction: column;
  line-height: 1;
}
.da-logo-line {
  font-size: 24px;
  display: inline-block;
}
.da-logo-line .ink { color: var(--da-carbon); }
.da-logo-line .teal { color: var(--da-green); }
.da-logo-line .reg {
  font-size: 9px;
  font-weight: 700;
  color: var(--da-green);
  margin-left: 1px;
  vertical-align: super;
}

.da-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.da-product-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--da-grey-100);
  border: 1px solid var(--da-grey-200);
  border-radius: var(--da-radius-pill);
  color: var(--da-carbon);
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
}

.da-chip-icon {
  font-size: 16px;
  color: var(--da-green);
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
  color: var(--da-carbon);
}
.da-menu .pi { font-size: 20px; }
</style>
