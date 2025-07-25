<template>
  <div class="equipment-management">
    <el-tabs v-model="activeTab">
      <!-- 车间管理 -->
      <el-tab-pane label="车间管理" name="workshop">
        <el-card>
          <el-table :data="workshops" style="width: 100%">
            <el-table-column prop="name" label="车间名称" />
            <el-table-column prop="location" label="位置" />
            <el-table-column prop="manager" label="负责人" />
            <el-table-column prop="equipmentRange" label="设备范围" />
            <el-table-column label="操作">
              <template #default>
                <el-button size="small" type="primary">编辑</el-button>
                <el-button size="small" type="danger">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 设备厂商 -->
      <el-tab-pane label="设备厂商" name="vendor">
        <el-card>
          <el-table :data="vendors" style="width: 100%">
            <el-table-column prop="name" label="厂商名称" />
            <el-table-column prop="contact" label="联系方式" />
            <el-table-column prop="address" label="地址" />
            <el-table-column label="操作">
              <template #default>
                <el-button size="small" type="primary">编辑</el-button>
                <el-button size="small" type="danger">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 设备型号 -->
      <el-tab-pane label="设备型号" name="model">
        <el-card>
          <el-table :data="equipmentModels" style="width: 100%">
            <el-table-column prop="model" label="型号" />
            <el-table-column prop="vendor" label="厂商" />
            <el-table-column prop="parameters" label="技术参数" width="200" />
            <el-table-column prop="scenario" label="适用场景" />
            <el-table-column label="操作">
              <template #default>
                <el-button size="small" type="primary">查看文档</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 基础设备 -->
      <el-tab-pane label="基础设备" name="basic">
        <el-card>
          <div class="toolbar">
            <el-input v-model="search" placeholder="搜索设备" style="width: 300px" clearable />
            <el-button type="primary" class="ml-10">添加设备</el-button>
          </div>
          <el-table :data="filteredEquipment" style="width: 100%; margin-top: 20px">
            <el-table-column prop="id" label="设备编号" />
            <el-table-column prop="name" label="设备名称" />
            <el-table-column prop="model" label="型号" />
            <el-table-column prop="workshop" label="所属车间" />
            <el-table-column label="状态">
              <template #default="{ row }">
                <el-tag :type="statusTagType(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template #default>
                <el-button size="small" type="primary">详情</el-button>
                <el-button size="small">维护记录</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import {ref, computed} from 'vue';

const activeTab = ref('basic');
const search = ref('');

// 车间数据
const workshops = ref([
  {id: 1, name: '总装车间', location: 'A区1号楼', manager: '张工', equipmentRange: 'AGV001-AGV050'},
  {id: 2, name: '焊接车间', location: 'B区2号楼', manager: '李工', equipmentRange: 'ROB001-ROB030'},
  {id: 3, name: '涂装车间', location: 'C区3号楼', manager: '王工', equipmentRange: 'PLC001-PLC020'},
  {id: 4, name: '冲压车间', location: 'D区4号楼', manager: '赵工', equipmentRange: 'CNC001-CNC040'},
]);

// 厂商数据
const vendors = ref([
  {id: 1, name: '西门子', contact: '400-800-8888', address: '北京市海淀区科技园88号'},
  {id: 2, name: '发那科', contact: '400-700-7777', address: '上海市浦东新区张江高科技园区'},
  {id: 3, name: 'ABB', contact: '400-600-6666', address: '广州市天河区珠江新城'},
  {id: 4, name: '库卡', contact: '400-500-5555', address: '深圳市南山区高新科技园'},
]);

// 设备型号数据
const equipmentModels = ref([
  {id: 1, model: 'FANUC R-2000iC', vendor: '发那科', parameters: '负载210kg, 臂展2.6m', scenario: '重型搬运'},
  {id: 2, model: 'SIEMENS S7-1500', vendor: '西门子', parameters: 'CPU 1515, 1MB内存', scenario: 'PLC控制'},
  {id: 3, model: 'ABB IRB 6700', vendor: 'ABB', parameters: '负载200kg, 精度±0.05mm', scenario: '装配作业'},
  {id: 4, model: 'KUKA KR 1000', vendor: '库卡', parameters: '负载1000kg, 臂展3.2m', scenario: '大型焊接'},
]);

// 基础设备数据
const equipmentList = ref([
  {id: 'AGV001', name: '自动导引车', model: 'AGV-M100', workshop: '总装车间', status: '运行中'},
  {id: 'ROB015', name: '焊接机器人', model: 'FANUC ARC-1', workshop: '焊接车间', status: '运行中'},
  {id: 'PLC008', name: 'PLC控制器', model: 'SIEMENS S7-1500', workshop: '涂装车间', status: '待机'},
  {id: 'CNC023', name: '数控机床', model: 'FANUC M-20iB', workshop: '冲压车间', status: '维护中'},
  {id: 'ROB022', name: '装配机器人', model: 'ABB IRB 6700', workshop: '总装车间', status: '运行中'},
  {id: 'PLC012', name: 'PLC控制器', model: 'OMRON NX102', workshop: '涂装车间', status: '离线'},
]);

// 过滤设备
const filteredEquipment = computed(() => {
  if (!search.value) return equipmentList.value;
  return equipmentList.value.filter(item =>
      item.id.includes(search.value) ||
      item.name.includes(search.value) ||
      item.model.includes(search.value))
});

// 状态标签类型
const statusTagType = (status) => {
  switch (status) {
    case '运行中':
      return 'success';
    case '待机':
      return 'warning';
    case '维护中':
      return 'info';
    default:
      return 'danger';
  }
}
</script>

<style scoped>
.equipment-management {
  padding: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.ml-10 {
  margin-left: 10px;
}
</style>
