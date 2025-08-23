<template>
  <div class="content-wrapper">
    <div class="content-header">
      <h2>用户管理</h2>
      <el-button type="primary" @click="showAddUserDialog = true">
        <el-icon><Plus /></el-icon>
        新增用户
      </el-button>
    </div>

    <div class="search-bar">
      <el-input
          v-model="userSearchQuery"
          placeholder="搜索用户"
          prefix-icon="Search"
          class="search-input"
      ></el-input>
      <el-select
          v-model="userRoleFilter"
          placeholder="选择角色"
          class="role-filter"
          clearable
      >
        <el-option
            v-for="role in roles"
            :key="role.id"
            :label="role.roleName"
            :value="role.id"
        ></el-option>
      </el-select>
      <el-select
          v-model="userStatusFilter"
          placeholder="用户状态"
          class="status-filter"
          clearable
      >
        <el-option label="启用" value="0"></el-option>
        <el-option label="禁用" value="1"></el-option>
      </el-select>
    </div>

    <el-table
        :data="paginatedUsers"
        border
        style="width: 100%; margin-top: 16px;"
        :row-class-name="tableRowClassName"
    >
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="userName" label="账户"></el-table-column>
      <el-table-column prop="realName" label="姓名"></el-table-column>
      <el-table-column prop="department" label="部门"></el-table-column>
      <el-table-column prop="phoneNumber" label="手机号"></el-table-column>
      <el-table-column prop="gender" label="性别">
        <template #default="scope">
          {{ scope.row.gender === 1 ? '男' : scope.row.gender === 2 ? '女' : '未知' }}
        </template>
      </el-table-column>
      <el-table-column prop="email" label="邮箱"></el-table-column>
      <el-table-column label="角色">
        <template #default="scope">
          <el-tag
              v-for="roleId in scope.row.roleIds"
              :key="roleId"
              :type="getRoleType(roleId)"
              style="margin-right: 5px;"
          >
            {{ getRoleName(roleId) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注"></el-table-column>
      <el-table-column label="状态">
        <template #default="scope">
          <el-switch
              v-model="scope.row.status"
              :active-value="0"
              :inactive-value="1"
              @change="handleUserStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button
              size="small"
              @click="handleEditUser(scope.row)"
          >
            编辑
          </el-button>
          <el-button
              size="small"
              type="warning"
              @click="handleResetPassword(scope.row)"
          >
            重置密码
          </el-button>
          <el-button
              size="small"
              type="danger"
              @click="handleDeleteUser(scope.row.id)"
          >
            删除
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

    <!-- 新增/编辑用户对话框 -->
    <el-dialog
        :title="formUser.id ? '编辑用户' : '新增用户'"
        v-model="showAddUserDialog"
        width="600px"
    >
      <el-form
          :model="formUser"
          :rules="userRules"
          ref="userFormRef"
          label-width="80px"
      >
        <el-form-item label="账户" prop="userName">
          <el-input v-model="formUser.userName" :disabled="!!formUser.id"></el-input>
        </el-form-item>
        <el-form-item
            label="密码"
            prop="password"
            v-if="!formUser.id"
        >
          <el-input v-model="formUser.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formUser.name"></el-input>
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-input v-model="formUser.department"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formUser.phone"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="formUser.gender" placeholder="请选择性别">
            <el-option label="男" :value="1"></el-option>
            <el-option label="女" :value="2"></el-option>
            <el-option label="未知" :value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formUser.email"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-select
              v-model="formUser.roleIds"
              multiple
              placeholder="请选择角色"
          >
            <el-option
                v-for="role in roles"
                :key="role.id"
                :label="role.roleName"
                :value="role.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
              v-model="formUser.remark"
              type="textarea"
              :rows="3"
          ></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
              v-model="formUser.status"
              :active-value="0"
              :inactive-value="1"
          ></el-switch>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddUserDialog = false">取消</el-button>
        <el-button
            type="primary"
            @click="submitUserForm"
        >
          确认
        </el-button>
      </template>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog
        title="重置密码"
        v-model="showResetPasswordDialog"
        width="300px"
    >
      <el-form
          :model="resetPasswordForm"
          :rules="resetPasswordRules"
          ref="resetPasswordFormRef"
          label-width="80px"
      >
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="resetPasswordForm.newPassword" type="password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="resetPasswordForm.confirmPassword" type="password"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showResetPasswordDialog = false">取消</el-button>
        <el-button
            type="primary"
            @click="submitResetPassword"
        >
          确认重置
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

// 用户数据
const users = ref([]);
const loadingUsers = ref(false);

// 角色数据
const roles = ref([]);

// 用户管理相关状态
const userSearchQuery = ref('');
const userRoleFilter = ref('');
const userStatusFilter = ref('');
const userCurrentPage = ref(1);
const userPageSize = ref(10);
const showAddUserDialog = ref(false);
const formUser = ref({
  id: undefined,
  userName: '',
  password: '',
  name: '',
  department: '',
  phone: '',
  gender: 0,
  email: '',
  roleIds: [],
  remark: '',
  status: 0
});
const userRules = ref({
  userName: [
    {required: true, message: '请输入账户', trigger: 'blur'},
    {min: 3, max: 20, message: '账户长度在 3 到 20 个字符', trigger: 'blur'}
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur'}
  ],
  name: [
    {required: true, message: '请输入姓名', trigger: 'blur'},
    {min: 2, max: 10, message: '姓名长度在 2 到 10 个字符', trigger: 'blur'}
  ],
  phone: [
    {required: true, message: '请输入手机号', trigger: 'blur'},
    {pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur'}
  ],
  email: [
    {required: true, message: '请输入邮箱', trigger: 'blur'},
    {type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change']}
  ],
  roleIds: [{required: true, message: '请选择至少一个角色', trigger: 'change'}]
});
const userFormRef = ref(null);

// 重置密码相关状态
const showResetPasswordDialog = ref(false);
const resetPasswordForm = ref({
  newPassword: '',
  confirmPassword: ''
});
const resetPasswordRules = ref({
  newPassword: [
    {required: true, message: '请输入新密码', trigger: 'blur'},
    {min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur'}
  ],
  confirmPassword: [
    {required: true, message: '请确认密码', trigger: 'blur'},
    {
      validator: (rule, value, callback) => {
        if (value !== resetPasswordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
});
const resetPasswordFormRef = ref(null);
const userIdToReset = ref(null);

// 计算属性 - 筛选用户
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const matchesSearch = user.userName.toLowerCase().includes(userSearchQuery.value.toLowerCase()) ||
        user.name.toLowerCase().includes(userSearchQuery.value.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchQuery.value.toLowerCase()) ||
        user.department.toLowerCase().includes(userSearchQuery.value.toLowerCase()) ||
        user.phone.includes(userSearchQuery.value);
    const matchesRole = !userRoleFilter.value || user.roleIds.includes(Number(userRoleFilter.value));
    const matchesStatus = !userStatusFilter.value || user.status === Number(userStatusFilter.value);

    return matchesSearch && matchesRole && matchesStatus;
  });
});

// 分页后的用户数据
const paginatedUsers = computed(() => {
  const start = (userCurrentPage.value - 1) * userPageSize.value;
  const end = start + userPageSize.value;
  return filteredUsers.value.slice(start, end);
});

// 生命周期钩子
onMounted(() => {
  fetchUsers();
  fetchRoles();
});

// 方法 - 获取用户列表
const fetchUsers = async () => {
  try {
    loadingUsers.value = true;
    const response = await AuthAPI.getUserList();
    users.value = response.data.data;
  } catch (error) {
    ElMessage.error('获取用户列表失败');
    console.error(error);
  } finally {
    loadingUsers.value = false;
  }
};

// 方法 - 获取角色列表
const fetchRoles = async () => {
  try {
    const response = await AuthAPI.getRoleList();
    roles.value = response.data.data;
  } catch (error) {
    ElMessage.error('获取角色列表失败');
    console.error(error);
  }
};

// 方法 - 用户分页
const handleUserSizeChange = (val) => {
  userPageSize.value = val;
  userCurrentPage.value = 1;
};

const handleUserCurrentChange = (val) => {
  userCurrentPage.value = val;
};

// 方法 - 编辑用户
const handleEditUser = (user) => {
  formUser.value = {...user};
  showAddUserDialog.value = true;
};

// 方法 - 提交用户表单
const submitUserForm = async () => {
  try {
    await userFormRef.value.validate();

    if (formUser.value.id) {
      // 编辑现有用户
      await AuthAPI.updateUser(formUser.value.id, formUser.value);
      ElMessage.success('用户编辑成功');
    } else {
      // 创建新用户
      await AuthAPI.createUser(formUser.value);
      ElMessage.success('用户创建成功');
    }

    showAddUserDialog.value = false;
    userFormRef.value.resetFields();
    fetchUsers();
  } catch (error) {
    console.error('表单验证失败', error);
    ElMessage.error(error.response?.data?.message || '操作失败');
  }
};

// 方法 - 更改用户状态
const handleUserStatusChange = async (user) => {
  try {
    console.log(user)
    await AuthAPI.updateUserStatus(user.id, user.status);
    ElMessage.success('用户状态更新成功');
  } catch (error) {
    ElMessage.error('用户状态更新失败');
    console.error(error);
    // 失败时回滚状态
    user.status = user.status === 0 ? 1 : 0;
  }
};

// 方法 - 重置密码
const handleResetPassword = (user) => {
  userIdToReset.value = user.id;
  resetPasswordForm.value = {
    newPassword: '',
    confirmPassword: ''
  };
  showResetPasswordDialog.value = true;
};

// 方法 - 提交重置密码
const submitResetPassword = async () => {
  try {
    await resetPasswordFormRef.value.validate();
    await AuthAPI.resetPassword(userIdToReset.value, resetPasswordForm.value.newPassword);
    ElMessage.success('密码重置成功');
    showResetPasswordDialog.value = false;
  } catch (error) {
    console.error('密码重置失败', error);
    ElMessage.error(error.response?.data?.message || '密码重置失败');
  }
};

// 方法 - 删除用户
const handleDeleteUser = async (userId) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await AuthAPI.deleteUser(userId);
    ElMessage.success('用户删除成功');
    fetchUsers();
  } catch (error) {
    if (error === 'cancel') return;
    ElMessage.error('用户删除失败');
    console.error(error);
  }
};

// 方法 - 获取角色名称
const getRoleName = (roleId) => {
  const role = roles.value.find(r => r.id === roleId);
  return role ? role.roleName : '';
};

// 方法 - 获取角色标签类型
const getRoleType = (roleId) => {
  // 可以根据不同角色ID返回不同的标签类型
  const roleTypes = {
    1: 'primary',
    2: 'success',
    3: 'warning',
    4: 'info'
  };
  return roleTypes[roleId] || 'default';
};

// 表格行样式
const tableRowClassName = ({row}) => {
  return row.status === 1 ? 'row-disabled' : '';
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

.role-filter, .status-filter {
  width: 200px;
}

.pagination {
  margin-top: 16px;
  text-align: right;
}

::v-deep .row-disabled {
  background-color: #f5f5f5;
  color: #999;
}

::v-deep .permission-tree {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 10px;
}
</style>
