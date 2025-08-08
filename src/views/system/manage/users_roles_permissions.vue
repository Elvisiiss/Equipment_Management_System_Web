<template>
  <el-container class="app-container">
    <el-container>
      <!-- 侧边栏导航 -->
      <el-aside width="200px" class="app-aside">
        <el-menu
            default-active="user-management"
            class="menu-sidebar"
            @select="handleMenuSelect"
        >
          <el-menu-item index="user-management">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="role-list">
            <el-icon><UserFilled /></el-icon>
            <span>角色列表</span>
          </el-menu-item>
          <el-menu-item index="role-sidebar-list">
            <el-icon><Menu /></el-icon>
            <span>角色-侧边栏列表</span>
          </el-menu-item>
          <el-menu-item index="permission-management">
            <el-icon><Lock /></el-icon>
            <span>权限管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-main class="app-main">
        <!-- 用户管理页面 -->
        <div v-if="activeMenu === 'user-management'" class="content-wrapper">
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
            <el-table-column prop="userName" label="用户名"></el-table-column>
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
        </div>

        <!-- 角色列表页面 -->
        <div v-if="activeMenu === 'role-list'" class="content-wrapper">
          <div class="content-header">
            <h2>角色列表</h2>
            <el-button type="primary" @click="handleShowAddRoleDialog(false)">
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
            <el-table-column label="操作" width="200">
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
                    @click="handleRolePermissions(scope.row, false)"
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
        </div>

        <!-- 角色-侧边栏列表页面 -->
        <div v-if="activeMenu === 'role-sidebar-list'" class="content-wrapper">
          <div class="content-header">
            <h2>角色-侧边栏列表</h2>
            <el-button type="primary" @click="handleShowAddRoleDialog(true)">
              <el-icon><Plus /></el-icon>
              新增角色
            </el-button>
          </div>

          <div class="search-bar">
            <el-input
                v-model="sidebarRoleSearchQuery"
                placeholder="搜索角色"
                prefix-icon="Search"
                class="search-input"
            ></el-input>
          </div>

          <el-table
              :data="paginatedSidebarRoles"
              border
              style="width: 100%; margin-top: 16px;"
          >
            <el-table-column prop="id" label="ID" width="80"></el-table-column>
            <el-table-column prop="roleName" label="角色名称"></el-table-column>
            <el-table-column prop="description" label="角色描述"></el-table-column>
            <el-table-column label="侧边栏权限数量">
              <template #default="scope">
                {{ getSidebarPermissionCount(scope.row.permissionIds) }}
              </template>
            </el-table-column>
            <el-table-column label="用户数量">
              <template #default="scope">
                {{ getUserCountByRole(scope.row.id) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button
                    size="small"
                    @click="handleEditSidebarRole(scope.row)"
                >
                  编辑
                </el-button>
                <el-button
                    size="small"
                    type="primary"
                    @click="handleRolePermissions(scope.row, true)"
                >
                  侧边栏权限配置
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
              @size-change="handleSidebarRoleSizeChange"
              @current-change="handleSidebarRoleCurrentChange"
              :current-page="sidebarRoleCurrentPage"
              :page-sizes="[10, 20, 50]"
              :page-size="sidebarRolePageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="filteredSidebarRoles.length"
              class="pagination"
          ></el-pagination>
        </div>

        <!-- 权限管理页面 -->
        <div v-if="activeMenu === 'permission-management'" class="content-wrapper">
          <div class="content-header">
            <h2>权限管理</h2>
          </div>

          <el-table
              :data="permissions"
              border
              style="width: 100%; margin-top: 16px;"
          >
            <el-table-column prop="id" label="ID" width="80"></el-table-column>
            <el-table-column prop="permName" label="权限名称"></el-table-column>
            <el-table-column prop="description" label="权限描述"></el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button
                    size="small"
                    @click="handleEditPermission(scope.row)"
                >
                  编辑
                </el-button>
                <el-button
                    size="small"
                    type="danger"
                    @click="handleDeletePermission(scope.row.id)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-main>
    </el-container>

    <!-- 新增/编辑用户对话框 -->
    <el-dialog
        title="用户信息"
        v-model="showAddUserDialog"
        width="500px"
    >
      <el-form
          :model="formUser"
          :rules="userRules"
          ref="userFormRef"
          label-width="100px"
      >
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="formUser.userName" :disabled="!!formUser.id"></el-input>
        </el-form-item>
        <el-form-item
            label="密码"
            prop="password"
            v-if="!formUser.id"
        >
          <el-input v-model="formUser.password" type="password"></el-input>
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
              :data="isSidebarRole ? sidebarPermissionTree : nonSidebarPermissionTree"
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
        :title="isSidebarPermission ? '角色侧边栏权限配置' : '角色权限配置'"
        v-model="showRolePermissionsDialog"
        width="600px"
    >
      <div class="permission-title">
        当前角色: {{ currentRoleForPermissions?.roleName || '' }}
      </div>

      <el-tree
          :data="isSidebarPermission ? sidebarPermissionTree : nonSidebarPermissionTree"
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

    <!-- 编辑权限对话框 -->
    <el-dialog
        title="编辑权限"
        v-model="showEditPermissionDialog"
        width="500px"
    >
      <el-form
          :model="formPermission"
          ref="permissionFormRef"
          label-width="100px"
      >
        <el-form-item label="权限名称" prop="permName">
          <el-input v-model="formPermission.permName" disabled></el-input>
        </el-form-item>
        <el-form-item label="权限描述" prop="description">
          <el-input
              v-model="formPermission.description"
              type="textarea"
              :rows="3"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditPermissionDialog = false">取消</el-button>
        <el-button
            type="primary"
            @click="submitPermissionForm"
        >
          确认
        </el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  User, UserFilled, Lock, Menu,
  Plus,
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import AuthAPI from '@/api/AuthAPI.js';

// 全局状态
const activeMenu = ref('user-management');

// 用户数据
const users = ref([]);
const loadingUsers = ref(false);

// 角色数据
const roles = ref([]);
const loadingRoles = ref(false);

// 权限数据
const permissions = ref([]);

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
  email: '',
  roleIds: [],
  status: 0
});
const userRules = ref({
  userName: [
    {required: true, message: '请输入用户名', trigger: 'blur'},
    {min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur'}
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur'}
  ],
  email: [
    {required: true, message: '请输入邮箱', trigger: 'blur'},
    {type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change']}
  ],
  roleIds: [{required: true, message: '请选择至少一个角色', trigger: 'change'}]
});
const userFormRef = ref(null);

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
const isSidebarRole = ref(false); // 标识当前是侧边栏角色还是普通角色
const isEditRole = ref(false); // 标识当前是编辑还是新增角色

// 角色-侧边栏管理相关状态
const sidebarRoleSearchQuery = ref('');
const sidebarRoleCurrentPage = ref(1);
const sidebarRolePageSize = ref(10);

// 权限配置相关状态
const showRolePermissionsDialog = ref(false);
const currentRoleForPermissions = ref(null);
const currentRolePermissions = ref([]);
const selectedPermissions = ref([]);
const isSidebarPermission = ref(false); // 标识当前配置的是侧边栏权限还是普通权限

// 权限管理相关状态
const showEditPermissionDialog = ref(false);
const formPermission = ref({
  id: '',
  permName: '',
  description: ''
});

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

// 权限树形结构数据 - 所有权限
const allPermissionTree = ref([
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
  },
  {
    id: 'device',
    label: '设备权限',
    children: [
      {id: 6, label: '查看设备信息 (device:view)'},
      {id: 7, label: '添加新设备 (device:create)'},
      {id: 8, label: '编辑设备信息 (device:edit)'},
      {id: 9, label: '删除设备 (device:delete)'},
      {id: 10, label: '分配设备 (device:assign)'},
      {id: 11, label: '设备维护管理 (device:maintenance)'}
    ]
  },
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
      {
        id: 'side:equipment',
        label: '设备实时监控',
        children: [
          {
            id: 'side:equipment:status',
            label: '设备状态管理',
            children: [
              {
                id: 35,
                label: '状态维护 (side:equipment:status:log)'
              },
              {
                id: 34,
                label: '状态规则与策略 (side:equipment:status:policies)'
              }
            ]
          },
          {
            id: 'side:equipment:screen',
            label: '大屏',
            children: [
              {
                id: 43,
                label: 'OEE管理看板 (side:equipment:screen:oee)'
              },
              {
                id: 45,
                label: 'IOT管理看板 (side:equipment:screen:iot)'
              },
              {
                id: 44,
                label: '设备状态看板 (side:equipment:screen:status)'
              }
            ]
          },
          {
            id: 'side:equipment:location',
            label: '布局管理',
            children: [
              {
                id: 38,
                label: 'PM工单 (side:equipment:location:pm)'
              },
              {
                id: 40,
                label: '逻辑位置 (side:equipment:location:logic)'
              },
              {
                id: 39,
                label: '复机管理 (side:equipment:location:recover)'
              },
              {
                id: 37,
                label: '设备转机 (side:equipment:location:transfer)'
              }
            ]
          },
          {
            id: 'side:equipment:monitoring',
            label: '实时状态监控',
            children: [
              {
                id: 31,
                label: '设备SPC监控 (side:equipment:monitoring:spc)'
              },
              {
                id: 32,
                label: '异常与阈值 (side:equipment:monitoring:exception)'
              }
            ]
          },
          {
            id: 46,
            label: '配置 (side:equipment:configuration)'
          },
          {
            id: 41,
            label: '设备管理 (side:equipment:EquipmentManage)'
          }
        ]
      },
      {
        id: 'side:inspection',
        label: '点巡检管理',
        children: [
          {
            id: 'side:inspection:manage',
            label: '管理',
            children: [
              {
                id: 50,
                label: '计划列表 (side:inspection:manage:PlanList)'
              },
              {
                id: 51,
                label: '任务列表 (side:inspection:manage:TaskList)'
              },
              {
                id: 49,
                label: '异常列表 (side:inspection:manage:ExceptionList)'
              }
            ]
          },
          {
            id: 'side:inspection:screen',
            label: '大屏',
            children: [
              {
                id: 55,
                label: '仪表盘 (side:inspection:screen:Dashboard)'
              },
              {
                id: 57,
                label: '异常分析 (side:inspection:screen:ExceptionAnalysis)'
              },
              {
                id: 56,
                label: '效率分析 (side:inspection:screen:EfficiencyAnalysis)'
              }
            ]
          },
          {
            id: 'side:inspection:configuration',
            label: '配置',
            children: [
              {
                id: 53,
                label: '点巡检配置 (side:inspection:configuration:PolicyConfig)'
              }
            ]
          }
        ]
      },
      {
        id: 'side:maintenance',
        label: '保养管理',
        children: [
          {
            id: 'side:maintenance:manage',
            label: '管理',
            children: [
              {
                id: 61,
                label: '我的审批结果 (side:maintenance:manage:MyApprovals)'
              },
              {
                id: 60,
                label: '审批列表页面 (side:maintenance:manage:ApprovalList)'
              }
            ]
          },
          {
            id: 'side:maintenance:screen',
            label: '大屏',
            children: [
              {
                id: 65,
                label: '页面L (side:maintenance:screen:L)'
              }
            ]
          },
          {
            id: 'side:maintenance:configuration',
            label: '配置',
            children: [
              {
                id: 63,
                label: '页面K (side:maintenance:configuration:K)'
              }
            ]
          }
        ]
      },
      {
        id: 'side:mold',
        label: '模具/治工具管理',
        children: [
          {
            id: 'side:mold:manage',
            label: '管理',
            children: [
              {
                id: 68,
                label: '全生命周期管理 (side:mold:manage:life)'
              },
              {
                id: 71,
                label: '全生命周期2.0 (side:mold:manage:storage)'
              },
              {
                id: 69,
                label: '防用错处理 (side:mold:manage:operation)'
              },
              {
                id: 70,
                label: '维护与点检 (side:mold:manage:maintenance)'
              }
            ]
          }
        ]
      },
      {
        id: 'side:parts',
        label: '备件管理',
        children: [
          {
            id: 'side:parts:manage',
            label: '管理',
            children: [
              {
                id: 77,
                label: '设备BOM管理 (side:parts:manage:EquipmentBOM)'
              },
              {
                id: 79,
                label: '表单-不要的 (side:parts:manage:LocationForm)'
              },
              {
                id: 74,
                label: '备件编码管理 (side:parts:manage:SparePartCode)'
              },
              {
                id: 76,
                label: '线边库存管理 (side:parts:manage:EdgeInventory)'
              },
              {
                id: 78,
                label: '设备详情-不要的 (side:parts:manage:EquipmentDetail)'
              },
              {
                id: 75,
                label: '备品备件台账 (side:parts:manage:SparePartInventory)'
              },
              {
                id: 80,
                label: '库位管理 (side:parts:manage:LocationManagement)'
              }
            ]
          },
          {
            id: 'side:parts:screen',
            label: '大屏',
            children: [
              {
                id: 84,
                label: '页面R (side:parts:screen:R)'
              }
            ]
          },
          {
            id: 'side:parts:configuration',
            label: '配置',
            children: [
              {
                id: 82,
                label: '页面Q (side:parts:configuration:Q)'
              }
            ]
          }
        ]
      },
      {
        id: 'side:repair',
        label: '维修管理',
        children: [
          {
            id: 'side:repair:manage',
            label: '管理',
            children: [
              {
                id: 88,
                label: '维修工单管理 (side:repair:manage:RepairOrder)'
              },
              {
                id: 87,
                label: '维修知识库 (side:repair:manage:KnowledgeBase)'
              }
            ]
          },
          {
            id: 'side:repair:screen',
            label: '大屏',
            children: [
              {
                id: 92,
                label: '数据展示 (side:repair:screen:RepairDashboard)'
              }
            ]
          },
          {
            id: 'side:repair:configuration',
            label: '配置',
            children: [
              {
                id: 90,
                label: '维修配置管理 (side:repair:configuration:RepairConfig)'
              }
            ]
          }
        ]
      },
      {
        id: 94,
        label: '待维修设备 (side:repair:admin:list)'
      },
      {
        id: 93,
        label: '我的工单 (side:repair:worker:list)'
      },
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
                label: '用户管理 (side:system:manage:users_roles_permissions)'
              }
            ]
          },
          {
            id: 'side:system:screen',
            label: '大屏',
            children: [
              {
                id: 102,
                label: '页面X (side:system:screen:X)'
              }
            ]
          },
          {
            id: 'side:system:configuration',
            label: '配置',
            children: [
              {
                id: 100,
                label: '审批设置 (side:system:configuration:DepartmentApproval)'
              }
            ]
          }
        ]
      }
    ]
  }
]);

