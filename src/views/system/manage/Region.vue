<template>
  <div class="area-manage">
    <!-- 工具栏 -->
    <div style="margin-bottom:12px">
      <el-button type="primary" @click="openAdd">新增区域</el-button>
      <span style="margin-left:12px;color:#666;font-size:13px">
        提示：先在表格点选一行，再点“新增区域”即可在该节点下添加子级；<br/>
        不选则新增顶层车间。
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
      <el-table-column label="操作" width="200" align="center">
        <template #default="{row}">
          <el-button size="small" @click="openEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogType==='add'?'新增区域':'编辑区域'" width="360">
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
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

/* ---------- 一次性生成固定结构 ---------- */
let id = 1
const treeData = ref([])

// 车间列表
const workshops = ['C2', 'C3', 'C4', 'C5', 'C6']
const segments  = ['CFOG段', '贴合段', '组装段', '30米线段']

workshops.forEach(ws => {
  const workshopNode = { id: id++, name: `${ws}车间`, children: [] }
  treeData.value.push(workshopNode)

  // 每条车间 6 条产线
  for (let l = 1; l <= 6; l++) {
    const lineNo   = Number(ws.substring(1)) * 10 + l   // C2→31~36, C3→41~46 …
    const lineNode = { id: id++, name: `${lineNo}产线`, children: [] }
    workshopNode.children.push(lineNode)

    // 每条产线 4 个工段
    segments.forEach(seg => {
      lineNode.children.push({ id: id++, name: seg })
    })
  }
})

/* ---------- 响应式变量 ---------- */
const tableRef    = ref(null)
const selectedRow = ref(null)   // 当前选中节点
const dialogVisible = ref(false)
const dialogType    = ref('add')
const form = ref({ name: '' })
let editingNode = null

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
  dialogType.value = 'add'
  form.value = { name: '' }
  editingNode = null
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
  if (!name) { ElMessage.warning('请输入区域名称'); return }

  if (dialogType.value === 'add') {
    const newNode = { id: id++, name, children: [] }
    if (selectedRow.value) {
      // 有选中行：挂到该节点下
      if (!selectedRow.value.children) selectedRow.value.children = []
      selectedRow.value.children.push(newNode)
    } else {
      // 没选中：新增顶层车间
      treeData.value.push(newNode)
    }
  } else {
    editingNode.name = name
  }
  dialogVisible.value = false
}

function handleDelete(row) {
  ElMessageBox.confirm(`确定删除【${row.name}】及其所有子级？`, '提示', { type: 'warning' })
      .then(() => {
        removeNode(treeData.value, row)
        ElMessage.success('删除成功')
      })
}
</script>

<style scoped>
.area-manage{padding:20px}
</style>
