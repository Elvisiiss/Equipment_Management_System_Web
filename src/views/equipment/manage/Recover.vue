<!--  5.3 复机检查-->
<!--  ├─                                        //5.3.1 PM工单复机检查创建-->
<!--  ├─ 5.3.2 复机项目管理-->
<!--  └─ 5.3.3 复机检查列表-->


<template>
  <el-tree
      :data="treeData"
      node-key="id"
      highlight-current
      @node-click="emit('node-click', $event)"/>
</template>

<script setup>
import { inject } from 'vue';
import eventBus from "@/utils/eventBus.js";
const treeData = inject('locationTree');
const emit = defineEmits(['node-click']);

eventBus.on('need-recovery', (locationId) => {
  const list = recoveryMap.value.get(locationId) || [];
  eventBus.emit('send-recovery', list);
});
</script>
