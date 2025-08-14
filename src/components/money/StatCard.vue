<template>
  <el-card class="stat-card">
    <div class="icon"><el-icon :size="32"><component :is="icon" :style="{color}"/></el-icon></div>
    <div class="text">
      <div class="title">{{ title }}</div>
      <div class="num">{{ value }}</div>
    </div>
  </el-card>
</template>

<script setup>
defineProps({ title:String, value:[String,Number], icon:String, color:{type:String,default:'#409EFF'} })
</script>

<style scoped>
.stat-card{display:flex;align-items:center}
.icon{margin-right:12px}
.title{font-size:14px;color:#666}
.num{font-size:22px;font-weight:600;margin-top:4px}
</style>
