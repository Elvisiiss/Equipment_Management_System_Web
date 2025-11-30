<template>
  <div class="content-wrapper">
    <div class="content-header">
      <h2>角色管理</h2>
      <el-button type="primary" @click="showAddRoleDialog = true">
        <el-icon><Plus /></el-icon>
        新增角色
      </el-button>
    </div>

    <div class="search-bar">
      <el-input
          v-model="roleSearchQuery"
          placeholder="搜索角色"
          prefix-icon="Search"
          class="search-input"
      ></el-input>
    </div>

    <el-table
        :data="paginatedRoles"
        border
        style="width: 100%; margin-top: 16px;"
        v-loading="loadingRoles"
    >
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="roleName" label="角色名称"></el-table-column>
      <el-table-column prop="description" label="描述"></el-table-column>
      <el-table-column label="操作" width="300">
        <template #default="scope">
          <el-button
              size="small"
              @click="handleEditRole(scope.row)"
          >
            编辑
          </el-button>
          <el-button
              size="small"
              type="primary"
              @click="handleAssignMenus(scope.row)"
          >
            分配菜单
          </el-button>
          <el-button
              size="small"
              type="danger"
              @click="handleDeleteRole(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
        @size-change="handleRoleSizeChange"
        @current-change="handleRoleCurrentChange"
        :current-page="roleCurrentPage"
        :page-sizes="[10, 20, 50]"
        :page-size="rolePageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="filteredRoles.length"
        class="pagination"
    ></el-pagination>

    <!-- 新增/编辑角色对话框 -->
    <el-dialog
        :title="formRole.id ? '编辑角色' : '新增角色'"
        v-model="showAddRoleDialog"
        width="500px"
    >
      <el-form
          :model="formRole"
          :rules="roleRules"
          ref="roleFormRef"
          label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="formRole.roleName"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
              v-model="formRole.description"
              type="textarea"
              :rows="3"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddRoleDialog = false">取消</el-button>
        <el-button
            type="primary"
            @click="submitRoleForm"
        >
          确认
        </el-button>
      </template>
    </el-dialog>

    <!-- 分配菜单对话框 -->
    <el-dialog
        title="分配菜单"
        v-model="showAssignMenusDialog"
        width="600px"
    >
      <div class="menu-assign-wrapper">
        <div class="menu-tree-section">
          <h4>菜单树</h4>
          <div class="custom-tree">
            <div
                v-for="menu in menuTree"
                :key="menu.id"
                class="tree-node"
            >
              <custom-tree-node
                  :node="menu"
                  :level="0"
                  :checked-keys="selectedMenuIds"
                  @check-change="handleCheckChange"
              ></custom-tree-node>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showAssignMenusDialog = false">取消</el-button>
        <el-button
            type="primary"
            @click="submitMenuAssignment"
            :loading="assigningMenus"
        >
          确认分配
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import RoleMenuAPI from '@/api/RoleMenu.js';

// 角色数据
const roles = ref([]);
const loadingRoles = ref(false);

// 菜单数据
const menuTree = ref([]);

// 角色管理相关状态
const roleSearchQuery = ref('');
const roleCurrentPage = ref(1);
const rolePageSize = ref(10);
const showAddRoleDialog = ref(false);
const formRole = ref({
  id: undefined,
  roleName: '',
  description: ''
});
const roleRules = ref({
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '角色名称长度在 2 到 20 个字符', trigger: 'blur' }
  ]
});
const roleFormRef = ref(null);

// 分配菜单相关状态
const showAssignMenusDialog = ref(false);
const selectedMenuIds = ref([]);
const currentRoleId = ref(null);
const assigningMenus = ref(false);

// 自定义树节点组件
const CustomTreeNode = {
  name: 'CustomTreeNode',
  props: {
    node: Object,
    level: Number,
    checkedKeys: Array
  },
  emits: ['check-change'],
  setup(props, { emit }) {
    const isChecked = computed(() => {
      return props.checkedKeys.includes(props.node.id);
    });

    const hasChildren = computed(() => {
      return props.node.children && props.node.children.length > 0;
    });

    const handleCheckboxChange = (event) => {
      const checked = event.target.checked;
      emit('check-change', props.node.id, checked);
    };

    return () => h('div', { class: 'tree-node-wrapper' }, [
      // 节点内容
      h('div', {
        class: 'tree-node-content',
        style: { paddingLeft: `${props.level * 20 + 10}px` }
      }, [
        // 复选框
        h('input', {
          type: 'checkbox',
          checked: isChecked.value,
          onChange: handleCheckboxChange,
          class: 'tree-checkbox'
        }),

        // 节点图标和标签
        h('span', { class: 'node-label' }, [
          hasChildren.value && h('span', { class: 'node-expand-icon' }, '▶'),
          h('span', { class: 'node-text' }, props.node.metaTitle)
        ])
      ]),

      // 子节点
      hasChildren.value && h('div', { class: 'tree-children' },
          props.node.children.map(child =>
              h(CustomTreeNode, {
                node: child,
                level: props.level + 1,
                checkedKeys: props.checkedKeys,
                onCheckChange: (id, checked) => emit('check-change', id, checked)
              })
          )
      )
    ]);
  }
};

