<template>
  <el-container class="wrap">
    <!-- 左侧类别树 -->
    <el-aside width="220px" class="aside">
      <el-tree
          :data="treeData"
          node-key="id"
          default-expand-all
          highlight-current
          @node-click="handleNodeClick"
      />
    </el-aside>

    <!-- 右侧参数配置 -->
    <el-main>
      <h3>{{ currentTitle }} 重要参数配置</h3>

      <el-button type="primary" @click="addParam">新增参数</el-button>

      <el-table
          ref="tableRef"
          :data="paramTable"
          row-key="id"
          border
          style="width: 100%; margin-top: 12px"
      >
        <!-- 拖拽手柄 -->
        <el-table-column width="40" align="center">
          <template #default>
            <i class="drag-handle">⋮⋮</i>
          </template>
        </el-table-column>

        <el-table-column label="参数名称" width="220">
          <template #default="{ row }">
            <el-input v-model="row.name" placeholder="请输入名称" />
          </template>
        </el-table-column>

        <el-table-column label="参数类型" width="140">
          <template #default="{ row }">
            <el-select v-model="row.type">
              <el-option label="数值" value="number" />
              <el-option label="文本" value="text" />
              <el-option label="布尔" value="boolean" />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column label="默认值">
          <template #default="{ row }">
            <el-input
                v-if="row.type === 'text'"
                v-model="row.default"
                placeholder="默认值"
            />
            <el-input-number
                v-else-if="row.type === 'number'"
                v-model="row.default"
                :min="0"
                :precision="2"
            />
            <el-switch v-else v-model="row.default" />
          </template>
        </el-table-column>

        <el-table-column label="单位" width="100">
          <template #default="{ row }">
            <el-input v-model="row.unit" placeholder="单位" />
          </template>
        </el-table-column>

        <el-table-column label="是否必填" width="90" align="center">
          <template #default="{ row }">
            <el-checkbox v-model="row.required" />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="90" align="center">
          <template #default="{ $index }">
            <el-button type="danger" link @click="removeParam($index)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-button type="success" style="margin-top: 16px" @click="save">
        保存配置
      </el-button>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue'
import Sortable from 'sortablejs'
import { ElMessage } from 'element-plus'

/* ----------------- 树形数据 ----------------- */
const treeData = [
  { id: 1, label: '清洗机' },
  { id: 2, label: 'COG机' },
  { id: 3, label: 'FOG机' },
  { id: 4, label: 'AOI机' },
  { id: 5, label: '组装机' }
]

/* ----------------- 模板 ----------------- */
const templates = {
  清洗机: [
    { name: '清洗时间', type: 'number', default: 30, unit: 's', required: true },
    { name: '清洗温度', type: 'number', default: 60, unit: '℃', required: true },
    { name: '喷淋压力', type: 'number', default: 0.3, unit: 'MPa', required: false },
    { name: '干燥时间', type: 'number', default: 10, unit: 's', required: false }
  ],
  COG机: [
    { name: '压接温度', type: 'number', default: 180, unit: '℃', required: true },
    { name: '压接时间', type: 'number', default: 8, unit: 's', required: true },
    { name: '压接压力', type: 'number', default: 80, unit: 'N', required: true },
    { name: '对位精度', type: 'number', default: 5, unit: 'μm', required: false }
  ],
  FOG机: [
    { name: 'FOG温度', type: 'number', default: 160, unit: '℃', required: true },
    { name: 'FOG压力', type: 'number', default: 0.2, unit: 'MPa', required: true },
    { name: '贴合速度', type: 'number', default: 5, unit: 'mm/s', required: false }
  ],
  AOI机: [
    { name: '光源亮度', type: 'number', default: 80, unit: '%', required: true },
    { name: '检测阈值', type: 'number', default: 0.85, unit: '', required: true },
    { name: '拍照延时', type: 'number', default: 200, unit: 'ms', required: false }
  ],
  组装机: [
    { name: '组装压力', type: 'number', default: 20, unit: 'N', required: true },
    { name: '旋转速度', type: 'number', default: 100, unit: 'rpm', required: false },
    { name: '保压时间', type: 'number', default: 3, unit: 's', required: true }
  ]
}

/* ----------------- 响应式数据 ----------------- */
const currentTitle = ref('')
const paramTable = ref([])
const store = reactive({})
const tableRef = ref(null)

/* ----------------- 方法 ----------------- */
function handleNodeClick(node) {
  const label = node.label
  currentTitle.value = label
  if (store[label]) {
    paramTable.value = store[label]
  } else {
    paramTable.value = templates[label].map((item, idx) => ({
      ...item,
      id: Date.now() + idx
    }))
    store[label] = paramTable.value
  }
  nextTick(initDrag)
}

function addParam() {
  paramTable.value.push({
    id: Date.now(),
    name: '',
    type: 'text',
    default: '',
    unit: '',
    required: false
  })
  nextTick(initDrag)
}

function removeParam(index) {
  paramTable.value.splice(index, 1)
  nextTick(initDrag)
}

function save() {
  console.log(currentTitle.value, paramTable.value)
  ElMessage.success('已保存！')
}

/* --------------- 拖拽指令 --------------- */
let sortable = null
function initDrag() {
  const tbody = tableRef.value?.$el.querySelector('.el-table__body tbody')
  if (!tbody) return
  if (sortable) sortable.destroy()
  sortable = Sortable.create(tbody, {
    handle: '.drag-handle',
    animation: 150,
    onEnd({ newIndex, oldIndex }) {
      const targetRow = paramTable.value.splice(oldIndex, 1)[0]
      paramTable.value.splice(newIndex, 0, targetRow)
    }
  })
}

/* --------------- 初始化 --------------- */
nextTick(() => handleNodeClick(treeData[0]))
</script>

<style scoped>
.wrap {
  height: 100vh;
}
.aside {
  border-right: 1px solid #e4e7ed;
  padding: 12px;
}
.drag-handle {
  cursor: move;
  font-size: 16px;
  color: #909399;
  user-select: none;
}
h3 {
  margin: 0 0 12px;
}
</style>
