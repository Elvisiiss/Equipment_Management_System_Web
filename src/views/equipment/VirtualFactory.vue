<template>
  <div class="virtual-factory-container">
    <!-- 顶部标题与筛选（模拟截图的“全部、C4车间”等） -->
    <div class="factory-header">
      <div class="filter-group">
        <button
            class="filter-btn"
            :class="{ active: filter === 'all' }"
            @click="filter = 'all'"
        >
          全部
        </button>
        <button
            class="filter-btn"
            :class="{ active: filter === 'c4' }"
            @click="filter = 'c4'"
        >
          C4车间
        </button>
        <button
            class="filter-btn"
            :class="{ active: filter === 'c4_01_11' }"
            @click="filter = 'c4_01_11'"
        >
          C4段别01-11
        </button>
      </div>
      <div class="update-time">数据刷新时间：{{ updateTime }}</div>
    </div>

    <!-- 设备网格容器（严格模拟截图布局） -->
    <div class="factory-grid">
      <!-- 手动模拟截图里的设备排列，共5行左右，根据实际数量调整 -->
      <div
          v-for="(device, index) in filteredDevices"
          :key="device.id"
          class="device-card"
          :style="{ backgroundColor: device.color }"
      >
        {{ device.name }}
      </div>
      <!-- 补全空占位，让布局和截图一致（如果有空白位置） -->
      <div class="device-card empty" v-for="i in emptySlots" :key="'empty-'+i"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// 模拟设备数据（严格对应截图里的设备ID、颜色、位置）
const devices = ref([
  { id: 1, name: 'C4-51-01', color: 'green' },
  { id: 2, name: 'C4-51-02', color: 'gray' },
  { id: 3, name: 'C4-51-03', color: 'green' },
  { id: 4, name: 'C4-51-07', color: 'gray' },
  { id: 5, name: 'C4-51-05', color: 'green' },
  { id: 6, name: 'C4-51-08', color: 'green' },
  { id: 7, name: 'C4-51-10', color: 'green' },
  { id: 8, name: 'C4-51-09', color: 'green' },
  { id: 9, name: 'C4-51-11', color: 'gray' },
  { id: 10, name: 'C4-51-12', color: 'green' },
  { id: 11, name: 'C4-51-13', color: 'green' },
  { id: 12, name: 'C4-51-17', color: 'gray' },
  { id: 13, name: 'C4-51-19', color: 'yellow' },
  { id: 14, name: 'C4-51-20', color: 'gray' },
  { id: 15, name: 'C4-51-21', color: 'yellow' },
  { id: 16, name: 'C4-51-22', color: 'red' },
  { id: 17, name: 'C4-51-23', color: 'yellow' },
  { id: 18, name: 'C4-51-24', color: 'yellow' },
  { id: 19, name: 'C4-51-14', color: 'gray' },
  { id: 20, name: 'C4-51-15', color: 'gray' },
  { id: 21, name: 'C4-51-29', color: 'green' },
  { id: 22, name: 'C4-51-18', color: 'gray' },
  { id: 23, name: 'C4-51-30', color: 'green' },
  { id: 24, name: 'C4-51-25', color: 'green' },
  { id: 25, name: 'C4-51-26', color: 'green' },
  { id: 26, name: 'C4-51-27', color: 'green' },
  { id: 27, name: 'C4-51-28', color: 'green' },
  { id: 28, name: 'C4-51-32', color: 'gray' },
  { id: 29, name: 'C4-51-31', color: 'green' },
  { id: 30, name: 'C4-51-16', color: 'yellow' },
  { id: 31, name: 'C4-51-04', color: 'green' },
  //... 继续补充截图里的所有设备
]);

// 筛选条件
const filter = ref('all'); // all / c4 / c4_01_11

// 模拟数据刷新时间
const updateTime = ref('2025-07-22 15:02:14');

// 筛选后的设备（简单示例，可根据实际规则过滤）
const filteredDevices = computed(() => {
  if (filter.value === 'all') return devices.value;
  // 这里假设 C4 车间和段别逻辑，实际根据接口或数据字段区分
  return devices.value.filter(dev =>
          dev.name.startsWith('C4-51-')
      // 可扩展更复杂的筛选逻辑，比如段别判断
  );
});

// 空白占位数量（让布局和截图完全一致，数清楚每行空几个）
const emptySlots = ref(/* 数截图里的空白卡片数量，比如 5 */ 5);
</script>

<style scoped>
.virtual-factory-container {
  width: 90%;
  margin: 20px auto;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.factory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filter-group {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}

.filter-btn.active {
  background: #007bff;
  color: #fff;
  border-color: #007bff;
}

.update-time {
  color: #666;
  font-size: 14px;
}

.factory-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(60px, 1fr)); /* 模拟截图的多列布局 */
  gap: 10px;
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 10px;
}

.device-card {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #333;
  font-size: 12px;
  font-weight: bold;
  border: 1px solid #ccc;
}

/* 空白卡片样式（如果有） */
.device-card.empty {
  background: #fff;
  border: dashed 1px #ccc;
}

/* 颜色模拟截图里的状态 */
.green { background-color: green!important; }
.gray { background-color: gray!important; }
.yellow { background-color: yellow!important; }
.red { background-color: red!important; }
</style>