// 计算属性 - 筛选角色
const filteredRoles = computed(() => {
  return roles.value.filter(role => {
    return role.roleName.toLowerCase().includes(roleSearchQuery.value.toLowerCase()) ||
        (role.description && role.description.toLowerCase().includes(roleSearchQuery.value.toLowerCase()));
  });
});

// 分页后的角色数据
const paginatedRoles = computed(() => {
  const start = (roleCurrentPage.value - 1) * rolePageSize.value;
  const end = start + rolePageSize.value;
  return filteredRoles.value.slice(start, end);
});

// 生命周期钩子
onMounted(() => {
  fetchRoles();
  fetchMenuTree();
});

// 方法 - 获取角色列表
const fetchRoles = async () => {
  try {
    loadingRoles.value = true;
    const response = await RoleMenuAPI.getRoleList();
    roles.value = response.data.data;
  } catch (error) {
    ElMessage.error('获取角色列表失败');
    console.error(error);
  } finally {
    loadingRoles.value = false;
  }
};

// 方法 - 获取菜单树
const fetchMenuTree = async () => {
  try {
    const response = await RoleMenuAPI.getMenuTree();
    menuTree.value = response.data.data;
  } catch (error) {
    ElMessage.error('获取菜单树失败');
    console.error(error);
  }
};

// 方法 - 角色分页
const handleRoleSizeChange = (val) => {
  rolePageSize.value = val;
  roleCurrentPage.value = 1;
};

const handleRoleCurrentChange = (val) => {
  roleCurrentPage.value = val;
};

// 方法 - 编辑角色
const handleEditRole = (role) => {
  formRole.value = { ...role };
  showAddRoleDialog.value = true;
};

// 方法 - 提交角色表单
const submitRoleForm = async () => {
  try {
    await roleFormRef.value.validate();

    if (formRole.value.id) {
      // 编辑现有角色
      await RoleMenuAPI.updateRole(formRole.value.id, formRole.value);
      ElMessage.success('角色编辑成功');
    } else {
      // 创建新角色
      await RoleMenuAPI.createRole(formRole.value);
      ElMessage.success('角色创建成功');
    }

    showAddRoleDialog.value = false;
    roleFormRef.value.resetFields();
    fetchRoles();
  } catch (error) {
    console.error('表单验证失败', error);
    ElMessage.error(error.response?.data?.message || '操作失败');
  }
};

// 方法 - 查找菜单项
const findMenuItem = (menuItems, targetId) => {
  for (const item of menuItems) {
    if (item.id === targetId) {
      return item;
    }
    if (item.children && item.children.length > 0) {
      const found = findMenuItem(item.children, targetId);
      if (found) return found;
    }
  }
  return null;
};

// 方法 - 查找父节点
const findParent = (menuItems, childId) => {
  for (const menuItem of menuItems) {
    if (menuItem.children && menuItem.children.some(child => child.id === childId)) {
      return menuItem;
    }
    if (menuItem.children && menuItem.children.length > 0) {
      const parent = findParent(menuItem.children, childId);
      if (parent) return parent;
    }
  }
  return null;
};

// 方法 - 递归获取所有父节点
const getAllParents = (menuId) => {
  const parents = [];
  let currentId = menuId;

  while (true) {
    const parent = findParent(menuTree.value, currentId);
    if (parent) {
      parents.push(parent.id);
      currentId = parent.id;
    } else {
      break;
    }
  }

  return parents;
};

// 方法 - 处理复选框变化
const handleCheckChange = (menuId, checked) => {
  if (checked) {
    // 添加当前节点
    if (!selectedMenuIds.value.includes(menuId)) {
      selectedMenuIds.value.push(menuId);
    }

    // 获取并添加所有父节点
    const parentIds = getAllParents(menuId);
    parentIds.forEach(parentId => {
      if (!selectedMenuIds.value.includes(parentId)) {
        selectedMenuIds.value.push(parentId);
      }
    });
  } else {
    // 移除当前节点
    const index = selectedMenuIds.value.indexOf(menuId);
    if (index > -1) {
      selectedMenuIds.value.splice(index, 1);
    }

    // 查找当前节点
    const menuItem = findMenuItem(menuTree.value, menuId);

    // 如果取消的是父节点，则取消所有子节点
    if (menuItem && menuItem.children && menuItem.children.length > 0) {
      const removeChildrenIds = (node) => {
        if (node.children && node.children.length > 0) {
          node.children.forEach(child => {
            const childIndex = selectedMenuIds.value.indexOf(child.id);
            if (childIndex > -1) {
              selectedMenuIds.value.splice(childIndex, 1);
            }
            removeChildrenIds(child);
          });
        }
      };
      removeChildrenIds(menuItem);
    }

    // 检查父节点是否还有被选中的子节点，如果没有则取消父节点
    const checkAndRemoveParent = (childId) => {
      const parent = findParent(menuTree.value, childId);
      if (parent) {
        // 检查父节点是否还有其他被选中的子节点
        const hasSelectedChild = parent.children.some(child =>
            selectedMenuIds.value.includes(child.id)
        );

        // 如果没有被选中的子节点，则取消父节点
        if (!hasSelectedChild) {
          const parentIndex = selectedMenuIds.value.indexOf(parent.id);
          if (parentIndex > -1) {
            selectedMenuIds.value.splice(parentIndex, 1);
            // 递归检查父节点的父节点
            checkAndRemoveParent(parent.id);
          }
        }
      }
    };

    checkAndRemoveParent(menuId);
  }
};

