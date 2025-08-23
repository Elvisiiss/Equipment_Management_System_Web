<template>
  <el-container class="app-container">
    <el-container>
      <!-- 左侧部门树形结构 -->
      <el-aside width="260px" class="app-aside">
        <div class="department-header">
          <h3>部门管理</h3>
          <el-button
              type="primary"
              size="small"
              @click="handleAddDepartment"
              icon="Plus"
          >
            新增部门
          </el-button>
        </div>

        <el-tree
            :data="departmentTree"
            :props="defaultProps"
            node-key="id"
            default-expand-all
            @node-click="handleDepartmentClick"
            class="department-tree"
            v-loading="treeLoading"
        >
          <template #default="{ node, data }">
            <div class="tree-node-content">
              <span>{{ node.label }}</span>
              <div class="tree-node-operations">
                <el-icon
                    size="16"
                    class="operation-icon"
                    @click.stop="handleEditDepartment(data)"
                >
                  <Edit />
                </el-icon>
                <el-icon
                    size="16"
                    class="operation-icon"
                    @click.stop="handleAddSubDepartment(data)"
                >
                  <Plus />
                </el-icon>
                <el-icon
                    size="16"
                    class="operation-icon"
                    @click.stop="handleDeleteDepartment(data)"
                >
                  <Delete />
                </el-icon>
              </div>
            </div>
          </template>
        </el-tree>
      </el-aside>

      <!-- 右侧部门人员管理 -->
      <el-main class="app-main">
        <div v-if="selectedDepartment" class="content-wrapper">
          <div class="content-header">
            <h2>
              {{ getDepartmentPath(selectedDepartment) }}
            </h2>
          </div>

          <div class="department-info-card">
            <el-card>
              <div class="card-header">部门信息</div>
              <div class="department-info">
                <div class="info-item">
                  <span class="info-label">部门名称：</span>
                  <span>{{ selectedDepartment.name }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">部门描述：</span>
                  <span>{{ selectedDepartment.description || '无' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">状态：</span>
                  <el-tag :type="selectedDepartment.status === 0 ? 'success' : 'danger'">
                    {{ selectedDepartment.status === 0 ? '正常' : '停用' }}
                  </el-tag>
                </div>
                <div class="info-item">
                  <span class="info-label">成员数量：</span>
                  <span>{{ departmentUsers.length }}</span>
                </div>
              </div>
            </el-card>
          </div>

          <div class="user-management-section">
            <div class="section-header">
              <h3>部门成员</h3>
              <el-button
                  type="primary"
                  size="small"
                  @click="showUserSelectionDialog = true"
                  icon="Plus"
              >
                添加成员
              </el-button>
            </div>

            <el-input
                v-model="userSearchQuery"
                placeholder="搜索成员"
                prefix-icon="Search"
                class="search-input"
            ></el-input>

            <el-table
                :data="paginatedUsers"
                border
                style="width: 100%; margin-top: 16px;"
                v-loading="usersLoading"
            >
              <el-table-column prop="id" label="ID" width="80"></el-table-column>
              <el-table-column prop="userName" label="账户"></el-table-column>
              <el-table-column prop="realName" label="姓名"></el-table-column>
              <el-table-column prop="phoneNumber" label="手机号"></el-table-column>
              <el-table-column prop="email" label="邮箱"></el-table-column>
              <el-table-column label="角色">
                <template #default="scope">
                  <el-tag
                      v-for="role in scope.row.roles"
                      :key="role.id"
                      :type="getRoleType(role.id)"
                      style="margin-right: 5px;"
                  >
                    {{ role.roleName }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100">
                <template #default="scope">
                  <el-button
                      size="small"
                      type="danger"
                      @click="handleRemoveUser(scope.row.id)"
                  >
                    移除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <el-pagination
                @size-change="handleUserSizeChange"
                @current-change="handleUserCurrentChange"
                :current-page="userCurrentPage"
                :page-sizes="[10, 20, 50]"
                :page-size="userPageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="filteredUsers.length"
                class="pagination"
            ></el-pagination>
          </div>
        </div>

        <div v-else class="empty-state">
          <el-empty description="请选择一个部门"></el-empty>
        </div>
      </el-main>
    </el-container>

    <!-- 新增/编辑部门对话框 -->
    <el-dialog
        :title="isEditDepartment ? '编辑部门' : '新增部门'"
        v-model="showDepartmentDialog"
        width="500px"
    >
      <el-form
          :model="formDepartment"
          :rules="departmentRules"
          ref="departmentFormRef"
          label-width="100px"
      >
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="formDepartment.name"></el-input>
        </el-form-item>
        <el-form-item label="上级部门" prop="parentId">
          <el-select
              v-model="formDepartment.parentId"
              placeholder="请选择上级部门"
          >
            <el-option
                v-for="dept in allDepartments"
                :key="dept.id"
                :label="dept.name"
                :value="dept.id"
                :disabled="isEditDepartment && formDepartment.id === dept.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="部门描述" prop="description">
          <el-input
              v-model="formDepartment.description"
              type="textarea"
              :rows="3"
          ></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formDepartment.status">
            <el-radio :label="0">正常</el-radio>
            <el-radio :label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDepartmentDialog = false">取消</el-button>
        <el-button
            type="primary"
            @click="submitDepartmentForm"
            :loading="formSubmitting"
        >
          确认
        </el-button>
      </template>
    </el-dialog>

    <!-- 选择用户对话框 -->
    <el-dialog
        title="添加部门成员"
        v-model="showUserSelectionDialog"
        width="700px"
    >
      <el-input
          v-model="selectionSearchQuery"
          placeholder="搜索用户"
          prefix-icon="Search"
          class="search-input"
      ></el-input>

      <el-table
          :data="selectableUsers"
          border
          style="width: 100%; margin-top: 16px;"
          :row-key="row => row.id"
          @selection-change="handleUserSelectionChange"
          v-loading="selectionLoading"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="userName" label="账户"></el-table-column>
        <el-table-column prop="realName" label="姓名"></el-table-column>
        <el-table-column prop="phoneNumber" label="手机号"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column label="当前部门">
          <template #default="scope">
            <span>{{ getDepartmentNames(scope.row.departments) }}</span>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
          @size-change="handleSelectionSizeChange"
          @current-change="handleSelectionCurrentChange"
          :current-page="selectionCurrentPage"
          :page-sizes="[10, 20, 50]"
          :page-size="selectionPageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="selectableUsers.length"
          class="pagination"
      ></el-pagination>

      <template #footer>
        <el-button @click="showUserSelectionDialog = false">取消</el-button>
        <el-button
            type="primary"
            @click="confirmUserSelection"
            :loading="selectionSubmitting"
        >
          确认添加
        </el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue';
import {Edit, Plus, Delete} from '@element-plus/icons-vue';
import {ElMessage, ElMessageBox, ElEmpty} from 'element-plus';
import AuthAPI from '@/api/AuthAPI.js';
import DepAPI from '@/api/system/depAPI.js'; // 引入新的部门API

// 部门树形结构数据
const departmentTree = ref([]);
const allDepartments = ref([]);
const selectedDepartment = ref(null);
const treeLoading = ref(false);

// 用户数据
const users = ref([]);
const userSearchQuery = ref('');
const userCurrentPage = ref(1);
const userPageSize = ref(10);
const usersLoading = ref(false);

// 用户选择对话框相关
const showUserSelectionDialog = ref(false);
const selectionSearchQuery = ref('');
const selectionCurrentPage = ref(1);
const selectionPageSize = ref(10);
const selectedUsers = ref([]);
const selectionLoading = ref(false);
const selectionSubmitting = ref(false);

// 部门表单相关
const showDepartmentDialog = ref(false);
const isEditDepartment = ref(false);
const formSubmitting = ref(false);
const formDepartment = ref({
  id: undefined,
  name: '',
  parentId: null,
  description: '',
  status: 0
});
const departmentRules = ref({
  name: [{required: true, message: '请输入部门名称', trigger: 'blur'}],
  description: [{required: false}],
  parentId: [{required: false}],
  status: [{required: true, message: '请选择状态', trigger: 'change'}]
});
const departmentFormRef = ref(null);

// 树形结构配置
const defaultProps = ref({
  children: 'children',
  label: 'name'
});

// 初始化数据
onMounted(() => {
  fetchUsers();
  fetchDepartmentTree();
});

// 获取部门树
const fetchDepartmentTree = async () => {
  treeLoading.value = true;
  try {
    const response = await DepAPI.getDepartmentTree();
    // 处理API返回的数据结构
    let treeData = response.data.data.children || [];

    // 为树形数据添加parentId信息
    const addParentIds = (nodes, parentId = null) => {
      nodes.forEach(node => {
        node.parentId = parentId;
        if (node.children && node.children.length) {
          addParentIds(node.children, node.id);
        }
      });
    };
    addParentIds(treeData);

    departmentTree.value = treeData;
    allDepartments.value = flattenDepartments(departmentTree.value);

    // 默认选中第一个部门
    if (departmentTree.value.length > 0) {
      handleDepartmentClick(departmentTree.value[0]);
    }
  } catch (error) {
    ElMessage.error('获取部门树失败');
    console.error(error);
  } finally {
    treeLoading.value = false;
  }
};

// 获取用户列表
const fetchUsers = async () => {
  try {
    const response = await AuthAPI.getUserList();
    users.value = response.data.data;
  } catch (error) {
    ElMessage.error('获取用户列表失败');
    console.error(error);
  }
};

// 获取部门下的用户
const fetchDepartmentUsers = async (departmentId) => {
  if (!departmentId) return;

  usersLoading.value = true;
  try {
    const response = await DepAPI.getDepartmentUsers(departmentId);
    // 更新当前选中部门的用户信息
    if (selectedDepartment.value) {
      selectedDepartment.value.users = response.data.data;
    }
  } catch (error) {
    ElMessage.error('获取部门用户失败');
    console.error(error);
  } finally {
    usersLoading.value = false;
  }
};

// 将树形部门结构扁平化为列表
const flattenDepartments = (departments, result = []) => {
  departments.forEach(dept => {
    const {children, users, ...rest} = dept;
    result.push(rest);
    if (children && children.length > 0) {
      flattenDepartments(children, result);
    }
  });
  return result;
};

// 处理部门点击
const handleDepartmentClick = async (data) => {
  selectedDepartment.value = data;
  userCurrentPage.value = 1;
  // 获取该部门的用户
  await fetchDepartmentUsers(data.id);
};

// 新增部门
const handleAddDepartment = () => {
  isEditDepartment.value = false;
  formDepartment.value = {
    id: undefined,
    name: '',
    parentId: null,
    description: '',
    status: 0
  };
  showDepartmentDialog.value = true;
};

// 新增子部门
const handleAddSubDepartment = (parentDepartment) => {
  isEditDepartment.value = false;
  formDepartment.value = {
    id: undefined,
    name: '',
    parentId: parentDepartment.id,
    description: '',
    status: 0
  };
  showDepartmentDialog.value = true;
};

// 编辑部门
const handleEditDepartment = (department) => {
  isEditDepartment.value = true;
  // 确保复制所有必要字段，包括parentId
  formDepartment.value = {
    id: department.id,
    name: department.name,
    parentId: department.parentId, // 现在应该包含这个字段
    description: department.description || '',
    status: department.status
  };
  showDepartmentDialog.value = true;
};

// 删除部门
const handleDeleteDepartment = async (department) => {
  // 检查是否有子部门
  const hasChildren = checkDepartmentHasChildren(department.id);
  if (hasChildren) {
    ElMessage.warning('请先删除子部门');
    return;
  }

  try {
    await ElMessageBox.confirm(
        `确定要删除部门 ${department.name} 吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    );

    // 调用API删除部门
    await DepAPI.deleteDepartment(department.id);

    // 从树形结构中删除部门
    deleteDepartmentFromTree(departmentTree.value, department.id);
    allDepartments.value = flattenDepartments(departmentTree.value);

    // 如果删除的是当前选中的部门，取消选中
    if (selectedDepartment.value && selectedDepartment.value.id === department.id) {
      selectedDepartment.value = null;
    }

    ElMessage.success('部门删除成功');
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除部门失败');
      console.error(error);
    }
  }
};

// 检查部门是否有子部门
const checkDepartmentHasChildren = (departmentId) => {
  const check = (departments) => {
    for (const dept of departments) {
      if (dept.id === departmentId && dept.children && dept.children.length > 0) {
        return true;
      }
      if (dept.children && dept.children.length > 0) {
        if (check(dept.children)) {
          return true;
        }
      }
    }
    return false;
  };
  return check(departmentTree.value);
};

// 从树形结构中删除部门
const deleteDepartmentFromTree = (departments, departmentId) => {
  for (let i = 0; i < departments.length; i++) {
    if (departments[i].id === departmentId) {
      departments.splice(i, 1);
      return true;
    }
    if (departments[i].children && departments[i].children.length > 0) {
      if (deleteDepartmentFromTree(departments[i].children, departmentId)) {
        return true;
      }
    }
  }
  return false;
};

// 提交部门表单
const submitDepartmentForm = async () => {
  try {
    await departmentFormRef.value.validate();
    formSubmitting.value = true;

    if (isEditDepartment.value) {
      // 编辑部门
      await DepAPI.updateDepartment(formDepartment.value.id, formDepartment.value);
      updateDepartmentInTree(departmentTree.value, formDepartment.value);
      ElMessage.success('部门编辑成功');
    } else {
      // 新增部门
      const response = await DepAPI.createDepartment(formDepartment.value);
      const newDepartment = response.data.data;
      addDepartmentToTree(departmentTree.value, newDepartment);
      ElMessage.success('部门创建成功');
    }

    allDepartments.value = flattenDepartments(departmentTree.value);
    showDepartmentDialog.value = false;
    departmentFormRef.value.resetFields();
  } catch (error) {
    console.error('操作失败', error);
    ElMessage.error(isEditDepartment.value ? '编辑部门失败' : '创建部门失败');
  } finally {
    formSubmitting.value = false;
  }
};

// 在树形结构中添加部门
const addDepartmentToTree = (departments, newDepartment) => {
  if (newDepartment.parentId === null) {
    departments.push({
      ...newDepartment,
      children: []
    });
    return true;
  }

  for (let i = 0; i < departments.length; i++) {
    if (departments[i].id === newDepartment.parentId) {
      if (!departments[i].children) {
        departments[i].children = [];
      }
      departments[i].children.push({
        ...newDepartment,
        children: []
      });
      return true;
    }
    if (departments[i].children && departments[i].children.length > 0) {
      if (addDepartmentToTree(departments[i].children, newDepartment)) {
        return true;
      }
    }
  }
  return false;
};

// 在树形结构中更新部门
const updateDepartmentInTree = (departments, updatedDepartment) => {
  for (let i = 0; i < departments.length; i++) {
    if (departments[i].id === updatedDepartment.id) {
      // 如果父部门变更，需要先删除再添加
      if (departments[i].parentId !== updatedDepartment.parentId) {
        const temp = {...updatedDepartment};
        departments.splice(i, 1);
        addDepartmentToTree(departmentTree.value, temp);
      } else {
        departments[i] = {
          ...departments[i],
          ...updatedDepartment,
          children: departments[i].children || []
        };
      }
      return true;
    }
    if (departments[i].children && departments[i].children.length > 0) {
      if (updateDepartmentInTree(departments[i].children, updatedDepartment)) {
        return true;
      }
    }
  }
  return false;
};

// 处理用户选择变化
const handleUserSelectionChange = (selection) => {
  selectedUsers.value = selection;
};

// 确认添加用户到部门
const confirmUserSelection = async () => {
  if (!selectedDepartment.value) {
    ElMessage.warning('请先选择部门');
    return;
  }

  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请选择用户');
    return;
  }

  selectionSubmitting.value = true;
  try {
    // 为每个选中的用户添加到当前部门
    const promises = selectedUsers.value.map(user =>
        DepAPI.assignUserToDepartment(user.id, selectedDepartment.value.id)
    );

    await Promise.all(promises);

    // 刷新部门用户列表
    await fetchDepartmentUsers(selectedDepartment.value.id);

    ElMessage.success(`已成功添加 ${selectedUsers.value.length} 名用户到部门`);
    showUserSelectionDialog.value = false;
    selectedUsers.value = [];
  } catch (error) {
    ElMessage.error('添加用户到部门失败');
    console.error(error);
  } finally {
    selectionSubmitting.value = false;
  }
};

// 从部门移除用户
const handleRemoveUser = async (userId) => {
  try {
    await ElMessageBox.confirm(
        '确定要将该用户从部门中移除吗？',
        '移除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    );

    await DepAPI.removeUserFromDepartment(userId, selectedDepartment.value.id);

    // 刷新部门用户列表
    await fetchDepartmentUsers(selectedDepartment.value.id);

    ElMessage.success('用户已从部门移除');
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('移除用户失败');
      console.error(error);
    }
  }
};

// 计算属性 - 部门成员列表
const departmentUsers = computed(() => {
  if (!selectedDepartment.value || !selectedDepartment.value.users) {
    return [];
  }
  return selectedDepartment.value.users;
});

// 计算属性 - 筛选后的部门成员
const filteredUsers = computed(() => {
  return departmentUsers.value.filter(user => {
    return user.userName.toLowerCase().includes(userSearchQuery.value.toLowerCase()) ||
        user.realName.toLowerCase().includes(userSearchQuery.value.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchQuery.value.toLowerCase()) ||
        user.phoneNumber.includes(userSearchQuery.value);
  });
});

// 计算属性 - 分页后的用户列表
const paginatedUsers = computed(() => {
  const start = (userCurrentPage.value - 1) * userPageSize.value;
  const end = start + userPageSize.value;
  return filteredUsers.value.slice(start, end);
});

// 计算属性 - 可选择的用户（不在当前部门的用户）
const selectableUsers = computed(() => {
  const currentUserIds = departmentUsers.value.map(user => user.id);

  return users.value
      .filter(user => !currentUserIds.includes(user.id))
      .filter(user =>
          user.userName.toLowerCase().includes(selectionSearchQuery.value.toLowerCase()) ||
          user.realName.toLowerCase().includes(selectionSearchQuery.value.toLowerCase())
      );
});

// 分页相关方法
const handleUserSizeChange = (val) => {
  userPageSize.value = val;
  userCurrentPage.value = 1;
};

const handleUserCurrentChange = (val) => {
  userCurrentPage.value = val;
};

const handleSelectionSizeChange = (val) => {
  selectionPageSize.value = val;
  selectionCurrentPage.value = 1;
};

const handleSelectionCurrentChange = (val) => {
  selectionCurrentPage.value = val;
};

// 辅助方法 - 获取部门路径
const getDepartmentPath = (department) => {
  const path = [department.name];
  let currentParentId = department.parentId;

  while (currentParentId !== null) {
    const parent = findDepartmentById(allDepartments.value, currentParentId);
    if (parent) {
      path.unshift(parent.name);
      currentParentId = parent.parentId;
    } else {
      currentParentId = null;
    }
  }

  return path.join(' / ');
};

// 辅助方法 - 根据ID查找部门
const findDepartmentById = (departments, id) => {
  return departments.find(dept => dept.id === id);
};

// 辅助方法 - 获取用户所属部门名称
const getDepartmentNames = (departments) => {
  if (!departments || departments.length === 0) {
    return '无';
  }

  const names = departments.map(dept => dept.name);
  return names.join('，');
};

// 辅助方法 - 获取角色类型
const getRoleType = (roleId) => {
  switch (roleId) {
    case 1:
      return 'success';
    case 2:
      return 'primary';
    case 3:
      return 'info';
    default:
      return 'default';
  }
};
</script>

<style scoped>
.app-container {
  height: 100vh;
  overflow: hidden;
}

.app-aside {
  background-color: #f5f7fa;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.department-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.department-tree {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.tree-node-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.tree-node-operations {
  visibility: hidden;
}

.el-tree-node:hover .tree-node-operations {
  visibility: visible;
}

.operation-icon {
  margin-left: 8px;
  cursor: pointer;
  color: #666;
}

.operation-icon:hover {
  color: #1890ff;
}

.app-main {
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f7fa;
}

.content-wrapper {
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.content-header {
  margin-bottom: 20px;
}

.content-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.department-info-card {
  margin-bottom: 20px;
}

.card-header {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #333;
}

.department-info {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-label {
  font-weight: 500;
  color: #666;
  width: 100px;
}

.user-management-section {
  margin-top: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.search-input {
  width: 300px;
  margin-bottom: 16px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 50px 0;
}

::v-deep .el-dialog__body {
  max-height: 500px;
  overflow-y: auto;
}
</style>
