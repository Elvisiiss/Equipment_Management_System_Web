<template>
  <div>
    <h3>车间设备实时监控</h3>

    <!-- 顶部筛选 -->
    <el-form inline>
      <el-form-item label="设备名称">
        <el-input v-model="filter.name" placeholder="模糊查询" clearable />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="filter.status" clearable>
          <el-option label="运行" value="运行" />
          <el-option label="停机" value="停机" />
          <el-option label="故障" value="故障" />
        </el-select>
      </el-form-item>
    </el-form>

    <!-- 设备卡片网格 -->
    <el-row :gutter="12">
      <el-col
          v-for="dev in filteredList"
          :key="dev.id"
          :span="6"
          style="margin-bottom:12px"
      >
        <el-card
            shadow="hover"
            :body-style="{padding:'10px'}"
            :style="{borderTop: statusColorMap[dev.status]}"
        >
          <template #header>
            <span>{{ dev.name }}</span>
            <el-tag size="small" :type="statusTypeMap[dev.status]">
              {{ dev.status }}
            </el-tag>
          </template>

          <div>资产码：{{ dev.assetNo }}</div>
          <div>逻辑位置：{{ dev.location }}</div>
          <div>最后更新：{{ dev.lastUpdate }}</div>
          <div style="margin-top:6px">
            <el-button size="small" type="primary" @click="locate(dev)">
              定位
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 定位弹窗 -->
    <el-dialog v-model="locateVisible" title="实时定位" width="30%">
      <p>设备 <strong>{{ locateRow?.name }}</strong> 当前位置：</p>
      <p>坐标：{{ locateRow?.x }}, {{ locateRow?.y }}</p>
      <p>区域：{{ locateRow?.area }}</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="locateVisible=false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'

// 模拟设备列表
const deviceList = ref([
  { id:1, name:'注塑机-A01', status:'运行', assetNo:'E-001', location:'A区-1排', lastUpdate:'2025-08-08 09:12', x:120, y:300, area:'A区' },
  { id:2, name:'冲压机-B05', status:'停机', assetNo:'E-002', location:'B区-3排', lastUpdate:'2025-08-08 08:55', x:400, y:600, area:'B区' },
  { id:3, name:'CNC-03', status:'故障', assetNo:'E-003', location:'C区-2排', lastUpdate:'2025-08-08 09:05', x:700, y:400, area:'C区' },
  { id:4, name:'装配线-1', status:'运行', assetNo:'E-004', location:'D区-1排', lastUpdate:'2025-08-08 09:10', x:900, y:200, area:'D区' },
])

const filter = reactive({ name:'', status:'' })

const filteredList = computed(() =>
    deviceList.value.filter(d =>
        (!filter.name || d.name.includes(filter.name)) &&
        (!filter.status || d.status === filter.status)
    )
)

const statusColorMap = { 运行:'3px solid #67C23A', 停机:'3px solid #909399', 故障:'3px solid #F56C6C' }
const statusTypeMap   = { 运行:'success', 停机:'info', 故障:'danger' }

const locateVisible = ref(false)
const locateRow = ref()
function locate(row){
  locateRow.value = row
  locateVisible.value = true
}
</script>
