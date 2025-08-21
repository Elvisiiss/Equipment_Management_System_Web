<template>
  <div class="mold-management">
    <div class="header">
      <h2>模/治具管理</h2>
      <el-button type="primary" @click="showAddDialog = true">新增模/治具</el-button>
    </div>

    <el-table :data="molds" style="width: 100%" v-loading="loading">
      <el-table-column prop="code" label="模具编号" width="120" />
      <el-table-column prop="name" label="模具名称" width="150" />
      <el-table-column prop="type" label="模具类型" width="120" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="location" label="存放位置" width="120" />
      <el-table-column prop="borrower" label="当前借用人" width="120">
        <template #default="scope">
          {{ scope.row.borrower || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="currentUsage" label="使用次数" width="100" />
      <el-table-column label="操作" width="280">
        <template #default="scope">
          <el-button size="small" @click="viewDetails(scope.row.id)">详情</el-button>
          <el-button
              size="small"
              type="primary"
              :disabled="scope.row.status !== '可用'"
              @click="borrowMold(scope.row)"
          >
            借用
          </el-button>
          <el-button
              size="small"
              type="warning"
              :disabled="scope.row.status !== '已借用'"
              @click="returnMold(scope.row)"
          >
            归还
          </el-button>
          <el-button size="small" type="danger" @click="deleteMold(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增模具对话框 -->
    <el-dialog v-model="showAddDialog" title="新增模具" width="600px">
      <el-form :model="newMold" label-width="100px">
        <el-form-item label="模具编号">
          <el-input v-model="newMold.code" />
        </el-form-item>
        <el-form-item label="模具名称">
          <el-input v-model="newMold.name" />
        </el-form-item>
        <el-form-item label="模具类型">
          <el-select v-model="newMold.type" placeholder="请选择">
            <el-option label="注塑模具" value="注塑模具" />
            <el-option label="压铸模具" value="压铸模具" />
            <el-option label="冲压模具" value="冲压模具" />
            <el-option label="治具" value="治具" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="存放位置">
          <el-input v-model="newMold.location" />
        </el-form-item>
        <el-form-item label="制造商">
          <el-input v-model="newMold.manufacturer" />
        </el-form-item>
        <el-form-item label="制造日期">
          <el-date-picker v-model="newMold.manufactureDate" type="date" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="设计寿命">
          <el-input-number v-model="newMold.lifespan" :min="1" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="newMold.notes" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="addMold">确定</el-button>
      </template>
    </el-dialog>

    <!-- 借用模具对话框 -->
    <el-dialog v-model="showBorrowDialog" title="借用模具" width="400px">
      <el-form :model="borrowForm" label-width="80px">
        <el-form-item label="借用人">
          <el-input v-model="borrowForm.borrower" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showBorrowDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmBorrow">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { moldAPI } from '@/api/mold/moldAPIdb';

const router = useRouter();
const molds = ref([]);
const loading = ref(false);
const showAddDialog = ref(false);
const showBorrowDialog = ref(false);
const selectedMold = ref(null);

const newMold = ref({
  code: '',
  name: '',
  type: '',
  location: '',
  manufacturer: '',
  manufactureDate: new Date().toISOString().split('T')[0],
  lifespan: 10000,
  notes: ''
});

const borrowForm = ref({
  borrower: ''
});

onMounted(() => {
  loadMolds();
});

const loadMolds = async () => {
  loading.value = true;
  try {
    molds.value = await moldAPI.getMolds();
  } catch (error) {
    ElMessage.error('加载模具列表失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};

const getStatusType = (status) => {
  const statusMap = {
    '可用': 'success',
    '已借用': 'primary',
    '维修中': 'danger',
    '保养中': 'warning'
  };
  return statusMap[status] || 'info';
};

const viewDetails = (id) => {
  router.push(`/mold/detail/${id}`);
};

const borrowMold = (mold) => {
  selectedMold.value = mold;
  borrowForm.value.borrower = '';
  showBorrowDialog.value = true;
};

const confirmBorrow = async () => {
  if (!borrowForm.value.borrower.trim()) {
    ElMessage.warning('请输入借用人姓名');
    return;
  }

  try {
    await moldAPI.borrowMold(selectedMold.value.id, borrowForm.value.borrower);
    ElMessage.success('借用成功');
    showBorrowDialog.value = false;
    loadMolds();
  } catch (error) {
    ElMessage.error('借用失败: ' + error.message);
  }
};

const returnMold = async (mold) => {
  try {
    await ElMessageBox.confirm(`确定要归还模具 ${mold.name} 吗?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await moldAPI.returnMold(mold.id);
    ElMessage.success('归还成功');
    loadMolds();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('归还失败: ' + error.message);
    }
  }
};

const deleteMold = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个模具吗?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await moldAPI.deleteMold(id);
    ElMessage.success('删除成功');
    loadMolds();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + error.message);
    }
  }
};

const addMold = async () => {
  try {
    await moldAPI.addMold(newMold.value);
    ElMessage.success('添加成功');
    showAddDialog.value = false;
    // 重置表单
    newMold.value = {
      code: '',
      name: '',
      type: '',
      location: '',
      manufacturer: '',
      manufactureDate: new Date().toISOString().split('T')[0],
      lifespan: 10000,
      notes: ''
    };
    loadMolds();
  } catch (error) {
    ElMessage.error('添加失败: ' + error.message);
  }
};
</script>

<style scoped>
.mold-management {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>