// 侧边栏权限树（只包含侧边栏相关权限）
const sidebarPermissionTree = computed(() => {
  // 找到侧边栏权限节点
  const sidebarNode = allPermissionTree.value.find(node => node.id === 'sidebar');
  return sidebarNode ? [sidebarNode] : [];
});

// 非侧边栏权限树（不包含侧边栏相关权限）
const nonSidebarPermissionTree = computed(() => {
  // 过滤掉侧边栏权限节点
  return allPermissionTree.value.filter(node => node.id !== 'sidebar');
});

// 计算属性 - 筛选用户
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const matchesSearch = user.userName.toLowerCase().includes(userSearchQuery.value.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchQuery.value.toLowerCase());
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

// 计算属性 - 筛选角色-侧边栏
const filteredSidebarRoles = computed(() => {
  return roles.value.filter(role => {
    return role.roleName.toLowerCase().includes(sidebarRoleSearchQuery.value.toLowerCase()) ||
        role.description.toLowerCase().includes(sidebarRoleSearchQuery.value.toLowerCase());
  });
});

// 分页后的角色-侧边栏数据
const paginatedSidebarRoles = computed(() => {
  const start = (sidebarRoleCurrentPage.value - 1) * sidebarRolePageSize.value;
  const end = start + sidebarRolePageSize.value;
  return filteredSidebarRoles.value.slice(start, end);
});

