<script setup lang="ts">
// Simple skeleton loader for activity cards
</script>

<template>
  <div class="box">
    <div class="level">
      <div class="level-left">
        <div>
          <div class="skeleton" style="width: 200px; height: 1.5rem; margin-bottom: 0.5rem"></div>
          <div class="skeleton" style="width: 250px; height: 0.875rem"></div>
        </div>
      </div>
    </div>

    <div class="skeleton" style="width: 100%; height: 1rem; margin-bottom: 1rem"></div>
    <div class="skeleton" style="width: 100%; height: 1rem; margin-bottom: 1rem"></div>

    <div class="level">
      <div class="level-left">
        <div class="skeleton" style="width: 150px; height: 1.5rem"></div>
      </div>
      <div class="level-right">
        <div class="skeleton" style="width: 150px; height: 1.5rem"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 0.25rem;
  display: inline-block;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
