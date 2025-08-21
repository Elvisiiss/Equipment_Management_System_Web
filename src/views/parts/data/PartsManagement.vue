<template>
  <div class="parts-management">
    <div class="header">
      <h1>备件管理系统</h1>
      <el-alert
          v-if="lowStockParts.length > 0"
          title="库存预警"
          type="warning"
          :description="`有 ${lowStockParts.length} 种备件库存低于安全线`"
          show-icon
          class="warning-alert"
      />
    </div>

    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="仓库管理" name="warehouses">
        <WarehouseList @warehouse-selected="handleWarehouseSelected" />
      </el-tab-pane>

      <el-tab-pane label="备件管理" name="parts">
        <PartList :warehouse-id="currentWarehouse?.id" />
      </el-tab-pane>

      <el-tab-pane label="借用管理" name="borrow">
        <BorrowManagement />
      </el-tab-pane>

      <el-tab-pane v-if="selectedPart && selectedPart.hasUniqueCode" label="生命周期" name="lifecycle">
        <LifecycleManagement :part="selectedPart" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { usePartsStore } from '@/store/partsStore';
import WarehouseList from './WarehouseList.vue';
import PartList from './PartList.vue';
import BorrowManagement from './BorrowManagement.vue';
import LifecycleManagement from './LifecycleManagement.vue';

const partsStore = usePartsStore();
const activeTab = ref('warehouses');
const currentWarehouse = ref(null);
const selectedPart = ref(null);

const lowStockParts = computed(() => partsStore.lowStockParts);

const handleWarehouseSelected = (warehouse) => {
  currentWarehouse.value = warehouse;
  activeTab.value = 'parts';
};

const handlePartSelected = (part) => {
  selectedPart.value = part;
  if (part.hasUniqueCode) {
    activeTab.value = 'lifecycle';
  }
};
</script>

<style scoped>
.parts-management {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.warning-alert {
  margin-left: 20px;
}
</style>
