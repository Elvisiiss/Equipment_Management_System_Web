<template>
  <el-tag :type="map[type]">{{ type }}</el-tag>
</template>

<script setup>
defineProps({ type: String })
const map = {
  运行中: 'success',
  宕机: 'danger',
  闲置: 'info',
  无排程: '',
  保养: 'warning',
  转机: 'warning',
  待生产部门确认: 'danger'
}
</script>
