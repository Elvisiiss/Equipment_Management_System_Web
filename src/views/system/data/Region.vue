<template>
  <div class="area-manage">
    <!-- 工具栏 -->
    <div style="margin-bottom:12px">
      <el-button
          type="primary"
          @click="openAdd"
          :disabled="isSegmentSelected"
      >
        新增区域
      </el-button>
      <span style="margin-left:12px;color:#666;font-size:13px">
        提示：先在表格中选中一行，再点“新增区域”即可在该节点下添加子级；厂区只能改名，不能删除或再建厂区。
      </span>
    </div>

    <!-- 分页控件 -->
    <div style="margin-bottom:12px">
      <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20]"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          layout="total, sizes, prev, pager, next, jumper"
      />
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
        v-loading="loading"
    >
      <el-table-column prop="areaName" label="区域名称" />
      <el-table-column prop="areaCode" label="区域编码" width="150" />
      <el-table-column prop="areaType" label="区域类型" width="120">
        <template #default="{ row }">
          <span v-if="row.areaType === 'WORKSHOP'">车间</span>
          <span v-if="row.areaType === 'LINE'">产线</span>
          <span v-if="row.areaType === 'SECTION'">段</span>
        </template>
      </el-table-column>
      <el-table-column prop="id"   label="区域ID" width="120" />
      <el-table-column prop="parentId" label="父级ID" width="120" />
      <el-table-column label="操作" width="220" align="center">
        <template #default="{row}">
          <!-- 厂区只能编辑（根据实际根节点ID调整） -->
          <template v-if="isRootNode(row)">
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
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500">
      <el-form :model="form" :rules="rules" ref="formRef">
        <el-form-item label="区域名称" prop="areaName">
          <el-input v-model="form.areaName" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="区域编码" prop="areaCode">
          <el-input v-model="form.areaCode" placeholder="请输入编码" />
        </el-form-item>
        <el-form-item label="区域类型" prop="areaType" v-if="dialogType === 'edit'">
          <el-input
              v-model="formAreaTypeText"
              disabled
              placeholder="区域类型"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" type="textarea" rows="3" />
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
import { ref, computed, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import regionAPI from '@/api/system/region.js'

/* ---------- 响应式变量 ---------- */
const tableRef = ref(null)
const formRef = ref(null)
const selectedRow = ref(null)   // 当前选中行
const dialogVisible = ref(false)
const dialogType = ref('add')   // add / edit
const form = ref({
  areaName: '',
  id: null,
  parentId: null,
  areaCode: '',
  areaType: null,  // 仍然保留，用于API提交
  remark: ''
})
const treeData = ref([])
const loading = ref(false)
const editingNode = ref(null)

// 分页相关
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 表单验证规则（移除区域类型验证）
const rules = reactive({
  areaName: [
    { required: true, message: '请输入区域名称', trigger: 'blur' },
    { max: 50, message: '名称长度不能超过50个字符', trigger: 'blur' }
  ],
  areaCode: [
    { required: true, message: '请输入区域编码', trigger: 'blur' },
    { max: 50, message: '编码长度不能超过50个字符', trigger: 'blur' }
  ],
  remark: [
    { max: 200, message: '备注长度不能超过200个字符', trigger: 'blur' }
  ]
})

/* ---------- 计算属性 ---------- */
const dialogTitle = computed(() => dialogType.value === 'add' ? '新增区域' : '编辑区域')

// 判断是否为根节点（parentId为null的节点）
const isRootNode = (row) => {
  return row.parentId === null
}

// 判断当前选中的是否是段（不能添加子区域）
const isSegmentSelected = computed(() => {
  return selectedRow.value && selectedRow.value.areaType === 3
})

// 编辑时显示区域类型文本
const formAreaTypeText = computed(() => {
  switch(form.value.areaType) {
    case 0: return '车间'
    case 1: return '产线'
    case 2: return '段'
    default: return ''
  }
})

/* ---------- 数据加载 ---------- */
// 加载树形数据
const loadTreeData = async () => {
  try {
    loading.value = true
    const res = await regionAPI.getSubTree()
    if (res.data.code === 'success') {
      // 转换子节点字段：subNodes -> children（适配element树形表格）
      const transformData = (nodes) => {
        return nodes.map(node => {
          return {
            ...node,
            children: node.subNodes ? transformData(node.subNodes) : []
          }
        })
      }
      treeData.value = transformData(res.data.data)
    } else {
      ElMessage.error(res.data.msg || '加载区域数据失败')
    }
  } catch (error) {
    console.error('加载区域数据错误:', error)
    ElMessage.error('网络错误，加载区域数据失败')
  } finally {
    loading.value = false
  }
}

// 加载分页数据
const loadPageData = async () => {
  try {
    const res = await regionAPI.page(pageNum.value, pageSize.value)
    if (res.data.code === 'success') {
      total.value = res.data.data.total
    } else {
      ElMessage.error(res.data.msg || '加载分页数据失败')
    }
  } catch (error) {
    console.error('加载分页数据错误:', error)
    ElMessage.error('加载分页数据失败')
  }
}

/* ---------- 分页事件 ---------- */
const handleSizeChange = (val) => {
  pageSize.value = val
  loadPageData()
}

const handleCurrentChange = (val) => {
  pageNum.value = val
  loadPageData()
}

/* ---------- 工具函数 ---------- */
// 递归查找节点
const findNode = (arr, id) => {
  for (const node of arr) {
    if (node.id === id) return node
    if (node.children && node.children.length) {
      const found = findNode(node.children, id)
      if (found) return found
    }
  }
  return null
}

// 递归删除节点
const removeNode = (arr, id) => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].id === id) {
      arr.splice(i, 1)
      return true
    }
    if (arr[i].children && removeNode(arr[i].children, id)) {
      return true
    }
  }
  return false
}

