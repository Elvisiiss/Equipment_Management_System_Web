<template>
  <div class="lifecycle">
    <h3>生命周期记录</h3>
    <el-timeline>
      <el-timeline-item
          v-for="record in records"
          :key="record.id"
          :timestamp="record.date"
          :type="getRecordType(record.type)"
          placement="top"
      >
        <el-card>
          <h4>{{ record.type }} - {{ record.operator }}</h4>
          <p>{{ record.description }}</p>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  records: {
    type: Array,
    default: () => []
  }
});

const getRecordType = (type) => {
  const typeMap = {
    '入库': 'primary',
    '使用': 'success',
    '保养': 'warning',
    '维修': 'danger',
    '借用': 'info',
    '归还': 'info'
  };
  return typeMap[type] || 'primary';
};
</script>

<style scoped>
.lifecycle {
  margin-top: 20px;
}
</style>
