<template>
  <div class="online-equipment">
    <el-card>
      <div class="toolbar">
        <el-input v-model="search" placeholder="搜索设备" style="width: 300px" clearable />
        <div>
          <el-button type="primary">添加设备</el-button>
          <el-button>导出数据</el-button>
        </div>
      </div>

      <el-table :data="filteredEquipment" style="width: 100%; margin-top: 20px">
        <el-table-column prop="id" label="设备编号" width="120" />
        <el-table-column prop="name" label="设备名称" />
        <el-table-column prop="workshop" label="所属车间" />
        <el-table-column label="在线状态">
          <template #default="{ row }">
            <el-tag :type="row.onlineStatus === '在线' ? 'success' : 'danger'">
              {{ row.onlineStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="beat" label="工作节拍(秒)" width="120" />
        <el-table-column prop="lastUpdate" label="最后更新时间" width="180" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetails(row)">详情</el-button>
            <el-button size="small" type="warning">点表</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
          background
          layout="prev, pager, next"
          :total="onlineEquipment.length"
          :page-size="pageSize"
          v-model:current-page="currentPage"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const search = ref('');
const currentPage = ref(1);
const pageSize = 10;

// 联机设备数据
const onlineEquipment = ref([
  { id: 'AGV001', name: '自动导引车', workshop: '总装车间', onlineStatus: '在线', beat: 45, lastUpdate: '2023-07-25 10:23:45' },
  { id: 'ROB015', name: '焊接机器人', workshop: '焊接车间', onlineStatus: '在线', beat: 32, lastUpdate: '2023-07-25 09:45:12' },
  { id: 'PLC008', name: 'PLC控制器', workshop: '涂装车间', onlineStatus: '离线', beat: '--', lastUpdate: '2023-07-24 16:30:22' },
  { id: 'CNC023', name: '数控机床', workshop: '冲压车间', onlineStatus: '在线', beat: 78, lastUpdate: '2023-07-25 08:12:33' },
  { id: 'ROB022', name: '装配机器人', workshop: '总装车间', onlineStatus: '在线', beat: 28, lastUpdate: '2023-07-25 11:05:47' },
  { id: 'PLC012', name: 'PLC控制器', workshop: '涂装车间', onlineStatus: '在线', beat: 15, lastUpdate: '2023-07-25 10:55:18' },
  { id: 'AGV009', name: '自动导引车', workshop: '总装车间', onlineStatus: '离线', beat: '--', lastUpdate: '2023-07-23 14:20:10' },
  { id: 'ROB027', name: '搬运机器人', workshop: '焊接车间', onlineStatus: '在线', beat: 39, lastUpdate: '2023-07-25 09:30:45' },
]);

// 过滤设备
const filteredEquipment = computed(() => {
  let result = onlineEquipment.value;
  if (search.value) {
    result = result.filter(item =>
        item.id.includes(search.value) ||
        item.name.includes(search.value) ||
        item.workshop.includes(search.value))
  }

  // 分页处理
  const start = (currentPage.value - 1) * pageSize;
  return result.slice(start, start + pageSize);
});

// 查看详情
const viewDetails = (row) => {
  console.log('查看设备详情:', row);
  // 实际项目中这里会跳转到详情页面
}
</script>

<style scoped>
.online-equipment {
  padding: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
