<template>
  <div class="area-manage">
    <!-- 工具栏 -->
    <div style="margin-bottom:12px">
      <el-button type="primary" @click="openAdd">新增区域</el-button>
      <span style="margin-left:12px;color:#666;font-size:13px">
        提示：先在表格中选中一行，再点“新增区域”即可在该节点下添加子级；厂区只能改名，不能删除或再建厂区。

      </span>
    </div>

    <!-- 树状表格 -->
    <el-table
        ref="tableRef"
        :data="treeData"
        row-key="id"
        default-expand-all
        highlight-current-row
        @current-change="row => selectedRow = row"
        style="width:100%"
    >
      <el-table-column prop="name" label="区域名称" />
      <el-table-column prop="id"   label="区域ID" width="120" />
      <el-table-column label="操作" width="220" align="center">
        <template #default="{row}">
          <!-- 厂区只能编辑 -->
          <template v-if="row.id === 0">
            <el-button size="small" @click="openEdit(row)">编辑</el-button>
          </template>
          <!-- 其余节点可编辑、可删除 -->
          <template v-else>
            <el-button size="small" @click="openEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="360">
      <el-form>
        <el-form-item label="区域名称">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

/* ---------- 初始化固定结构 ---------- */
let id = 0
const treeData = ref([])

// 1. 厂区（唯一，id=0）
const factoryNode = { id: id++, name: '厂区', children: [] }
treeData.value.push(factoryNode)

// 2. 车间 C2~C6
const workshops = ['C2', 'C3', 'C4', 'C5', 'C6']
const segments  = ['CFOG段', '贴合段', '组装段', '30米线段']

workshops.forEach(ws => {
  const workshopNode = { id: id++, name: `${ws}车间`, children: [] }
  factoryNode.children.push(workshopNode)

  // 3. 产线 31~36 / 41~46 …
  for (let l = 1; l <= 6; l++) {
    const lineNo   = Number(ws.substring(1)) * 10 + l + 10
    const lineNode = { id: id++, name: `${lineNo}产线`, children: [] }
    workshopNode.children.push(lineNode)

    // 4. 工段
    segments.forEach(seg => {
      lineNode.children.push({ id: id++, name: seg })
    })
  }
})

/* ---------- 响应式变量 ---------- */
const tableRef    = ref(null)
const selectedRow = ref(null)   // 当前选中
const dialogVisible = ref(false)
const dialogType    = ref('add')   // add / edit
const form = ref({ name: '' })
let editingNode = null

/* ---------- 计算属性 ---------- */
const dialogTitle = computed(() => dialogType.value === 'add' ? '新增区域' : '编辑区域')

/* ---------- 工具函数 ---------- */
// 递归查找并删除
function removeNode(arr, node) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === node) { arr.splice(i, 1); return true }
    if (arr[i].children && removeNode(arr[i].children, node)) return true
  }
  return false
}

/* ---------- 事件处理 ---------- */
function openAdd() {
  if (!selectedRow.value) {
    // 未选中，直接加到厂区下面（车间级）
    editingNode = treeData.value[0]   // 厂区
  } else {
    const row = selectedRow.value
    if (row.id === 0) {
      // 厂区选中 → 加车间
      editingNode = row
    } else if (!row.children) {
      // 工段级不能再加子级
      ElMessage.warning('工段下不能再新增！')
      return
    } else {
      // 车间或产线
      editingNode = row
    }
  }

  dialogType.value = 'add'
  form.value = { name: '' }
  dialogVisible.value = true
}

function openEdit(row) {
  dialogType.value = 'edit'
  form.value = { name: row.name }
  editingNode = row
  dialogVisible.value = true
}

function handleSave() {
  const name = form.value.name.trim()
  if (!name) { ElMessage.warning('请输入名称'); return }

  if (dialogType.value === 'add') {
    const newNode = { id: id++, name, children: [] }
    if (!editingNode.children) editingNode.children = []
    editingNode.children.push(newNode)
  } else {
    editingNode.name = name
  }
  dialogVisible.value = false
}

function handleDelete(row) {
  if (row.id === 0) return   // 厂区不可删除
  ElMessageBox.confirm(`确定删除【${row.name}】及其所有子级？`, '提示', { type: 'warning' })
      .then(() => {
        removeNode(treeData.value, row)
        ElMessage.success('已删除')
      })
}
</script>

<style scoped>
.area-manage{padding:20px}
</style>
