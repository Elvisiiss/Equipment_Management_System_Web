<template>
  <el-card>
    <template #header>
      <span>资产主数据管理</span>
      <el-button type="primary" size="small" style="float:right" @click="openAdd">新增</el-button>
    </template>

    <el-row :gutter="12">
      <!-- 左侧树 -->
      <el-col :span="6">
        <el-tree :data="treeData" default-expand-all @node-click="handleNodeClick" />
      </el-col>

      <!-- 右侧表格 -->
      <el-col :span="18">
        <el-table :data="pagedData" border stripe>
          <el-table-column prop="code" label="资产编号" />
          <el-table-column prop="name" label="名称" />
          <el-table-column prop="type" label="类型" />
          <el-table-column prop="model" label="规格" />
          <el-table-column label="操作" width="120">
            <template #default="{row}">
              <el-button size="small" @click="openEdit(row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination background class="mt-12"
                       v-model:current-page="page.current"
                       :page-size="page.size"
                       :total="filterData.length"
                       layout="prev, pager, next" />
      </el-col>
    </el-row>

    <!-- 弹窗 -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑' : '新增'" width="480">
      <el-form :model="form" label-width="80">
        <el-form-item label="资产编号"><el-input v-model="form.code" /></el-form-item>
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type">
            <el-option label="设备" value="设备" />
            <el-option label="模治具" value="模治具" />
            <el-option label="零配件" value="零配件" />
          </el-select>
        </el-form-item>
        <el-form-item label="规格"><el-input v-model="form.model" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'

/* ========= 假数据 ========= */
const treeData = ref([
  { label: '工厂A', children: [
      { label: '车间A1', children: [
          { label: '线体A1-1' },
          { label: '线体A1-2' }
        ]}
    ]},
  { label: '工厂B', children: [
      { label: '车间B1', children: [
          { label: '线体B1-1' }
        ]}
    ]}
])

const allAssets = ref([
  { id: 1, code: 'EQ001', name: '注塑机', type: '设备', model: '500T', location: '工厂A-车间A1-线体A1-1' },
  { id: 2, code: 'MO001', name: '模具A', type: '模治具', model: '32腔', location: '工厂A-车间A1-线体A1-1' },
  { id: 3, code: 'PA001', name: '加热圈', type: '零配件', model: '220V 500W', location: '工厂A-车间A1-线体A1-1' },
  { id: 4, code: 'EQ002', name: '冲压机', type: '设备', model: '200T', location: '工厂B-车间B1-线体B1-1' }
])

/* ========= 分页 & 过滤 ========= */
const selectedNode = ref('')
const handleNodeClick = (node) => { selectedNode.value = node.label }
const filterData = computed(() =>
    selectedNode.value
        ? allAssets.value.filter(a => a.location.includes(selectedNode.value))
        : allAssets.value
)

const page = reactive({ current: 1, size: 10 })
const pagedData = computed(() => {
  const start = (page.current - 1) * page.size
  return filterData.value.slice(start, start + page.size)
})

/* ========= 弹窗逻辑 ========= */
const dialogVisible = ref(false)
const form = reactive({ id: null, code: '', name: '', type: '', model: '' })
const openAdd = () => {
  Object.assign(form, { id: null, code: '', name: '', type: '', model: '' })
  dialogVisible.value = true
}
const openEdit = (row) => {
  Object.assign(form, row)
  dialogVisible.value = true
}
const save = () => {
  if (form.id) {
    const idx = allAssets.value.findIndex(a => a.id === form.id)
    Object.assign(allAssets.value[idx], form)
  } else {
    allAssets.value.push({ ...form, id: Date.now(), location: '工厂A-车间A1-线体A1-1' })
  }
  dialogVisible.value = false
}
</script>
