<template>
  <el-card shadow="hover" @click="$router.push('/device/' + name)">
    <div class="card-body">
      <el-icon size="24"><Monitor /></el-icon>
      <span>{{ name }}</span>
    </div>
  </el-card>
</template>

<script setup>
defineProps({ name: String })
</script>

<style scoped>
.card-body{display:flex;align-items:center;gap:8px}
</style>