// 方法 - 分配菜单
const handleAssignMenus = (role) => {
  currentRoleId.value = role.id;
  selectedMenuIds.value = role.menuIds || [];
  showAssignMenusDialog.value = true;
};

// 方法 - 提交菜单分配
const submitMenuAssignment = async () => {
  try {
    assigningMenus.value = true;

    await RoleMenuAPI.assignMenusToRole(currentRoleId.value, selectedMenuIds.value);
    ElMessage.success('菜单分配成功');
    showAssignMenusDialog.value = false;
    fetchRoles(); // 刷新角色列表以更新菜单显示
  } catch (error) {
    console.error('菜单分配失败', error);
    ElMessage.error(error.response?.data?.message || '菜单分配失败');
  } finally {
    assigningMenus.value = false;
  }
};

// 方法 - 删除角色
const handleDeleteRole = async (roleId) => {
  try {
    await ElMessageBox.confirm('确定要删除该角色吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await RoleMenuAPI.deleteRole(roleId);
    ElMessage.success('角色删除成功');
    fetchRoles();
  } catch (error) {
    if (error === 'cancel') return;
    ElMessage.error('角色删除失败');
    console.error(error);
  }
};
</script>

<style scoped>
.content-wrapper {
  padding: 20px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.search-input {
  width: 300px;
}

.pagination {
  margin-top: 16px;
  text-align: right;
}

.menu-assign-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.menu-tree-section {
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  padding: 20px;
  background-color: #f8fafc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.menu-tree-section h4 {
  margin: 0 0 18px 0;
  color: #1e293b;
  font-size: 18px;
  font-weight: 600;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.custom-tree {
  max-height: 400px;
  overflow-y: auto;
  padding: 12px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) inset;
}

/* 自定义树样式 */
.tree-node-wrapper {
  font-size: 15px;
  line-height: 1.5;
  margin-bottom: 2px;
}

.tree-node-content {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 6px;
  border: 1px solid transparent;
}

.tree-node-content:hover {
  background-color: #f1f5f9;
  border-color: #e2e8f0;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.tree-checkbox {
  margin-right: 12px;
  width: 18px;
  height: 18px;
  cursor: pointer;
  border-radius: 4px;
  border: 2px solid #cbd5e1;
  appearance: none;
  position: relative;
  transition: all 0.2s ease;
}

.tree-checkbox:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.tree-checkbox:checked::after {
  content: "✓";
  position: absolute;
  color: white;
  font-size: 12px;
  font-weight: bold;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.node-label {
  display: flex;
  align-items: center;
  flex-grow: 1;
}

.node-expand-icon {
  margin-right: 8px;
  font-size: 12px;
  color: #64748b;
  transition: transform 0.2s;
  width: 16px;
  text-align: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.node-expand-icon.expanded {
  transform: rotate(90deg);
}

.node-text {
  color: #334155;
  font-weight: 500;
  transition: color 0.2s;
  letter-spacing: 0.2px;
}

.tree-node-content:hover .node-text {
  color: #1e40af;
}

.tree-children {
  margin-left: 20px;
  border-left: 2px solid #e2e8f0;
  padding-left: 16px;
  margin-top: 6px;
  margin-bottom: 4px;
}

/* 层级指示器 */
.tree-node-content::before {
  content: "";
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #94a3b8;
  margin-right: 10px;
  flex-shrink: 0;
}

/* 滚动条样式 */
.custom-tree::-webkit-scrollbar {
  width: 8px;
}

.custom-tree::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.custom-tree::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.custom-tree::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 选中状态 */
.tree-node-content.selected {
  background-color: #eff6ff;
  border-color: #3b82f6;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.1);
}

.tree-node-content.selected .node-text {
  color: #1e40af;
  font-weight: 600;
}

.tree-node-content.selected::before {
  background-color: #3b82f6;
}

/* 层级深度指示 */
.tree-node-content.level-0 {
  background: linear-gradient(90deg, #f8fafc, transparent);
}

.tree-node-content.level-1 {
  background: linear-gradient(90deg, #f1f5f9, transparent);
}

.tree-node-content.level-2 {
  background: linear-gradient(90deg, #e2e8f0, transparent);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .menu-tree-section {
    padding: 16px;
  }

  .tree-node-content {
    padding: 8px 10px;
  }

  .tree-children {
    margin-left: 16px;
    padding-left: 12px;
  }
}
</style>