// 生命周期钩子
onMounted(() => {
  fetchUsers();
  fetchRoles();
  fetchPermissions();
});

// 方法 - 菜单切换
const handleMenuSelect = (index) => {
  activeMenu.value = index;
  // 重置各页面分页
  if (index === 'user-management') {
    userCurrentPage.value = 1;
  } else if (index === 'role-list') {
    roleCurrentPage.value = 1;
  } else if (index === 'role-sidebar-list') {
    sidebarRoleCurrentPage.value = 1;
  }
};

// 方法 - 显示新增角色对话框
const handleShowAddRoleDialog = (isSidebar) => {
  isSidebarRole.value = isSidebar;
  isEditRole.value = false;
  formRole.value = {
    id: undefined,
    roleName: '',
    description: '',
    permissionIds: []
  };
  showAddRoleDialog.value = true;
};

// 方法 - 用户管理
const handleUserSizeChange = (val) => {
  userPageSize.value = val;
  userCurrentPage.value = 1;
};

const handleUserCurrentChange = (val) => {
  userCurrentPage.value = val;
};

const handleEditUser = (user) => {
  formUser.value = {...user};
  showAddUserDialog.value = true;
};

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

const handleUserStatusChange = async (user) => {
  try {
    await AuthAPI.updateUserStatus(user.id, {
      status: user.status
    });
    fetchUsers();
    const statusText = user.status === 0 ? '启用' : '禁用';
    ElMessage.success(`用户已${statusText}`);
  } catch (error) {
    ElMessage.error('状态更新失败');
    console.error(error);
  }
};

