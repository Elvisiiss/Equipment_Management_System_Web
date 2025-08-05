<template>
  <el-card>
    <template #header>存储管理 – 库位可视化</template>
    <div style="display:flex;gap:20px">
      <div>
        <el-input v-model="loc" placeholder="库位编码 例:A-03-2-05" />
        <el-button type="primary" @click="searchLoc">查询</el-button>
      </div>
      <el-table :data="locData" border height="300">
        <el-table-column prop="loc" label="库位" />
        <el-table-column prop="mold" label="模具" />
        <el-table-column prop="status" label="状态">
          <template #default="{row}">
            <el-tag :type="row.status==='可用'?'success':row.status==='保养中'?'warning':'danger'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const loc = ref('')
const locData = ref<any[]>([])
const searchLoc = ()=>{
  // 模拟
  locData.value = [
    {loc:loc.value, mold:'M-001', status:'可用'},
    {loc:loc.value, mold:'M-002', status:'保养中'}
  ]
}
</script>
