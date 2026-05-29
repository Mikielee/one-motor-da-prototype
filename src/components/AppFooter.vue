<script setup>
</script>

<template>
  <footer class="da-footer">
    <p class="da-footer-body">
      Our insurance is underwritten by Auto &amp; General Insurance (Singapore) Pte. Limited
      (Co. Reg. No. 201626103G), trading as
      <strong>DirectAsia Insurance.</strong>
    </p>
    <nav class="da-footer-links">
      <a href="#">Contact Us</a>
      <a href="#">Terms &amp; Conditions</a>
      <a href="#">Security &amp; Privacy</a>
    </nav>
  </footer>
</template>

<style scoped>
.da-footer {
  background: #fff;
  padding: 16px;
  border-top: 1px solid var(--da-grey-200);
}

.da-footer-body {
  margin: 0 0 16px 0;
  color: var(--da-grey-600);
  font-size: 12px;
  line-height: 1.5;
}

.da-footer-body strong { color: var(--da-grey-600); font-weight: 700; }

.da-footer-links {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
}
.da-footer-links a {
  color: var(--da-cyan);
  text-decoration: none;
  white-space: nowrap;
}
</style>
