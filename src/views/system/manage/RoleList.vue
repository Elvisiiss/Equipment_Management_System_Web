<template>
  <div class="content-wrapper">
    <div class="content-header">
      <h2>角色列表</h2>
      <el-button type="primary" @click="handleShowAddRoleDialog">
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
    >
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="roleName" label="角色名称"></el-table-column>
      <el-table-column prop="description" label="角色描述"></el-table-column>
      <el-table-column label="权限数量">
        <template #default="scope">
          {{ scope.row.permissionIds?.length || 0 }}
        </template>
      </el-table-column>
      <el-table-column label="用户数量">
        <template #default="scope">
          {{ getUserCountByRole(scope.row.id) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250">
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
              @click="handleRolePermissions(scope.row)"
          >
            权限配置
          </el-button>
          <el-button
              size="small"
              type="danger"
              @click="handleDeleteRole(scope.row.id)"
              :disabled="scope.row.id === 1"
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
        :title="isEditRole ? '编辑角色' : '新增角色'"
        v-model="showAddRoleDialog"
        width="600px"
    >
      <el-form
          :model="formRole"
          :rules="roleRules"
          ref="roleFormRef"
          label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="formRole.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input
              v-model="formRole.description"
              type="textarea"
              :rows="3"
          ></el-input>
        </el-form-item>
        <el-form-item label="权限设置" prop="permissionIds">
          <el-tree
              :data="permissionTree"
              show-checkbox
              node-key="id"
              :default-checked-keys="formRole.permissionIds"
              @check="handleRoleFormPermissionCheck"
              class="permission-tree"
          ></el-tree>
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

    <!-- 角色权限配置对话框 -->
    <el-dialog
        title="角色权限配置"
        v-model="showRolePermissionsDialog"
        width="600px"
    >
      <div class="permission-title">
        当前角色: {{ currentRoleForPermissions?.roleName || '' }}
      </div>

      <el-tree
          :data="permissionTree"
          show-checkbox
          node-key="id"
          :default-checked-keys="currentRolePermissions"
          @check="handlePermissionCheck"
          class="permission-tree"
      ></el-tree>

      <template #footer>
        <el-button @click="showRolePermissionsDialog = false">取消</el-button>
        <el-button
            type="primary"
            @click="saveRolePermissions"
        >
          保存配置
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import AuthAPI from '@/api/AuthAPI.js';

// 角色数据
const roles = ref([]);
const loadingRoles = ref(false);

// 用户数据（用于计算角色关联的用户数量）
const users = ref([]);

// 权限数据
const permissions = ref([]);

// 角色管理相关状态
const roleSearchQuery = ref('');
const roleCurrentPage = ref(1);
const rolePageSize = ref(10);
const showAddRoleDialog = ref(false);
const formRole = ref({
  id: undefined,
  roleName: '',
  description: '',
  permissionIds: []
});
const roleRules = ref({
  roleName: [{required: true, message: '请输入角色名称', trigger: 'blur'}],
  description: [{required: true, message: '请输入角色描述', trigger: 'blur'}],
  permissionIds: [{required: true, message: '请至少选择一个权限', trigger: 'change'}]
});
const roleFormRef = ref(null);
const isEditRole = ref(false); // 标识当前是编辑还是新增角色

// 权限配置相关状态
const showRolePermissionsDialog = ref(false);
const currentRoleForPermissions = ref(null);
const currentRolePermissions = ref([]);
const selectedPermissions = ref([]);

// 权限树形结构数据
const allPermissionTree = ref([
  {
    id: 'sidebar',
    label: '侧边栏权限',
    children: [
      {
        id: 16,
        label: '首页 (side:)'
      },
      {
        id: 'side:asset',
        label: '资产管理',
        children: [
          {
            id: 'side:asset:manage',
            label: '管理',
            children: [
              {
                id: 'side:asset:manage:life',
                label: '全生命周期管理',
                children: [
                  {
                    id: 24,
                    label: '资产转移 (side:asset:manage:life:transfer)'
                  }
                ]
              },
              {
                id: 21,
                label: '资产索引 (side:asset:manage:index)'
              },
              {
                id: 19,
                label: '设备台账 (side:asset:manage:ledger)'
              },
              {
                id: 20,
                label: '主数据管理 (side:asset:manage:master)'
              },
              {
                id: 22,
                label: '资产入库 (side:asset:manage:import)'
              }
            ]
          },
          {
            id: 'side:asset:screen',
            label: '大屏',
            children: [
              {
                id: 28,
                label: '页面C (side:asset:screen:C)'
              }
            ]
          },
          {
            id: 'side:asset:configuration',
            label: '配置',
            children: [
              {
                id: 26,
                label: '页面B (side:asset:configuration:B)'
              }
            ]
          }
        ]
      },
      // 其他权限节点...
      {
        id: 'side:system',
        label: '系统管理',
        children: [
          {
            id: 'side:system:manage',
            label: '管理',
            children: [
              {
                id: 98,
                label: '区域管理 (side:system:manage:regionManagement)'
              },
              {
                id: 97,
                label: '用户管理 (side:system:manage:users_roles_permissions)',
                children: [
                  {
                    id: 'user',
                    label: '用户权限',
                    children: [
                      {id: 1, label: '查看用户信息 (user:view)'},
                      {id: 2, label: '创建新用户 (user:create)'},
                      {id: 3, label: '编辑用户信息 (user:edit)'},
                      {id: 4, label: '删除用户 (user:delete)'}
                    ]
                  },
                  {
                    id: 'role',
                    label: '角色权限',
                    children: [
                      {id: 5, label: '管理角色权限 (role:manage)'}
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
]);

// 权限树（包含所有权限）
const permissionTree = computed(() => {
  return allPermissionTree.value;
});

// 计算属性 - 筛选角色
const filteredRoles = computed(() => {
  return roles.value.filter(role => {
    return role.roleName.toLowerCase().includes(roleSearchQuery.value.toLowerCase()) ||
        role.description.toLowerCase().includes(roleSearchQuery.value.toLowerCase());
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
  fetchUsers();
  fetchPermissions();
});

// 方法 - 获取角色列表
const fetchRoles = async () => {
  try {
    loadingRoles.value = true;
    const response = await AuthAPI.getRoleList();
    roles.value = response.data.data;
  } catch (error) {
    ElMessage.error('获取角色列表失败');
    console.error(error);
  } finally {
    loadingRoles.value = false;
  }
};

// 方法 - 获取用户列表
const fetchUsers = async () => {
  try {
    const response = await AuthAPI.getUserList();
    users.value = response.data.data;
  } catch (error) {
    ElMessage.error('获取用户列表失败');
    console.error(error);
  }
};

// 方法 - 获取权限列表
const fetchPermissions = async () => {
  try {
    const response = await AuthAPI.getPermissionList();
    permissions.value = response.data.data;
  } catch (error) {
    ElMessage.error('获取权限列表失败');
    console.error(error);
  }
};

// 方法 - 显示新增角色对话框
const handleShowAddRoleDialog = () => {
  isEditRole.value = false;
  formRole.value = {
    id: undefined,
    roleName: '',
    description: '',
    permissionIds: []
  };
  showAddRoleDialog.value = true;
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
  isEditRole.value = true;
  formRole.value = {...role};
  showAddRoleDialog.value = true;
};

// 方法 - 提交角色表单
const submitRoleForm = async () => {
  try {
    await roleFormRef.value.validate();

    if (formRole.value.id) {
      // 编辑现有角色
      await AuthAPI.updateRole(formRole.value.id, formRole.value);
      ElMessage.success('角色编辑成功');
    } else {
      // 创建新角色
      await AuthAPI.createRole(formRole.value);
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

// 方法 - 处理角色权限选择
const handleRoleFormPermissionCheck = (data, checked) => {
  formRole.value.permissionIds = checked.checkedKeys.filter(key => typeof key === 'number');
};

// 方法 - 配置角色权限
const handleRolePermissions = (role) => {
  currentRoleForPermissions.value = role;
  currentRolePermissions.value = [...role.permissionIds];
  selectedPermissions.value = [...role.permissionIds];
  showRolePermissionsDialog.value = true;
};

// 方法 - 处理权限选择
const handlePermissionCheck = (data, checked) => {
  selectedPermissions.value = checked.checkedKeys.filter(key => typeof key === 'number');
};

// 方法 - 保存角色权限配置
const saveRolePermissions = async () => {
  try {
    if (!currentRoleForPermissions.value) return;

    await AuthAPI.updateRolePermissions(
        currentRoleForPermissions.value.id,
        selectedPermissions.value
    );

    ElMessage.success('权限配置保存成功');
    showRolePermissionsDialog.value = false;
    fetchRoles();
  } catch (error) {
    console.error('保存权限配置失败', error);
    ElMessage.error(error.response?.data?.message || '保存失败');
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

    await AuthAPI.deleteRole(roleId);
    ElMessage.success('角色删除成功');
    fetchRoles();
  } catch (error) {
    if (error === 'cancel') return;
    ElMessage.error('角色删除失败');
    console.error(error);
  }
};

// 方法 - 根据角色ID获取用户数量
const getUserCountByRole = (roleId) => {
  return users.value.filter(user => user.roleIds && user.roleIds.includes(roleId)).length;
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
  margin-bottom: 16px;
}

.search-input {
  width: 300px;
}

.pagination {
  margin-top: 16px;
  text-align: right;
}

.permission-title {
  margin-bottom: 16px;
  font-weight: bold;
}

::v-deep .permission-tree {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 10px;
}
</style>