/* ---------- 事件处理 ---------- */
const openAdd = () => {
  // 检查是否选中了段
  if (isSegmentSelected.value) {
    ElMessage.error('段不能包含子区域')
    return
  }

  if (!selectedRow.value) {
    // 未选中行，默认添加到根节点下
    editingNode.value = treeData.value[0]
    if (!editingNode.value) {
      ElMessage.warning('未找到根节点')
      return
    }
  } else {
    const row = selectedRow.value
    if (isRootNode(row)) {
      // 选中根节点，添加子节点（车间）
      editingNode.value = row
    } else if (!row.children) {
      // 无children属性的节点不能添加子级
      ElMessage.warning('该节点下不能新增子区域')
      return
    } else {
      // 其他节点
      editingNode.value = row
    }
  }

  // 根据父节点类型自动设置子节点类型
  let childAreaType = null
  if (isRootNode(editingNode.value)) {
    // 根节点下只能是车间（1）
    childAreaType = 1
  } else if (editingNode.value.areaType === 1) {
    // 车间下只能是产线（2）
    childAreaType = 2
  } else if (editingNode.value.areaType === 2) {
    // 产线下只能是段（3）
    childAreaType = 3
  } else if (editingNode.value.areaType === 3) {
    // 段下不能有子节点
    ElMessage.error('段不能包含子区域')
    return
  }

  dialogType.value = 'add'
  form.value = {
    areaName: '',
    parentId: editingNode.value.id,
    id: null,
    areaCode: '',
    areaType: childAreaType,  // 自动设置类型
    remark: ''
  }
  dialogVisible.value = true
}

const openEdit = (row) => {
  dialogType.value = 'edit'
  form.value = {
    areaName: row.areaName,
    id: row.id,
    parentId: row.parentId,
    areaCode: row.areaCode,
    areaType: row.areaType,  // 保留原有类型，不允许修改
    remark: row.remark || ''
  }
  editingNode.value = row
  dialogVisible.value = true
}

const handleSave = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch (error) {
    return ElMessage.warning('请完善表单信息')
  }

  const submitData = {
    areaName: form.value.areaName.trim(),
    areaCode: form.value.areaCode.trim(),
    areaType: form.value.areaType,  // 使用自动设置的类型
    remark: form.value.remark.trim()
  }

  try {
    loading.value = true
    if (dialogType.value === 'add') {
      // 新增操作
      const res = await regionAPI.add({
        ...submitData,
        parentId: form.value.parentId
      })
      if (res.data.code === 'success') {
        // 刷新树形数据
        await loadTreeData()
        ElMessage.success('区域新增成功')
        dialogVisible.value = false
      } else {
        ElMessage.error(res.data.msg || '新增失败')
      }
    } else {
      // 编辑操作 - 不允许修改区域类型
      const res = await regionAPI.update({
        ...submitData,
        id: form.value.id
      })
      if (res.data.code === 'success') {
        // 更新本地节点数据
        Object.assign(editingNode.value, {
          areaName: submitData.areaName,
          areaCode: submitData.areaCode,
          // 不更新areaType，保持原有类型
          remark: submitData.remark
        })
        ElMessage.success('区域更新成功')
        dialogVisible.value = false
      } else {
        ElMessage.error(res.data.msg || '更新失败')
      }
    }
  } catch (error) {
    console.error('保存区域错误:', error)
    ElMessage.error('网络错误，操作失败')
  } finally {
    loading.value = false
  }
}

const handleDelete = async (row) => {
  if (isRootNode(row)) return // 根节点不可删除

  try {
    await ElMessageBox.confirm(
        `确定删除【${row.areaName}】及其所有子级？`,
        '提示',
        {type: 'warning'}
    )

    loading.value = true
    const res = await regionAPI.delete(row.id)
    if (res.data.code === 'success') {
      // 从本地树中移除节点
      removeNode(treeData.value, row.id)
      // 更新分页总数
      await loadPageData()
      ElMessage.success('删除成功')
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除区域错误:', error)
      ElMessage.error('网络错误，删除失败')
    }
  } finally {
    loading.value = false
  }
}

/* ---------- 初始化 ---------- */
onMounted(() => {
  loadTreeData()
  loadPageData()
})
</script>

<style scoped>
.area-manage {
  padding: 20px
}
</style>
