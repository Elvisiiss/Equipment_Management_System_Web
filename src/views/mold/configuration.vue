<template>
  <div class="mould-life-config">
    <el-card>
      <template #header>
        <span>模治具寿命上限配置</span>
      </template>

      <!-- 1. 选择模具类型 -->
      <el-form label-width="120px">
        <el-form-item label="模具类型">
          <el-select
              v-model="mouldType"
              placeholder="请选择"
              style="width: 220px"
              @change="onMouldTypeChange"
          >
            <el-option
                v-for="t in mouldTypeOptions"
                :key="t.value"
                :label="t.label"
                :value="t.value"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <!-- 2. 根据模具类型展示可配置维度 -->
      <div v-if="mouldType">
        <el-divider content-position="left">寿命上限维度配置</el-divider>

        <el-table :data="editableDimensions" stripe style="width: 100%">
          <!-- 维度名称 -->
          <el-table-column label="维度" width="100">
            <template #default="{ row }">
              {{ dimensionMap[row.type].typeLabel }}
            </template>
          </el-table-column>

          <!-- 启用开关 -->
          <el-table-column label="启用" width="80">
            <template #default="{ row }">
              <el-switch v-model="row.enabled" />
            </template>
          </el-table-column>

          <!-- 寿命上限 -->
          <el-table-column label="寿命上限">
            <template #default="{ row }">
              <el-input-number
                  v-model="row.limit"
                  :min="0"
                  :precision="row.type === 'length' ? 2 : 0"
                  :step="row.type === 'length' ? 0.01 : 1"
                  controls-position="right"
                  style="width: 160px"
                  :disabled="!row.enabled"
              >
                <template #append>{{ dimensionMap[row.type].unit }}</template>
              </el-input-number>
            </template>
          </el-table-column>

          <!-- 说明 -->
          <el-table-column label="说明">
            <template #default="{ row }">
              <span>{{ dimensionMap[row.type].desc }}</span>
            </template>
          </el-table-column>

          <!-- 删除 -->
          <el-table-column label="操作" width="70">
            <template #default="{ $index }">
              <el-button
                  type="danger"
                  size="small"
                  text
                  @click="removeDimension($index)"
              >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>

        <!-- 新增维度按钮：仅当还有可添加维度时才显示 -->
        <div style="margin-top: 12px">
          <el-button
              v-if="canAddDimension"
              type="primary"
              plain
              @click="addDimension"
          >新增维度</el-button
          >
        </div>

        <!-- 底部保存/重置 -->
        <div class="action-bar">
          <el-button type="primary" @click="handleSave">保存</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

/* ========== 1. 维度元数据 ========== */
const dimensionMap = {
  count: {
    typeLabel: '次数',
    unit: '次',
    desc: '每生产一件产品，已使用次数 +1'
  },
  time: {
    typeLabel: '时间',
    unit: '小时',
    desc: '从安装到卸载的累计时长'
  },
  length: {
    typeLabel: '长度',
    unit: '米',
    desc: '使用累计长度（暂不可用）'
  }
}

/* ========== 2. 模具类型 → 支持的维度列表 ========== */
const mouldTypeMapping = {
  stamping: ['count', 'time'],          // 冲压模
  injection: ['count', 'time', 'length'], // 注塑模
  cutting: ['time', 'length']           // 裁切刀
}

const mouldTypeOptions = [
  { value: 'stamping', label: '冲压模' },
  { value: 'injection', label: '注塑模' },
  { value: 'cutting', label: '裁切刀' }
]

/* ========== 3. 响应式数据 ========== */
const mouldType = ref('') // 当前选中的模具类型
const editableDimensions = reactive([]) // 当前可编辑的维度行

/* 生成空维度行 */
function createDimensionRow(type) {
  return {
    type,
    enabled: true,
    limit: 0
  }
}

/* 模具类型切换时重新生成配置表 */
function onMouldTypeChange() {
  editableDimensions.splice(0)
  const supported = mouldTypeMapping[mouldType.value] || []
  supported.forEach(type => {
    editableDimensions.push(createDimensionRow(type))
  })
}

/* ========== 4. 新增/删除维度 ========== */
const canAddDimension = computed(() => {
  if (!mouldType.value) return false
  const supported = mouldTypeMapping[mouldType.value] || []
  const used = new Set(editableDimensions.map(d => d.type))
  return supported.some(t => !used.has(t))
})

function addDimension() {
  const supported = mouldTypeMapping[mouldType.value] || []
  const used = new Set(editableDimensions.map(d => d.type))
  const nextType = supported.find(t => !used.has(t))
  if (nextType) {
    editableDimensions.push(createDimensionRow(nextType))
  }
}

function removeDimension(index) {
  editableDimensions.splice(index, 1)
}

/* ========== 5. 保存 / 重置 ========== */
function handleSave() {
  const payload = {
    mouldType: mouldType.value,
    dimensions: editableDimensions.filter(d => d.enabled)
  }
  console.log('保存配置：', payload)
  ElMessage.success('保存成功！')
}

function handleReset() {
  onMouldTypeChange()
  ElMessage.info('已重置')
}
</script>

<style scoped>
.action-bar {
  margin-top: 24px;
  text-align: right;
}
</style>
