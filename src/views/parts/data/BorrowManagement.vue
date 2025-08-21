<template>
  <div class="borrow-management">
    <div class="filters">
      <el-select v-model="filters.status" placeholder="按状态筛选" clearable>
        <el-option label="借用中" value="借用中" />
        <el-option label="已归还" value="已归还" />
        <el-option label="已损坏" value="已损坏" />
      </el-select>

      <el-button type="primary" @click="loadBorrowRecords">筛选</el-button>
      <el-button type="success" @click="showBorrowDialog = true">新增借用</el-button>
    </div>

    <el-table :data="borrowRecords" style="width: 100%">
      <el-table-column prop="partName" label="备件名称" />
      <el-table-column prop="borrower" label="借用人" />
      <el-table-column prop="borrowerDepartment" label="借用部门" />
      <el-table-column prop="quantity" label="数量" />
      <el-table-column prop="uniqueCode" label="唯一编码" />
      <el-table-column prop="borrowTime" label="借用时间" width="150" />
      <el-table-column prop="expectedReturnTime" label="预计归还时间" width="150" />
      <el-table-column prop="actualReturnTime" label="实际归还时间" width="150" />
      <el-table-column prop="operator" label="操作人" />
      <el-table-column label="状态">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button
              v-if="scope.row.status === '借用中'"
              size="small"
              type="primary"
              @click="showReturnDialog(scope.row)"
          >
            归还
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 借用对话框 -->
    <el-dialog v-model="showBorrowDialog" title="借用备件" width="600px">
      <el-form :model="borrowForm" label-width="100px">
        <el-form-item label="备件">
          <el-select v-model="borrowForm.partId" @change="handlePartChange">
            <el-option
                v-for="part in availableParts"
                :key="part.id"
                :label="`${part.name} (${part.brand} ${part.specification}) - 可用: ${part.availableQuantity}`"
                :value="part.id"
                :disabled="part.availableQuantity <= 0"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="selectedPart && selectedPart.hasUniqueCode" label="唯一编码">
          <el-select v-model="borrowForm.uniqueCode">
            <el-option
                v-for="code in selectedPart.uniqueCodes"
                :key="code"
                :label="code"
                :value="code"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-else label="数量">
          <el-input-number v-model="borrowForm.quantity" :min="1" :max="selectedPart ? selectedPart.availableQuantity : 1" />
        </el-form-item>
        <el-form-item label="借用人">
          <el-input v-model="borrowForm.borrower" />
        </el-form-item>
        <el-form-item label="借用部门">
          <el-input v-model="borrowForm.borrowerDepartment" />
        </el-form-item>
        <el-form-item label="预计归还时间">
          <el-date-picker
              v-model="borrowForm.expectedReturnTime"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showBorrowDialog = false">取消</el-button>
        <el-button type="primary" @click="saveBorrow">保存</el-button>
      </template>
    </el-dialog>

    <!-- 归还对话框 -->
    <el-dialog v-model="showReturnDialogVisible" title="归还备件" width="500px">
      <el-form :model="returnForm" label-width="100px">
        <el-form-item label="备件名称">
          <span>{{ returningRecord.partName }}</span>
        </el-form-item>
        <el-form-item label="唯一编码" v-if="returningRecord.uniqueCode">
          <span>{{ returningRecord.uniqueCode }}</span>
        </el-form-item>
        <el-form-item label="数量" v-else>
          <span>{{ returningRecord.quantity }}</span>
        </el-form-item>
        <el-form-item label="是否损坏">
          <el-radio-group v-model="returnForm.isDamaged">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="returnForm.notes" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showReturnDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmReturn">确认归还</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { usePartsStore } from '@/store/partsStore';
import { ElMessage } from 'element-plus';

const partsStore = usePartsStore();

const borrowRecords = ref([]);
const availableParts = ref([]);
const showBorrowDialog = ref(false);
const showReturnDialogVisible = ref(false);
const selectedPart = ref(null);
const returningRecord = ref({});

const filters = reactive({
  status: ''
});

const borrowForm = reactive({
  partId: null,
  uniqueCode: null,
  quantity: 1,
  borrower: '',
  borrowerDepartment: '',
  expectedReturnTime: ''
});

const returnForm = reactive({
  isDamaged: false,
  notes: ''
});

onMounted(async () => {
  await loadBorrowRecords();
  await loadAvailableParts();
});

const loadBorrowRecords = async () => {
  await partsStore.loadBorrowRecords(filters);
  borrowRecords.value = partsStore.borrowRecords;
};

const loadAvailableParts = async () => {
  await partsStore.loadParts();
  availableParts.value = partsStore.parts.filter(part => part.availableQuantity > 0);
};

const getStatusType = (status) => {
  switch (status) {
    case '借用中': return 'warning';
    case '已归还': return 'success';
    case '已损坏': return 'danger';
    default: return 'info';
  }
};

const handlePartChange = (partId) => {
  selectedPart.value = availableParts.value.find(part => part.id === partId);
  if (selectedPart.value && selectedPart.value.hasUniqueCode) {
    borrowForm.quantity = 1;
  }
};

const saveBorrow = async () => {
  try {
    // 在实际应用中，这里应该调用API添加借用记录
    const part = availableParts.value.find(p => p.id === borrowForm.partId);
    const newRecord = {
      id: Date.now(),
      ...borrowForm,
      partName: part.name,
      borrowTime: new Date().toLocaleString(),
      status: '借用中',
      operator: '当前用户'
    };

    borrowRecords.value.push(newRecord);

    // 更新库存
    const partIndex = availableParts.value.findIndex(p => p.id === borrowForm.partId);
    if (partIndex !== -1) {
      if (part.hasUniqueCode) {
        availableParts.value[partIndex].availableQuantity -= 1;
      } else {
        availableParts.value[partIndex].availableQuantity -= borrowForm.quantity;
      }
    }

    ElMessage.success('借用成功');
    showBorrowDialog.value = false;
    resetBorrowForm();
  } catch (error) {
    ElMessage.error('操作失败');
  }
};

const showReturnDialog = (record) => {
  returningRecord.value = record;
  showReturnDialogVisible.value = true;
  returnForm.isDamaged = false;
  returnForm.notes = '';
};

const confirmReturn = async () => {
  try {
    // 在实际应用中，这里应该调用API归还备件
    const recordIndex = borrowRecords.value.findIndex(r => r.id === returningRecord.value.id);
    if (recordIndex !== -1) {
      borrowRecords.value[recordIndex].status = returnForm.isDamaged ? '已损坏' : '已归还';
      borrowRecords.value[recordIndex].actualReturnTime = new Date().toLocaleString();
      borrowRecords.value[recordIndex].returnNotes = returnForm.notes;

      // 如果不是损坏且不是唯一编码的备件，恢复库存
      if (!returnForm.isDamaged && !returningRecord.value.uniqueCode) {
        const partIndex = availableParts.value.findIndex(p => p.name === returningRecord.value.partName);
        if (partIndex !== -1) {
          availableParts.value[partIndex].availableQuantity += returningRecord.value.quantity;
        }
      }
    }

    ElMessage.success('归还成功');
    showReturnDialogVisible.value = false;
  } catch (error) {
    ElMessage.error('操作失败');
  }
};

const resetBorrowForm = () => {
  borrowForm.partId = null;
  borrowForm.uniqueCode = null;
  borrowForm.quantity = 1;
  borrowForm.borrower = '';
  borrowForm.borrowerDepartment = '';
  borrowForm.expectedReturnTime = '';
  selectedPart.value = null;
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
