<template>
  <div class="mold-detail" v-loading="loading">
    <div v-if="mold">
      <div class="header">
        <h2>模具详情 - {{ mold.name }} ({{ mold.code }})</h2>
        <el-button @click="$router.go(-1)">返回</el-button>
      </div>

      <el-tabs type="border-card">
        <el-tab-pane label="基本信息">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="模具编号">{{ mold.code }}</el-descriptions-item>
            <el-descriptions-item label="模具名称">{{ mold.name }}</el-descriptions-item>
            <el-descriptions-item label="模具类型">{{ mold.type }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusType(mold.status)">{{ mold.status }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="存放位置">{{ mold.location }}</el-descriptions-item>
            <el-descriptions-item label="制造商">{{ mold.manufacturer }}</el-descriptions-item>
            <el-descriptions-item label="制造日期">{{ mold.manufactureDate }}</el-descriptions-item>
            <el-descriptions-item label="设计寿命">{{ mold.lifespan }} 次</el-descriptions-item>
            <el-descriptions-item label="已使用次数">{{ mold.currentUsage }} 次</el-descriptions-item>
            <el-descriptions-item label="剩余寿命">{{ mold.lifespan - mold.currentUsage }} 次</el-descriptions-item>
            <el-descriptions-item label="最后保养">{{ mold.lastMaintenance || '无记录' }}</el-descriptions-item>
            <el-descriptions-item label="下次保养">{{ mold.nextMaintenance || '未计划' }}</el-descriptions-item>
            <el-descriptions-item label="当前借用人" :span="2">{{ mold.borrower || '无' }}</el-descriptions-item>
            <el-descriptions-item label="借用日期">{{ mold.borrowDate || '-' }}</el-descriptions-item>
            <el-descriptions-item label="归还日期">{{ mold.returnDate || '-' }}</el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{ mold.notes || '无' }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="BOM管理">
          <div class="bom-header">
            <h3>物料清单 (BOM)</h3>
            <el-button type="primary" size="small" @click="addBomItem">添加物料</el-button>
          </div>

          <el-table :data="bom.items" style="width: 100%">
            <el-table-column prop="name" label="物料名称" width="150" />
            <el-table-column prop="material" label="材质" width="120" />
            <el-table-column prop="specification" label="规格" width="180" />
            <el-table-column prop="quantity" label="数量" width="80" />
            <el-table-column prop="supplier" label="供应商" width="150" />
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button size="small" @click="editBomItem(scope.row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteBomItem(scope.row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="生命周期记录">
          <MoldLifecycle :records="lifecycle.records" />
        </el-tab-pane>
      </el-tabs>

      <!-- BOM项目编辑对话框 -->
      <el-dialog
          v-model="showBomDialog"
          :title="editingBomItem ? '编辑物料' : '添加物料'"
          width="500px"
      >
        <el-form :model="bomForm" label-width="80px">
          <el-form-item label="物料名称">
            <el-input v-model="bomForm.name" />
          </el-form-item>
          <el-form-item label="材质">
            <el-input v-model="bomForm.material" />
          </el-form-item>
          <el-form-item label="规格">
            <el-input v-model="bomForm.specification" />
          </el-form-item>
          <el-form-item label="数量">
            <el-input-number v-model="bomForm.quantity" :min="1" />
          </el-form-item>
          <el-form-item label="供应商">
            <el-input v-model="bomForm.supplier" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showBomDialog = false">取消</el-button>
          <el-button type="primary" @click="saveBomItem">保存</el-button>
        </template>
      </el-dialog>
    </div>

    <div v-else class="not-found">
      <el-result icon="error" title="模具不存在" sub-title="请检查模具ID是否正确">
        <template #extra>
          <el-button type="primary" @click="$router.push('/mold')">返回管理页</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { moldAPI } from '@/api/mold/moldAPIdb';
import MoldLifecycle from '../components/MoldLifecycle.vue';

const route = useRoute();
const moldId = route.params.id;
const mold = ref(null);
const bom = ref({ items: [] });
const lifecycle = ref({ records: [] });
const loading = ref(false);
const showBomDialog = ref(false);
const editingBomItem = ref(null);

const bomForm = ref({
  name: '',
  material: '',
  specification: '',
  quantity: 1,
  supplier: ''
});

onMounted(() => {
  loadMoldData();
});

const loadMoldData = async () => {
  loading.value = true;
  try {
    mold.value = await moldAPI.getMoldById(moldId);
    bom.value = await moldAPI.getBomByMoldId(moldId);
    lifecycle.value = await moldAPI.getLifecycleByMoldId(moldId);
  } catch (error) {
    ElMessage.error('加载模具数据失败: ' + error.message);
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

const addBomItem = () => {
  editingBomItem.value = null;
  bomForm.value = {
    name: '',
    material: '',
    specification: '',
    quantity: 1,
    supplier: ''
  };
  showBomDialog.value = true;
};

const editBomItem = (item) => {
  editingBomItem.value = item;
  bomForm.value = { ...item };
  showBomDialog.value = true;
};

const saveBomItem = async () => {
  try {
    const items = [...bom.value.items];

    if (editingBomItem.value) {
      // 更新现有项目
      const index = items.findIndex(item => item.id === editingBomItem.value.id);
      if (index !== -1) {
        items[index] = { ...bomForm.value, id: editingBomItem.value.id };
      }
    } else {
      // 添加新项目
      const newItem = {
        ...bomForm.value,
        id: Math.max(...items.map(item => item.id), 0) + 1
      };
      items.push(newItem);
    }

    await moldAPI.updateBom(moldId, items);
    ElMessage.success('保存成功');
    showBomDialog.value = false;
    bom.value = await moldAPI.getBomByMoldId(moldId);
  } catch (error) {
    ElMessage.error('保存失败: ' + error.message);
  }
};

const deleteBomItem = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个物料吗?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    const items = bom.value.items.filter(item => item.id !== id);
    await moldAPI.updateBom(moldId, items);
    ElMessage.success('删除成功');
    bom.value = await moldAPI.getBomByMoldId(moldId);
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + error.message);
    }
  }
};
</script>

<style scoped>
.mold-detail {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.bom-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
}
</style>
