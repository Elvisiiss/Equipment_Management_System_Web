<!-- routerManagement.vue -->
<template>
  <div class="router-management-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>侧边栏菜单管理</h2>
          <el-button type="primary" @click="handleAddMenu" icon="Plus">
            新增菜单
          </el-button>
        </div>
      </template>

      <!-- 菜单树形结构 -->
      <div class="menu-tree-container">
        <el-tree
            ref="menuTreeRef"
            :data="menuTree"
            node-key="id"
            :props="treeProps"
            :expand-on-click-node="false"
            default-expand-all
            draggable
            @node-drop="handleNodeDrop"
            @node-click="handleNodeClick"
            v-loading="treeLoading"
        >
          <template #default="{ node, data }">
            <div class="tree-node-content">
              <div class="node-info">
                <el-icon v-if="data.metaIcon" class="node-icon">
                  <component :is="data.metaIcon" />
                </el-icon>
                <span class="node-label">{{ data.metaTitle || data.name }}</span>
                <el-tag v-if="data.path" size="small" type="info">
                  {{ data.path }}
                </el-tag>
              </div>
              <div class="node-operations">
                <el-button
                    size="small"
                    type="primary"
                    link
                    @click.stop="handleAddChildMenu(data)"
                    icon="Plus"
                >
                  添加子菜单
                </el-button>
                <el-button
                    size="small"
                    type="primary"
                    link
                    @click.stop="handleEditMenu(data)"
                    icon="Edit"
                >
                  编辑
                </el-button>
                <el-button
                    size="small"
                    type="danger"
                    link
                    @click.stop="handleDeleteMenu(data)"
                    icon="Delete"
                >
                  删除
                </el-button>
              </div>
            </div>
          </template>
        </el-tree>
      </div>

      <!-- 选中菜单的详细信息 -->
      <div v-if="selectedMenu" class="menu-detail">
        <el-divider content-position="left">菜单详情</el-divider>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="菜单ID">
            {{ selectedMenu.id }}
          </el-descriptions-item>
          <el-descriptions-item label="菜单名称">
            {{ selectedMenu.name }}
          </el-descriptions-item>
          <el-descriptions-item label="显示标题">
            {{ selectedMenu.metaTitle }}
          </el-descriptions-item>
          <el-descriptions-item label="路由路径">
            {{ selectedMenu.path || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="文件路径">
            {{ selectedMenu.filePath || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="图标">
            <el-icon v-if="selectedMenu.metaIcon">
              <component :is="selectedMenu.metaIcon" />
            </el-icon>
            <span v-else>无</span>
          </el-descriptions-item>
          <el-descriptions-item label="排序顺序">
            {{ selectedMenu.sortOrder }}
          </el-descriptions-item>
          <el-descriptions-item label="父菜单ID">
            {{ selectedMenu.parentId || '根菜单' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>

    <!-- 新增/编辑菜单对话框 -->
    <el-dialog
        :title="isEditMode ? '编辑菜单' : '新增菜单'"
        v-model="showMenuDialog"
        width="600px"
    >
      <el-form
          :model="menuForm"
          :rules="menuRules"
          ref="menuFormRef"
          label-width="100px"
      >
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="menuForm.name" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="显示标题" prop="metaTitle">
          <el-input v-model="menuForm.metaTitle" placeholder="请输入显示标题" />
        </el-form-item>
        <el-form-item label="路由路径" prop="path">
          <el-input v-model="menuForm.path" placeholder="请输入路由路径" />
        </el-form-item>
        <el-form-item label="文件路径" prop="filePath">
          <el-input v-model="menuForm.filePath" placeholder="请输入文件路径" />
        </el-form-item>
        <el-form-item label="图标" prop="metaIcon">
          <el-select v-model="menuForm.metaIcon" placeholder="请选择图标" clearable>
            <el-option
                v-for="icon in availableIcons"
                :key="icon"
                :label="icon"
                :value="icon"
            >
              <div style="display: flex; align-items: center;">
                <el-icon style="margin-right: 8px;">
                  <component :is="icon" />
                </el-icon>
                <span>{{ icon }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="父菜单" prop="parentId">
          <el-tree-select
              v-model="menuForm.parentId"
              :data="menuTree"
              :props="treeProps"
              node-key="id"
              :render-after-expand="false"
              placeholder="请选择父菜单"
              check-strictly
              clearable
          />
        </el-form-item>
        <el-form-item label="排序顺序" prop="sortOrder">
          <el-input-number
              v-model="menuForm.sortOrder"
              :min="0"
              :max="1000"
              controls-position="right"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showMenuDialog = false">取消</el-button>
        <el-button
            type="primary"
            @click="submitMenuForm"
            :loading="formSubmitting"
        >
          确认
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Edit,
  Delete,
  HomeFilled,
  StarFilled,
  Connection,
  User
} from '@element-plus/icons-vue'
import MenuAPI from '@/api/system/menuAPI.js'

// 菜单树数据
const menuTree = ref([])
const treeLoading = ref(false)
const selectedMenu = ref(null)
const menuTreeRef = ref(null)

// 表单相关
const showMenuDialog = ref(false)
const isEditMode = ref(false)
const formSubmitting = ref(false)
const menuFormRef = ref(null)

const menuForm = ref({
  id: undefined,
  name: '',
  metaTitle: '',
  path: '',
  filePath: '',
  metaIcon: '',
  parentId: null,
  sortOrder: 0
})

const menuRules = {
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  metaTitle: [{ required: true, message: '请输入显示标题', trigger: 'blur' }],
  path: [{ required: true, message: '请输入路由路径', trigger: 'blur' }]
}

// 可用图标列表
const availableIcons = ref(['HomeFilled', 'StarFilled', 'Connection', 'User'])

// 树形配置
const treeProps = {
  children: 'children',
  label: 'metaTitle'
}

// 初始化数据
onMounted(() => {
  fetchMenuTree()
})

// 获取菜单树
const fetchMenuTree = async () => {
  treeLoading.value = true
  try {
    const response = await MenuAPI.getMenuTree()
    menuTree.value = response.data.data || []
  } catch (error) {
    ElMessage.error('获取菜单树失败')
    console.error(error)
  } finally {
    treeLoading.value = false
  }
}

// 处理节点点击
const handleNodeClick = (data) => {
  selectedMenu.value = data
}

// 处理节点拖拽
const handleNodeDrop = async (draggingNode, dropNode, dropType) => {
  try {
    const draggingData = draggingNode.data
    const dropData = dropNode.data

    let newParentId = null
    let newSortOrder = 0

    if (dropType === 'inner') {
      // 拖拽到节点内
      newParentId = dropData.id
      newSortOrder = dropData.children ? dropData.children.length : 0
    } else {
      // 拖拽到节点前或后
      newParentId = dropData.parentId
      const parentNode = dropNode.parent
      const children = parentNode ? parentNode.childNodes : menuTreeRef.value.store.root.childNodes

      // 计算新的排序顺序
      const index = children.findIndex(child => child.data.id === draggingData.id)
      newSortOrder = Math.max(0, index)
    }

    // 更新菜单顺序
    await MenuAPI.updateMenuOrder(draggingData.id, {
      parentId: newParentId,
      sortOrder: newSortOrder
    })

    // 重新加载菜单树
    await fetchMenuTree()
    ElMessage.success('菜单顺序更新成功')
  } catch (error) {
    ElMessage.error('更新菜单顺序失败')
    console.error(error)
    // 拖拽失败，重新加载数据恢复原状
    fetchMenuTree()
  }
}

// 新增菜单
const handleAddMenu = () => {
  isEditMode.value = false
  menuForm.value = {
    id: undefined,
    name: '',
    metaTitle: '',
    path: '',
    filePath: '',
    metaIcon: '',
    parentId: null,
    sortOrder: 0
  }
  showMenuDialog.value = true
}

// 添加子菜单
const handleAddChildMenu = (parentMenu) => {
  isEditMode.value = false
  menuForm.value = {
    id: undefined,
    name: '',
    metaTitle: '',
    path: '',
    filePath: '',
    metaIcon: '',
    parentId: parentMenu.id,
    sortOrder: parentMenu.children ? parentMenu.children.length : 0
  }
  showMenuDialog.value = true
}

// 编辑菜单
const handleEditMenu = (menu) => {
  isEditMode.value = true
  menuForm.value = {
    id: menu.id,
    name: menu.name,
    metaTitle: menu.metaTitle,
    path: menu.path,
    filePath: menu.filePath,
    metaIcon: menu.metaIcon,
    parentId: menu.parentId,
    sortOrder: menu.sortOrder
  }
  showMenuDialog.value = true
}

// 删除菜单
const handleDeleteMenu = async (menu) => {
  try {
    await ElMessageBox.confirm(
        `确定要删除菜单 "${menu.metaTitle}" 吗？此操作不可恢复。`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    await MenuAPI.deleteMenu(menu.id)
    ElMessage.success('菜单删除成功')

    // 重新加载菜单树
    await fetchMenuTree()

    // 如果删除的是当前选中的菜单，清空选中状态
    if (selectedMenu.value && selectedMenu.value.id === menu.id) {
      selectedMenu.value = null
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除菜单失败')
      console.error(error)
    }
  }
}

// 提交菜单表单
const submitMenuForm = async () => {
  try {
    await menuFormRef.value.validate()
    formSubmitting.value = true

    if (isEditMode.value) {
      // 编辑菜单
      await MenuAPI.updateMenu(menuForm.value.id, menuForm.value)
      ElMessage.success('菜单更新成功')
    } else {
      // 新增菜单
      await MenuAPI.createMenu(menuForm.value)
      ElMessage.success('菜单创建成功')
    }

    showMenuDialog.value = false
    await fetchMenuTree()
  } catch (error) {
    console.error('操作失败', error)
    ElMessage.error(isEditMode.value ? '更新菜单失败' : '创建菜单失败')
  } finally {
    formSubmitting.value = false
  }
}
</script>

<style scoped>
.router-management-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-tree-container {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
  background-color: #fff;
  min-height: 400px;
}

.tree-node-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 4px 0;
}

.node-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.node-icon {
  color: #409eff;
}

.node-label {
  font-weight: 500;
}

.node-operations {
  visibility: hidden;
}

:deep(.el-tree-node__content:hover) .node-operations {
  visibility: visible;
}

.menu-detail {
  margin-top: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

:deep(.el-tree-node__content) {
  height: 40px;
  margin: 2px 0;
}

:deep(.el-tree-node.is-drop-inner) > .el-tree-node__content {
  background-color: #f0f9ff;
  border: 1px dashed #409eff;
}
</style>
