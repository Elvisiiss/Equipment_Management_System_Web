<template>
  <div class="warehouse-list">
    <div class="toolbar">
      <el-button type="primary" @click="showAddDialog = true">新增仓库</el-button>
    </div>

    <el-table :data="warehouses" style="width: 100%">
      <el-table-column prop="name" label="仓库名称" />
      <el-table-column prop="location" label="位置" />
      <el-table-column prop="type" label="类型">
        <template #default="scope">
          <el-tag :type="scope.row.type === 'main' ? 'primary' : 'success'">
            {{ scope.row.type === 'main' ? '主仓库' : '线边仓' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="selectWarehouse(scope.row)">选择</el-button>
          <el-button size="small" @click="editWarehouse(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteWarehouse(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑仓库对话框 -->
    <el-dialog v-model="showAddDialog" :title="isEditing ? '编辑仓库' : '新增仓库'">
      <el-form :model="warehouseForm" label-width="80px">
        <el-form-item label="仓库名称">
          <el-input v-model="warehouseForm.name" />
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="warehouseForm.location" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="warehouseForm.type">
            <el-option label="主仓库" value="main" />
            <el-option label="线边仓" value="sub" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveWarehouse">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { usePartsStore } from '@/store/partsStore';
import { ElMessage, ElMessageBox } from 'element-plus';

const partsStore = usePartsStore();
const emit = defineEmits(['warehouseSelected']);

const warehouses = ref([]);
const showAddDialog = ref(false);
const isEditing = ref(false);
const editingId = ref(null);

const warehouseForm = reactive({
  name: '',
  location: '',
  type: 'main'
});

onMounted(async () => {
  await loadWarehouses();
});

const loadWarehouses = async () => {
  await partsStore.loadWarehouses();
  warehouses.value = partsStore.warehouses;
};

const selectWarehouse = (warehouse) => {
  emit('warehouseSelected', warehouse);
};

const editWarehouse = (warehouse) => {
  isEditing.value = true;
  editingId.value = warehouse.id;
  Object.assign(warehouseForm, warehouse);
  showAddDialog.value = true;
};

const deleteWarehouse = async (warehouse) => {
  try {
    await ElMessageBox.confirm(`确定要删除仓库 "${warehouse.name}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    // 在实际应用中，这里应该调用API删除仓库
    ElMessage.success('删除成功');
    await loadWarehouses();
  } catch (error) {
    ElMessage.info('已取消删除');
  }
};

const saveWarehouse = async () => {
  try {
    if (isEditing.value) {
      // 在实际应用中，这里应该调用API更新仓库
      const index = warehouses.value.findIndex(w => w.id === editingId.value);
      if (index !== -1) {
        Object.assign(warehouses.value[index], warehouseForm);
      }
      ElMessage.success('更新成功');
    } else {
      // 在实际应用中，这里应该调用API添加仓库
      const newWarehouse = {
        id: Date.now(),
        ...warehouseForm
      };
      warehouses.value.push(newWarehouse);
      ElMessage.success('添加成功');
    }

    showAddDialog.value = false;
    resetForm();
  } catch (error) {
    ElMessage.error('操作失败');
  }
};

const resetForm = () => {
  warehouseForm.name = '';
  warehouseForm.location = '';
  warehouseForm.type = 'main';
  isEditing.value = false;
  editingId.value = null;
};
</script>

<style scoped>
.toolbar {
  margin-bottom: 15px;
}
</style>
