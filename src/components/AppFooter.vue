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
/* Footer — Figma node 3936:1896. Yellow surface, continues straight under the
   yellow CTA zone above it. Red links, slate body. */
.da-footer {
  background: var(--da-yellow);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.da-footer-body {
  margin: 0;
  color: var(--da-ink);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
}
.da-footer-body strong { color: var(--da-ink); font-weight: 700; }

.da-footer-links {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
}
.da-footer-links a {
  color: var(--da-red);
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
}
</style>
