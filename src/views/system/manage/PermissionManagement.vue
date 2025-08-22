<template>
  <div class="content-wrapper">
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import AuthAPI from '@/api/AuthAPI.js';

// 权限数据
const permissions = ref([]);
const loadingPermissions = ref(false);

// 权限管理相关状态
const showEditPermissionDialog = ref(false);
const formPermission = ref({
  id: '',
  permName: '',
  description: ''
});
const permissionFormRef = ref(null);

// 生命周期钩子
onMounted(() => {
  fetchPermissions();
});

// 方法 - 获取权限列表
const fetchPermissions = async () => {
  try {
    loadingPermissions.value = true;
    const response = await AuthAPI.getPermissionList();
    permissions.value = response.data.data;
  } catch (error) {
    ElMessage.error('获取权限列表失败');
    console.error(error);
  } finally {
    loadingPermissions.value = false;
  }
};

// 方法 - 编辑权限
const handleEditPermission = (permission) => {
  formPermission.value = {...permission};
  showEditPermissionDialog.value = true;
};

// 方法 - 提交权限表单
const submitPermissionForm = async () => {
  try {
    await permissionFormRef.value.validate();

    await AuthAPI.updatePermission(formPermission.value.id, formPermission.value);
    ElMessage.success('权限编辑成功');
    showEditPermissionDialog.value = false;
    fetchPermissions();
  } catch (error) {
    console.error('表单验证失败', error);
    ElMessage.error(error.response?.data?.message || '操作失败');
  }
};

// 方法 - 删除权限
const handleDeletePermission = async (permissionId) => {
  try {
    await ElMessageBox.confirm('确定要删除该权限吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await AuthAPI.deletePermission(permissionId);
    ElMessage.success('权限删除成功');
    fetchPermissions();
  } catch (error) {
    if (error === 'cancel') return;
    ElMessage.error('权限删除失败');
    console.error(error);
  }
};
</script>

<style scoped>
.content-wrapper {
  padding: 20px;
}

.content-header {
  margin-bottom: 20px;
}

::v-deep .permission-tree {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 10px;
}
</style>
