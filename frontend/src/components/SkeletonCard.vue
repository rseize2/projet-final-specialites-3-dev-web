<template>
  <div class="skeleton-card-wrapper">
    <div class="skeleton skeleton-card">
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text" style="width: 80%;"></div>
      <div class="skeleton skeleton-text" style="width: 60%;"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SkeletonCard'
}
</script>

<style scoped>
.skeleton-card-wrapper {
  margin-bottom: 20px;
}

.skeleton-card {
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 2000px 100%;
  animation: shimmer 2s infinite linear;
  border-radius: 4px;
}

.skeleton-title {
  height: 24px;
  width: 60%;
  margin-bottom: 16px;
}

.skeleton-text {
  height: 16px;
  margin-bottom: 12px;
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}
</style>
