<template>
  <el-container class="app-container">
    <el-container>
      <!-- 侧边栏导航 -->
      <el-aside width="200px" class="app-aside">
        <el-menu
            default-active="department-management"
            class="menu-sidebar"
            @select="handleMenuSelect"
        >
          <el-menu-item index="department-management">
            <el-icon><OfficeBuilding /></el-icon>
            <span>部门管理</span>
          </el-menu-item>
          <el-menu-item index="approval-level">
            <el-icon><Search /></el-icon>
            <span>审批层级</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-main class="app-main">
        <!-- 部门管理页面 -->
        <div v-if="activeMenu === 'department-management'" class="content-wrapper">
          <div class="content-header">
            <h2>部门管理</h2>
            <el-button type="primary" @click="showAddDepartmentDialog = true">
              <el-icon><Plus /></el-icon>
              新增部门
            </el-button>
          </div>

          <div class="search-bar">
            <el-input
                v-model="deptSearchQuery"
                placeholder="搜索部门"
                prefix-icon="Search"
                class="search-input"
            ></el-input>
            <el-select
                v-model="deptStatusFilter"
                placeholder="部门状态"
                class="status-filter"
                clearable
            >
              <!-- 修改点1：状态值调整 -->
              <el-option label="启用" value="0"></el-option>
              <el-option label="禁用" value="1"></el-option>
            </el-select>
          </div>

          <el-table
              :data="filteredDepartments"
              border
              style="width: 100%; margin-top: 16px;"
              :row-class-name="tableRowClassName"
          >
            <el-table-column prop="id" label="ID" width="80"></el-table-column>
            <el-table-column prop="name" label="部门名称"></el-table-column>
            <el-table-column label="上级部门">
              <template #default="scope">
                {{ getParentDeptName(scope.row.parentId) || '无' }}
              </template>
            </el-table-column>
            <el-table-column prop="description" label="部门描述"></el-table-column>
            <el-table-column label="状态">
              <template #default="scope">
                <!-- 修改点2：开关状态值调整 -->
                <el-switch
                    v-model="scope.row.status"
                    :active-value="0"
                    :inactive-value="1"
                    @change="handleDeptStatusChange(scope.row)"
                ></el-switch>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button
                    size="small"
                    @click="handleEditDepartment(scope.row)"
                >
                  编辑
                </el-button>
                <el-button
                    size="small"
                    type="danger"
                    @click="handleDeleteDepartment(scope.row.id)"
                    :disabled="hasChildren(scope.row.id)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 审批层级页面 -->
        <div v-if="activeMenu === 'approval-level'" class="content-wrapper">
          <div class="content-header">
            <h2>审批层级管理</h2>
            <el-button type="primary" @click="showAddApprovalDialog = true">
              <el-icon><Plus /></el-icon>
              新增审批层级
            </el-button>
          </div>

          <div class="search-bar">
            <el-input
                v-model="approvalSearchQuery"
                placeholder="搜索审批名称"
                prefix-icon="Search"
                class="search-input"
            ></el-input>
            <el-select
                v-model="approvalDeptFilter"
                placeholder="选择部门"
                class="dept-filter"
                clearable
            >
              <el-option label="全公司" value="0"></el-option>
              <el-option
                  v-for="dept in departments"
                  :key="dept.id"
                  :label="dept.name"
                  :value="dept.id"
              ></el-option>
            </el-select>
          </div>

          <el-table
              :data="filteredApprovals"
              border
              style="width: 100%; margin-top: 16px;"
          >
            <el-table-column prop="id" label="ID" width="80"></el-table-column>
            <el-table-column prop="name" label="审批名称"></el-table-column>
            <el-table-column prop="level" label="审批层级"></el-table-column>
            <el-table-column prop="departmentName" label="适用部门"></el-table-column>
            <el-table-column label="审批人">
              <template #default="scope">
                <el-tag
                    v-for="(name, index) in scope.row.approverNames"
                    :key="index"
                    style="margin-right: 5px;"
                >
                  {{ name }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述"></el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button
                    size="small"
                    @click="handleEditApproval(scope.row)"
                >
                  编辑
                </el-button>
                <el-button
                    size="small"
                    type="danger"
                    @click="handleDeleteApproval(scope.row.id)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-main>
    </el-container>

    <!-- 新增/编辑部门对话框 -->
    <el-dialog
        title="部门信息"
        v-model="showAddDepartmentDialog"
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
              clearable
          >
            <el-option
                v-for="dept in departments.filter(d => !formDepartment.id || d.id !== formDepartment.id)"
                :key="dept.id"
                :label="dept.name"
                :value="dept.id"
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
        <el-form-item label="状态">
          <!-- 修改点3：对话框开关状态值调整 -->
          <el-switch
              v-model="formDepartment.status"
              :active-value="0"
              :inactive-value="1"
          ></el-switch>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDepartmentDialog = false">取消</el-button>
        <el-button
            type="primary"
            @click="submitDepartmentForm"
        >
          确认
        </el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑审批层级对话框 -->
    <el-dialog
        title="审批层级信息"
        v-model="showAddApprovalDialog"
        width="600px"
    >
      <el-form
          :model="formApproval"
          :rules="approvalRules"
          ref="approvalFormRef"
          label-width="100px"
      >
        <el-form-item label="审批名称" prop="name">
          <el-input v-model="formApproval.name"></el-input>
        </el-form-item>
        <el-form-item label="审批层级" prop="level">
          <el-input v-model.number="formApproval.level" type="number" min="1"></el-input>
        </el-form-item>
        <el-form-item label="适用部门" prop="departmentId">
          <el-select
              v-model="formApproval.departmentId"
              placeholder="请选择适用部门"
          >
            <el-option label="全公司" value="0"></el-option>
            <el-option
                v-for="dept in departments"
                :key="dept.id"
                :label="dept.name"
                :value="dept.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="审批人" prop="approverIds">
          <el-select
              v-model="formApproval.approverIds"
              multiple
              placeholder="请选择审批人"
          >
            <el-option
                v-for="user in users"
                :key="user.id"
                :label="user.userName"
                :value="user.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
              v-model="formApproval.description"
              type="textarea"
              :rows="3"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddApprovalDialog = false">取消</el-button>
        <el-button
            type="primary"
            @click="submitApprovalForm"
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
  OfficeBuilding, Plus, Search
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import DepartmentApprovalAPI from '@/api/DepartmentApprovalAPI.js';

// 全局状态
const activeMenu = ref('department-management');

// 部门数据
const departments = ref([]);
const loadingDepartments = ref(false);

// 审批层级数据
const approvals = ref([]);
const loadingApprovals = ref(false);

// 用户数据（用于审批人选择）
const users = ref([]);

// 部门管理相关状态
const deptSearchQuery = ref('');
const deptStatusFilter = ref('');
const showAddDepartmentDialog = ref(false);
const formDepartment = ref({
  id: undefined,
  name: '',
  parentId: null,
  description: '',
  // 修改点4：初始状态设置为启用(0)
  status: 0
});
const departmentRules = ref({
  name: [
    { required: true, message: '请输入部门名称', trigger: 'blur' },
    { min: 2, max: 50, message: '部门名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '部门描述不能超过 200 个字符', trigger: 'blur' }
  ]
});
const departmentFormRef = ref(null);

// 审批层级相关状态
const approvalSearchQuery = ref('');
const approvalDeptFilter = ref('');
const showAddApprovalDialog = ref(false);
const formApproval = ref({
  id: undefined,
  name: '',
  level: 1,
  departmentId: null,
  approverIds: [],
  description: ''
});
const approvalRules = ref({
  name: [
    { required: true, message: '请输入审批名称', trigger: 'blur' },
    { min: 2, max: 50, message: '审批名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  level: [
    { required: true, message: '请输入审批层级', trigger: 'blur' },
    { type: 'number', min: 1, message: '审批层级必须大于 0', trigger: 'blur' }
  ],
  departmentId: [
    { required: true, message: '请选择适用部门', trigger: 'change' }
  ],
  approverIds: [
    { required: true, message: '请选择至少一个审批人', trigger: 'change' },
    { type: 'array', min: 1, message: '至少选择一个审批人', trigger: 'change' }
  ]
});
const approvalFormRef = ref(null);

// 计算属性 - 筛选部门
const filteredDepartments = computed(() => {
  return departments.value.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(deptSearchQuery.value.toLowerCase()) ||
        dept.description.toLowerCase().includes(deptSearchQuery.value.toLowerCase());
    const matchesStatus = !deptStatusFilter.value || dept.status === Number(deptStatusFilter.value);

    return matchesSearch && matchesStatus;
  });
});

// 计算属性 - 筛选审批层级
const filteredApprovals = computed(() => {
  return approvals.value.filter(approval => {
    const matchesSearch = approval.name.toLowerCase().includes(approvalSearchQuery.value.toLowerCase()) ||
        approval.description.toLowerCase().includes(approvalSearchQuery.value.toLowerCase());
    const matchesDept = !approvalDeptFilter.value || approval.departmentId === Number(approvalDeptFilter.value);

    return matchesSearch && matchesDept;
  });
});

// 生命周期钩子
onMounted(() => {
  fetchDepartments();
  fetchApprovals();
  fetchUsers();
});

// 方法 - 菜单切换
const handleMenuSelect = (index) => {
  activeMenu.value = index;
};

// 方法 - 部门管理
const fetchDepartments = async () => {
  try {
    loadingDepartments.value = true;
    const response = await DepartmentApprovalAPI.getDepartmentList();
    departments.value = response.data.data;
  } catch (error) {
    ElMessage.error('获取部门列表失败');
    console.error(error);
  } finally {
    loadingDepartments.value = false;
  }
};

const handleEditDepartment = (dept) => {
  formDepartment.value = { ...dept };
  showAddDepartmentDialog.value = true;
};

const submitDepartmentForm = async () => {
  try {
    await departmentFormRef.value.validate();

    if (formDepartment.value.id) {
      // 编辑现有部门
      await DepartmentApprovalAPI.updateDepartment(formDepartment.value.id, formDepartment.value);
      ElMessage.success('部门编辑成功');
    } else {
      // 创建新部门
      await DepartmentApprovalAPI.createDepartment(formDepartment.value);
      ElMessage.success('部门创建成功');
    }

    showAddDepartmentDialog.value = false;
    departmentFormRef.value.resetFields();
    fetchDepartments();
  } catch (error) {
    console.error('表单验证失败', error);
    ElMessage.error(error.response?.data?.message || '操作失败');
  }
};

// 修改点5：状态改变处理
const handleDeptStatusChange = async (dept) => {
  try {
    await DepartmentApprovalAPI.updateDepartment(dept.id, {
      ...dept,
      status: dept.status
    });
    fetchDepartments();
    // 修改点6：状态提示语调整
    const statusText = dept.status === 0 ? '启用' : '禁用';
    ElMessage.success(`部门已${statusText}`);
  } catch (error) {
    ElMessage.error('状态更新失败');
    console.error(error);
    // 失败时恢复状态
    fetchDepartments();
  }
};

const handleDeleteDepartment = (deptId) => {
  const dept = departments.value.find(d => d.id === deptId);
  if (!dept) return;

  ElMessageBox.confirm(
      `确定要删除部门 ${dept.name} 吗？删除操作可能会导致系统数据不完整，请谨慎操作！`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(async () => {
    try {
      await DepartmentApprovalAPI.deleteDepartment(deptId);
      ElMessage.success('部门删除成功');
      fetchDepartments(); // 刷新部门列表
    } catch (error) {
      ElMessage.error(error.response?.data?.message || '删除失败');
      console.error('删除部门失败', error);
    }
  }).catch(() => {
    // 取消删除
    ElMessage.info('已取消删除操作');
  });
};

// 方法 - 审批层级管理
const fetchApprovals = async () => {
  try {
    loadingApprovals.value = true;
    const response = await DepartmentApprovalAPI.getApprovalLevelList();
    approvals.value = response.data.data;
  } catch (error) {
    ElMessage.error('获取审批层级列表失败');
    console.error(error);
  } finally {
    loadingApprovals.value = false;
  }
};

const fetchUsers = async () => {
  try {
    const response = await DepartmentApprovalAPI.getUserList();
    users.value = response.data.data;
  } catch (error) {
    ElMessage.error('获取用户列表失败');
    console.error(error);
  }
};

const handleEditApproval = (approval) => {
  formApproval.value = { ...approval };
  showAddApprovalDialog.value = true;
};

const submitApprovalForm = async () => {
  try {
    await approvalForm极.value.validate();

    if (formApproval.value.id) {
      // 编辑现有审批层级
      await DepartmentApprovalAPI.updateApprovalLevel(formApproval.value.id, formApproval.value);
      ElMessage.success('审批层级编辑成功');
    } else {
      // 创建新审批层级
      await DepartmentApprovalAPI.createApprovalLevel(formApproval.value);
      ElMessage.success('审批层级创建成功');
    }

    showAddApprovalDialog.value = false;
    approvalFormRef.value.resetFields();
    fetchApprovals();
  } catch (error) {
    console.error('表单验证失败', error);
    ElMessage.error(error.response?.data?.message || '操作失败');
  }
};

const handleDeleteApproval = (approvalId) => {
  const approval = approvals.value.find(a => a.id === approvalId);
  if (!approval) return;

  ElMessageBox.confirm(
      `确定要删除审批层级 ${approval.name} 吗？删除操作可能会导致系统数据不完整，请谨慎操作！`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(async () => {
    try {
      await DepartmentApprovalAPI.deleteApprovalLevel(approvalId);
      ElMessage.success('审批层级删除成功');
      fetchApprovals();
    } catch (error) {
      ElMessage.error(error.response?.data?.message || '删除失败');
    }
  }).catch(() => {
    // 取消删除
  });
};

// 辅助方法
const getParentDeptName = (parentId) => {
  if (!parentId) return '';
  const dept = departments.value.find(d => d.id === parentId);
  return dept ? dept.name : '未知部门';
};

const hasChildren = (deptId) => {
  return departments.value.some(d => d.parentId === deptId);
};

// 修改点7：行样式调整
const tableRowClassName = ({ row }) => {
  return row.status === 1 ? 'row-disabled' : '';
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
  margin-bottom: 16px;
}

.search-input {
  width: 300px;
}

.status-filter, .dept-filter {
  width: 180px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

/* 修改点8：样式调整 */
::v-deep .row-disabled {
  background-color: #f5f5f5;
  color: #999;
}

::v-deep .el-dialog__body {
  max-height: 500px;
  overflow-y: auto;
}
</style>