const handleResetPassword = (user) => {
  userIdToReset.value = user.id;
  resetPasswordForm.value = {
    newPassword: '',
    confirmPassword: ''
  };
  showResetPasswordDialog.value = true;
};

const submitResetPassword = async () => {
  try {
    await resetPasswordFormRef.value.validate();

    await AuthAPI.resetUserPassword(userIdToReset.value, {
      newPassword: resetPasswordForm.value.newPassword
    });

    ElMessage.success('密码重置成功');
    showResetPasswordDialog.value = false;
    resetPasswordFormRef.value.resetFields();
  } catch (error) {
    console.error('密码验证失败', error);
    ElMessage.error(error.response?.data?.message || '密码重置失败');
  }
};

const handleDeleteUser = (userId) => {
  const user = users.value.find(u => u.id === userId);
  if (!user) return;

  ElMessageBox.confirm(
      `确定要删除用户 ${user.userName} 吗？删除操作可能会导致系统不完整，请谨慎操作！`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(async () => {
    try {
      await AuthAPI.deleteUser(userId);
      ElMessage.success('用户删除成功');
      fetchUsers();
    } catch (error) {
      ElMessage.error(error.response?.data?.message || '删除失败');
    }
  }).catch(() => {
    // 取消删除
  });
};

// 方法 - 角色管理
const handleRoleSizeChange = (val) => {
  rolePageSize.value = val;
  roleCurrentPage.value = 1;
};

const handleRoleCurrentChange = (val) => {
  roleCurrentPage.value = val;
};

const handleEditRole = (role) => {
  isEditRole.value = true;
  isSidebarRole.value = false;
  formRole.value = {...role};
  showAddRoleDialog.value = true;
};

const handleEditSidebarRole = (role) => {
  isEditRole.value = true;
  isSidebarRole.value = true;
  formRole.value = {...role};
  showAddRoleDialog.value = true;
};

const handleRoleFormPermissionCheck = (data, checked) => {
  // 过滤掉非数字的ID（只保留数字类型的权限ID）
  const validPermissionIds = checked.checkedKeys.filter(id => {
    return !isNaN(Number(id));
  }).map(id => Number(id));

  formRole.value.permissionIds = validPermissionIds;
};

const submitRoleForm = async () => {
  try {
    await roleFormRef.value.validate();

    // 准备提交的数据，包含permissionIds
    const roleData = {
      roleName: formRole.value.roleName,
      description: formRole.value.description,
      permissionIds: formRole.value.permissionIds
    };

    if (formRole.value.id) {
      // 编辑现有角色
      await AuthAPI.updateRole(formRole.value.id, roleData);
      ElMessage.success('角色编辑成功');
    } else {
      // 创建新角色
      await AuthAPI.createRole(roleData);
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

// 方法 - 角色-侧边栏管理
const handleSidebarRoleSizeChange = (val) => {
  sidebarRolePageSize.value = val;
  sidebarRoleCurrentPage.value = 1;
};

const handleSidebarRoleCurrentChange = (val) => {
  sidebarRoleCurrentPage.value = val;
};

// 权限配置相关方法
const handleRolePermissions = async (role, isSidebar) => {
  try {
    currentRoleForPermissions.value = {...role};
    isSidebarPermission.value = isSidebar;

    // 调用API获取角色的所有权限
    const response = await AuthAPI.getRolePermissions(role.id);
    let permissionIds = response.data.data || [];

    // 收集所有侧边栏权限ID
    const sidebarPermissionIds = [];
    const collectSidebarPermissionIds = (nodes) => {
      nodes.forEach(node => {
        if (typeof node.id === 'number') {
          sidebarPermissionIds.push(node.id);
        }
        if (node.children && node.children.length) {
          collectSidebarPermissionIds(node.children);
        }
      });
    };
    collectSidebarPermissionIds(sidebarPermissionTree.value);

    // 根据是否是侧边栏权限配置进行过滤
    if (isSidebar) {
      // 侧边栏页只保留侧边栏权限
      permissionIds = permissionIds.filter(id => sidebarPermissionIds.includes(id));
    } else {
      // 角色页排除侧边栏权限
      permissionIds = permissionIds.filter(id => !sidebarPermissionIds.includes(id));
    }

    currentRolePermissions.value = [...permissionIds];
    selectedPermissions.value = [...permissionIds];
    showRolePermissionsDialog.value = true;
  } catch (error) {
    ElMessage.error('获取角色权限失败');
    console.error(error);
  }
};

const handlePermissionCheck = (data, checked, indeterminate) => {
  selectedPermissions.value = [...checked.checkedKeys];
};

const saveRolePermissions = async () => {
  if (!currentRoleForPermissions.value) return;

  try {
    // 过滤掉非数字的ID（只保留数字类型的权限ID）
    const validPermissionIds = selectedPermissions.value.filter(id => {
      // 检查是否为数字（包括字符串形式的数字，如"1"需转为数字）
      return !isNaN(Number(id));
    }).map(id => Number(id)); // 确保最终都是数字类型

    await AuthAPI.updateRolePermissions(currentRoleForPermissions.value.id, {
      permissionIds: validPermissionIds // 发送过滤后的ID数组
    });
    ElMessage.success('权限配置保存成功');
    fetchRoles();
    showRolePermissionsDialog.value = false;
  } catch (error) {
    ElMessage.error('权限配置保存失败');
    console.error(error);
  }
};

const handleDeleteRole = (roleId) => {
  const role = roles.value.find(r => r.id === roleId);
  if (!role) return;

  ElMessageBox.confirm(
      `确定要删除角色 ${role.roleName} 吗？删除操作可能会导致系统不完整，请谨慎操作！`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(async () => {
    try {
      await AuthAPI.deleteRole(roleId);
      ElMessage.success('角色删除成功');
      fetchRoles();
    } catch (error) {
      ElMessage.error(error.response?.data?.message || '删除失败');
    }
  }).catch(() => {
    // 取消删除
  });
};

// 方法 - 权限管理
const fetchPermissions = async () => {
  try {
    const response = await AuthAPI.getPermissionList();
    permissions.value = response.data.data;
  } catch (error) {
    ElMessage.error('获取权限列表失败');
    console.error(error);
  }
};

const handleEditPermission = (permission) => {
  formPermission.value = {...permission};
  showEditPermissionDialog.value = true;
};

const submitPermissionForm = async () => {
  try {
    await AuthAPI.updatePermission(formPermission.value.id, formPermission.value);
    ElMessage.success('权限更新成功');
    showEditPermissionDialog.value = false;
    fetchPermissions();
  } catch (error) {
    ElMessage.error('权限更新失败');
    console.error(error);
  }
};

const handleDeletePermission = (permissionId) => {
  const permission = permissions.value.find(p => p.id === permissionId);
  if (!permission) return;

  ElMessageBox.confirm(
      `确定要删除权限 ${permission.permName} 吗？删除操作可能会导致系统不完整，请谨慎操作！`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(async () => {
    try {
      await AuthAPI.deletePermission(permissionId);
      ElMessage.success('权限删除成功');
      fetchPermissions();
    } catch (error) {
      ElMessage.error(error.response?.data?.message || '删除失败');
    }
  }).catch(() => {
    // 取消删除
  });
};

// 辅助方法
const getRoleName = (roleId) => {
  const role = roles.value.find(r => r.id === roleId);
  return role ? role.roleName : '未知角色';
};

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

const getUserCountByRole = (roleId) => {
  return users.value.filter(u => u.roleIds.includes(roleId)).length;
};

// 计算侧边栏权限数量
const getSidebarPermissionCount = (permissionIds) => {
  if (!permissionIds || !permissionIds.length) return 0;

  // 收集所有侧边栏权限ID
  const sidebarPermissionIds = [];
  const collectSidebarPermissionIds = (nodes) => {
    nodes.forEach(node => {
      if (typeof node.id === 'number') {
        sidebarPermissionIds.push(node.id);
      }
      if (node.children && node.children.length) {
        collectSidebarPermissionIds(node.children);
      }
    });
  };

  collectSidebarPermissionIds(sidebarPermissionTree.value);

  // 计算交集数量
  return permissionIds.filter(id => sidebarPermissionIds.includes(id)).length;
};

const tableRowClassName = ({row}) => {
  return row.status === 1 ? 'row-disabled' : '';
};

// 获取用户列表
const fetchUsers = async () => {
  try {
    loadingUsers.value = true;
    const response = await AuthAPI.getUserList();
    users.value = response.data.data.map(user => ({
      ...user,
      status: user.status
    }));
  } catch (error) {
    ElMessage.error('获取用户列表失败');
    console.error(error);
  } finally {
    loadingUsers.value = false;
  }
};

// 获取角色列表
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
</script>

<style scoped>
.app-container {
  height: 100vh;
  overflow: hidden;
}

.app-aside {
  background-color: #f5f7fa;
  border-right: 1px solid #e4e7ed;
}

.menu-sidebar {
  height: 100%;
  border-right: none;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.content-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.search-bar {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input {
  width: 300px;
}

.role-filter, .status-filter, .operation-filter {
  width: 180px;
}

.date-filter {
  width: 300px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.permission-tree {
  max-height: 400px;
  overflow-y: auto;
  margin-top: 10px;
}

.permission-title {
  margin-bottom: 15px;
  font-weight: bold;
  color: #666;
}

::v-deep .row-disabled {
  background-color: #f5f5f5;
  color: #999;
}

::v-deep .el-tree-node__content {
  height: 36px;
}

::v-deep .el-tree-node {
  margin-bottom: 5px;
}

::v-deep .el-dialog__body {
  max-height: 500px;
  overflow-y: auto;
}
</style>
