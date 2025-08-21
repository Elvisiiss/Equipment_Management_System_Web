<template>
  <div class="part-list">
    <div class="filters">
      <el-select v-model="filters.typeId" placeholder="按类型筛选" clearable>
        <el-option
            v-for="type in partTypes"
            :key="type.id"
            :label="type.name"
            :value="type.id"
        />
      </el-select>

      <el-select v-model="filters.hasUniqueCode" placeholder="按编码类型筛选" clearable>
        <el-option label="有唯一编码" :value="true" />
        <el-option label="无唯一编码" :value="false" />
      </el-select>

      <el-checkbox v-model="filters.lowStock">仅显示低库存</el-checkbox>

      <el-button type="primary" @click="loadParts">筛选</el-button>
      <el-button type="success" @click="showAddDialog = true">新增备件</el-button>
    </div>

    <el-table :data="parts" style="width: 100%">
      <el-table-column prop="name" label="备件名称" />
      <el-table-column prop="brand" label="品牌" />
      <el-table-column prop="specification" label="规格" />
      <el-table-column label="类型">
        <template #default="scope">
          {{ getTypeName(scope.row.typeId) }}
        </template>
      </el-table-column>
      <el-table-column label="编码类型">
        <template #default="scope">
          <el-tag :type="scope.row.hasUniqueCode ? 'warning' : 'info'">
            {{ scope.row.hasUniqueCode ? '有唯一编码' : '无唯一编码' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="totalQuantity" label="总数" />
      <el-table-column prop="availableQuantity" label="可用数" />
      <el-table-column label="库存状态">
        <template #default="scope">
          <el-tag
              :type="scope.row.availableQuantity <= scope.row.minStock ? 'danger' : 'success'"
          >
            {{ scope.row.availableQuantity <= scope.row.minStock ? '低库存' : '正常' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="viewDetails(scope.row)">详情</el-button>
          <el-button size="small" @click="editPart(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deletePart(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑备件对话框 -->
    <el-dialog v-model="showAddDialog" :title="isEditing ? '编辑备件' : '新增备件'" width="600px">
      <el-form :model="partForm" label-width="100px">
        <el-form-item label="备件名称">
          <el-input v-model="partForm.name" />
        </el-form-item>
        <el-form-item label="品牌">
          <el-input v-model="partForm.brand" />
        </el-form-item>
        <el-form-item label="规格">
          <el-input v-model="partForm.specification" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="partForm.typeId">
            <el-option
                v-for="type in partTypes"
                :key="type.id"
                :label="type.name"
                :value="type.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="编码类型">
          <el-radio-group v-model="partForm.hasUniqueCode">
            <el-radio :label="true">有唯一编码</el-radio>
            <el-radio :label="false">无唯一编码</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="总数">
          <el-input-number v-model="partForm.totalQuantity" :min="0" />
        </el-form-item>
        <el-form-item label="最低库存">
          <el-input-number v-model="partForm.minStock" :min="0" />
        </el-form-item>
        <el-form-item v-if="partForm.hasUniqueCode" label="唯一编码">
          <el-tag
              v-for="code in partForm.uniqueCodes"
              :key="code"
              closable
              @close="removeUniqueCode(code)"
              style="margin-right: 5px;"
          >
            {{ code }}
          </el-tag>
          <el-input
              v-model="newUniqueCode"
              placeholder="输入编码后按回车添加"
              @keyup.enter="addUniqueCode"
              style="width: 200px; margin-top: 5px;"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="savePart">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { usePartsStore } from '@/store/partsStore';
import { ElMessage, ElMessageBox } from 'element-plus';

const props = defineProps({
  warehouseId: Number
});

const partsStore = usePartsStore();
const emit = defineEmits(['partSelected']);

const parts = ref([]);
const partTypes = ref([]);
const showAddDialog = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const newUniqueCode = ref('');

const filters = reactive({
  typeId: null,
  hasUniqueCode: null,
  lowStock: false
});

const partForm = reactive({
  name: '',
  brand: '',
  specification: '',
  typeId: null,
  hasUniqueCode: false,
  totalQuantity: 0,
  availableQuantity: 0,
  minStock: 0,
  uniqueCodes: []
});

onMounted(async () => {
  await loadPartTypes();
  await loadParts();
});

const loadParts = async () => {
  const filterParams = { ...filters };
  if (props.warehouseId) {
    filterParams.warehouseId = props.warehouseId;
  }

  await partsStore.loadParts(filterParams);
  parts.value = partsStore.parts;
};

const loadPartTypes = async () => {
  await partsStore.loadPartTypes();
  partTypes.value = partsStore.partTypes;
};

const getTypeName = (typeId) => {
  const type = partTypes.value.find(t => t.id === typeId);
  return type ? type.name : '未知';
};

const viewDetails = (part) => {
  emit('partSelected', part);
};

const editPart = (part) => {
  isEditing.value = true;
  editingId.value = part.id;
  Object.assign(partForm, { ...part });
  showAddDialog.value = true;
};

const deletePart = async (part) => {
  try {
    await ElMessageBox.confirm(`确定要删除备件 "${part.name}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    // 在实际应用中，这里应该调用API删除备件
    ElMessage.success('删除成功');
    await loadParts();
  } catch (error) {
    ElMessage.info('已取消删除');
  }
};

const addUniqueCode = () => {
  if (newUniqueCode.value && !partForm.uniqueCodes.includes(newUniqueCode.value)) {
    partForm.uniqueCodes.push(newUniqueCode.value);
    newUniqueCode.value = '';
  }
};

const removeUniqueCode = (code) => {
  const index = partForm.uniqueCodes.indexOf(code);
  if (index !== -1) {
    partForm.uniqueCodes.splice(index, 1);
  }
};

const savePart = async () => {
  try {
    if (isEditing.value) {
      // 在实际应用中，这里应该调用API更新备件
      const index = parts.value.findIndex(p => p.id === editingId.value);
      if (index !== -1) {
        Object.assign(parts.value[index], partForm);
      }
      ElMessage.success('更新成功');
    } else {
      // 在实际应用中，这里应该调用API添加备件
      const newPart = {
        id: Date.now(),
        ...partForm,
        availableQuantity: partForm.totalQuantity
      };
      parts.value.push(newPart);
      ElMessage.success('添加成功');
    }

    showAddDialog.value = false;
    resetForm();
  } catch (error) {
    ElMessage.error('操作失败');
  }
};

const resetForm = () => {
  partForm.name = '';
  partForm.brand = '';
  partForm.specification = '';
  partForm.typeId = null;
  partForm.hasUniqueCode = false;
  partForm.totalQuantity = 0;
  partForm.minStock = 0;
  partForm.uniqueCodes = [];
  isEditing.value = false;
  editingId.value = null;
};
</script>

<style scoped>
.filters {
  margin-bottom: 15px;
}

.filters > * {
  margin-right: 10px;
}
</style>
