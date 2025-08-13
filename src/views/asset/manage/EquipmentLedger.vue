<template>
  <div class="app-container">
    <!-- 头部标题 -->
    <div class="header">
      <div class="title">
        <i class="el-icon-s-management"></i>
        <span>设备清单</span>
      </div>
      <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增设备</el-button>
    </div>

    <!-- 过滤条件 -->
    <div class="filter-container">
      <el-form :model="filterForm" class="filter-form">
        <el-form-item label="设备编码">
          <el-input
              v-model="filterForm.deviceCode"
              placeholder="请输入设备编码"
              clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
              v-model="filterForm.status"
              multiple
              placeholder="请选择状态"
              clearable
          >
            <el-option label="已验收" value="已验收"></el-option>
            <el-option label="待验收" value="待验收"></el-option>
            <el-option label="样机" value="样机"></el-option>
            <el-option label="闲置" value="闲置"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="厂商">
          <el-input
              v-model="filterForm.manufacturer"
              placeholder="请输入厂商"
              clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="入库负责人">
          <el-input
              v-model="filterForm.inCharge"
              placeholder="请输入入库负责人"
              clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="寿命上限">
          <el-select
              v-model="filterForm.lifespan"
              placeholder="请选择寿命上限"
              clearable
          >
            <el-option label="1年" value="1"></el-option>
            <el-option label="2年" value="2"></el-option>
            <el-option label="3年" value="3"></el-option>
            <el-option label="4年" value="4"></el-option>
            <el-option label="5年及以上" value="5"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="区域ID">
          <el-input
              v-model="filterForm.regionId"
              placeholder="请输入区域ID"
              clearable
          ></el-input>
        </el-form-item>
      </el-form>
      <div class="operation-buttons">
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
        <el-button icon="el-icon-refresh" @click="resetFilter">重置</el-button>
        <el-button type="success" icon="el-icon-download" @click="downloadTemplate">下载模板</el-button>
        <el-upload
            class="upload-demo"
            action=""
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleImport"
            accept=".xlsx,.xls"
        >
          <el-button type="warning" icon="el-icon-upload2">导入数据</el-button>
        </el-upload>
        <el-button type="info" icon="el-icon-upload" @click="exportData">导出数据</el-button>
      </div>
    </div>

    <!-- 设备表格 -->
    <div class="table-container">
      <div class="table-header">
        <div class="total-text">共 {{ totalDevices }} 台设备</div>
        <el-button type="text" icon="el-icon-refresh" @click="refreshData">刷新</el-button>
      </div>

      <el-table
          :data="tableData"
          row-key="id"
          border
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          :default-expand-all="true"
          style="width: 100%"
      >
        <el-table-column prop="name" label="设备/产线/车间" min-width="200">
          <template #default="{ row }">
            <span v-if="row.type === 'workshop'">
              <i class="el-icon-office-building workshop-icon"></i>
              <span>{{ row.name }}车间</span>
            </span>
            <span v-else-if="row.type === 'line'">
              <i class="el-icon-set-up line-icon"></i>
              <span>{{ row.name }}产线</span>
            </span>
            <span v-else>
              <i class="el-icon-cpu device-icon"></i>
              <span>{{ row.name }}</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="deviceCode" label="设备编码" width="150"></el-table-column>
        <el-table-column prop="assetCode" label="资产编码" width="150"></el-table-column>
        <el-table-column prop="manufacturer" label="厂商" width="150"></el-table-column>
        <el-table-column prop="category" label="类别" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.category" effect="plain">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="model" label="型号" width="150"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span v-if="row.status" :class="['status-tag', getStatusClass(row.status)]">
              {{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="regionId" label="区域ID" width="120">
          <template #default="{ row }">
            <span v-if="row.type === 'device'">{{ row.regionId || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="lifespan" label="寿命上限" width="120">
          <template #default="{ row }">
            <span v-if="row.type === 'device'">
              {{ row.lifespan ? `${row.lifespan}年` : '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="inTime" label="入库时间" width="120" sortable></el-table-column>
        <el-table-column prop="inCharge" label="入库负责人" width="120"></el-table-column>
        <el-table-column prop="acceptTime" label="验收时间" width="120" sortable></el-table-column>
        <el-table-column prop="acceptor" label="验收人" width="120"></el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.type === 'device'" type="text" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button v-if="row.type === 'device'" type="text" size="small" @click="handleDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
            :current-page="pagination.page"
            :page-size="pagination.size"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            :page-sizes="[10, 20, 50, 100]"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// 过滤表单
const filterForm = reactive({
  deviceCode: '',
  status: [],
  inCharge: '',
  manufacturer: '',
  lifespan: '',
  regionId: ''
});

// 分页配置
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
});

// 表格数据
const tableData = ref([]);

// 设备列表数据
const deviceList = ref([]);

// 计算总设备数
const totalDevices = computed(() => {
  return deviceList.value.length;
});

// 设备状态样式
const getStatusClass = (status) => {
  switch(status) {
    case '已验收': return 'status-accepted';
    case '待验收': return 'status-pending';
    case '样机': return 'status-sample';
    case '闲置': return 'status-idle';
    default: return '';
  }
};

// 生成模拟数据
const generateMockData = () => {
  const categories = ['清洗机', 'COG机', 'FOG机', 'AOI机', '组装机'];
  const statuses = ['已验收', '待验收', '样机', '闲置'];
  const manufacturers = ['三星电子', '索尼', '松下', '西门子', '华为', '中兴', '京东方', '天马微电子'];
  const models = ['X-2000', 'ProMax 3000', 'Ultra 5', 'SuperClean', 'Fusion-X', 'Quantum'];
  const names = ['精密清洗设备', '全自动COG机', '高精度FOG机', '视觉检测设备', '智能组装机', '高速贴片机'];
  const people = ['张三', '李四', '王五', '赵六', '钱七', '孙八'];
  const lifespans = [1, 2, 3, 4, 5];
  // 模拟区域ID，关联Region.vue中的区域ID
  const regionIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  const workshops = ['C2', 'C3', 'C4', 'C5', 'C6'];
  const lines = {
    'C2': ['31', '32', '33', '34', '35', '36'],
    'C3': ['41', '42', '43', '44', '45', '46'],
    'C4': ['51', '52', '53', '54', '55', '56'],
    'C5': ['61', '62', '63', '64', '65', '66'],
    'C6': ['71', '72', '73', '74', '75', '76']
  };

  const devices = [];
  let idCounter = 1;

  workshops.forEach(workshop => {
    // 车间直属设备（不属于任何产线）
    const workshopDeviceCount = Math.floor(Math.random() * 3);
    for (let i = 0; i < workshopDeviceCount; i++) {
      devices.push({
        id: idCounter++,
        workshop: workshop,
        line: null,
        name: names[Math.floor(Math.random() * names.length)],
        deviceCode: `DEV-${workshop}-${1000 + i}`,
        assetCode: `AST-${Math.floor(Math.random() * 10000)}`,
        manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        model: models[Math.floor(Math.random() * models.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        regionId: regionIds[Math.floor(Math.random() * regionIds.length)],
        lifespan: lifespans[Math.floor(Math.random() * lifespans.length)],
        inTime: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        inCharge: people[Math.floor(Math.random() * people.length)],
        acceptTime: Math.random() > 0.3 ? `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}` : '',
        acceptor: Math.random() > 0.3 ? people[Math.floor(Math.random() * people.length)] : '',
        type: 'device'
      });
    }

    // 产线设备
    lines[workshop].forEach(line => {
      const lineDeviceCount = 3 + Math.floor(Math.random() * 5);
      for (let i = 0; i < lineDeviceCount; i++) {
        devices.push({
          id: idCounter++,
          workshop: workshop,
          line: line,
          name: names[Math.floor(Math.random() * names.length)],
          deviceCode: `DEV-${workshop}-${line}-${100 + i}`,
          assetCode: `AST-${Math.floor(Math.random() * 10000)}`,
          manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
          category: categories[Math.floor(Math.random() * categories.length)],
          model: models[Math.floor(Math.random() * models.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          regionId: regionIds[Math.floor(Math.random() * regionIds.length)],
          lifespan: lifespans[Math.floor(Math.random() * lifespans.length)],
          inTime: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
          inCharge: people[Math.floor(Math.random() * people.length)],
          acceptTime: Math.random() > 0.3 ? `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}` : '',
          acceptor: Math.random() > 0.3 ? people[Math.floor(Math.random() * people.length)] : '',
          type: 'device'
        });
      }
    });
  });

  return devices;
};

// 构建树形结构数据
const buildTreeData = (devices) => {
  const workshops = ['C2', 'C3', 'C4', 'C5', 'C6'];
  const lines = {
    'C2': ['31', '32', '33', '34', '35', '36'],
    'C3': ['41', '42', '43', '44', '45', '46'],
    'C4': ['51', '52', '53', '54', '55', '56'],
    'C5': ['61', '62', '63', '64', '65', '66'],
    'C6': ['71', '72', '73', '74', '75', '76']
  };

  const tree = [];
  let idCounter = 10000;

  workshops.forEach(workshop => {
    // 创建车间节点
    const workshopNode = {
      id: idCounter++,
      name: workshop,
      type: 'workshop',
      children: []
    };

    // 添加车间直属设备
    const workshopDevices = devices.filter(d =>
        d.workshop === workshop && !d.line
    );

    if (workshopDevices.length > 0) {
      workshopDevices.forEach(device => {
        workshopNode.children.push({
          ...device,
          id: device.id
        });
      });
    }

    // 添加产线节点
    lines[workshop].forEach(line => {
      const lineDevices = devices.filter(d =>
          d.workshop === workshop && d.line === line
      );

      if (lineDevices.length > 0) {
        const lineNode = {
          id: idCounter++,
          name: line,
          type: 'line',
          children: lineDevices.map(device => ({
            ...device,
            id: device.id
          }))
        };
        workshopNode.children.push(lineNode);
      }
    });

    tree.push(workshopNode);
  });

  return tree;
};

// 初始化数据
const initData = () => {
  const mockDevices = generateMockData();
  deviceList.value = mockDevices;
  tableData.value = buildTreeData(mockDevices);
  pagination.total = mockDevices.length;
};

// 查询处理
const handleSearch = () => {
  const { deviceCode, status, inCharge, manufacturer, lifespan, regionId } = filterForm;
  let filteredDevices = [...deviceList.value];

  if (deviceCode) {
    filteredDevices = filteredDevices.filter(d =>
        d.deviceCode.includes(deviceCode)
    );
  }

  if (status && status.length > 0) {
    filteredDevices = filteredDevices.filter(d =>
        status.includes(d.status)
    );
  }

  if (inCharge) {
    filteredDevices = filteredDevices.filter(d =>
        d.inCharge.includes(inCharge)
    );
  }

  if (manufacturer) {
    filteredDevices = filteredDevices.filter(d =>
        d.manufacturer.includes(manufacturer)
    );
  }

  if (lifespan) {
    filteredDevices = filteredDevices.filter(d =>
        String(d.lifespan) === lifespan
    );
  }

  if (regionId) {
    filteredDevices = filteredDevices.filter(d =>
        String(d.regionId) === regionId
    );
  }

  tableData.value = buildTreeData(filteredDevices);
  pagination.total = filteredDevices.length;
};

// 重置筛选条件
const resetFilter = () => {
  filterForm.deviceCode = '';
  filterForm.status = [];
  filterForm.inCharge = '';
  filterForm.manufacturer = '';
  filterForm.lifespan = '';
  filterForm.regionId = '';
  tableData.value = buildTreeData(deviceList.value);
  pagination.total = deviceList.value.length;
};

// 刷新数据
const refreshData = () => {
  initData();
  ElMessage.success('数据刷新成功');
};

// 分页处理
const handleSizeChange = (size) => {
  pagination.size = size;
  pagination.page = 1;
};

const handleCurrentChange = (page) => {
  pagination.page = page;
};

// 新增设备
const handleAdd = () => {
  ElMessage.info('新增设备');
};

// 编辑设备
const handleEdit = (row) => {
  console.log('编辑设备:', row);
  ElMessage.info(`编辑设备: ${row.name}`);
};

// 查看详情
const handleDetail = (row) => {
  console.log('查看设备详情:', row);
  ElMessage.info(`查看设备详情: ${row.name}`);
};

// 下载模板
const downloadTemplate = () => {
  const templateData = [
    ['车间', '产线', '设备', '设备编码', '资产编码', '厂商', '类别', '型号', '状态', '区域ID', '寿命上限(年)', '入库时间', '入库负责人', '验收时间', '验收人']
  ];

  const ws = XLSX.utils.aoa_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '设备清单模板');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, '设备清单导入模板.xlsx');
};

// 导入数据
const handleImport = (file) => {
  const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
  if (!isExcel) {
    ElMessage.error('只能上传Excel文件!');
    return;
  }

  ElMessageBox.confirm('确定导入此文件吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

      if (jsonData.length < 2) {
        ElMessage.error('导入的文件没有数据!');
        return;
      }

      const headers = jsonData[0];
      const importedDevices = [];
      let idCounter = deviceList.value.length > 0 ? Math.max(...deviceList.value.map(d => d.id)) + 1 : 1;

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (row.length === 0) continue;

        const device = {
          id: idCounter++,
          workshop: row[0] || '',
          line: row[1] || null,
          name: row[2] || '',
          deviceCode: row[3] || '',
          assetCode: row[4] || '',
          manufacturer: row[5] || '',
          category: row[6] || '',
          model: row[7] || '',
          status: row[8] || '待验收',
          regionId: row[9] || null,
          lifespan: row[10] || null,
          inTime: row[11] || '',
          inCharge: row[12] || '',
          acceptTime: row[13] || '',
          acceptor: row[14] || '',
          type: 'device'
        };
        importedDevices.push(device);
      }

      if (importedDevices.length > 0) {
        deviceList.value = [...deviceList.value, ...importedDevices];
        tableData.value = buildTreeData(deviceList.value);
        pagination.total = deviceList.value.length;
        ElMessage.success(`成功导入 ${importedDevices.length} 条设备数据`);
      } else {
        ElMessage.warning('没有可导入的设备数据');
      }
    };
    reader.readAsArrayBuffer(file.raw);
  }).catch(() => {
    ElMessage.info('已取消导入');
  });
};

// 导出数据
const exportData = () => {
  if (deviceList.value.length === 0) {
    ElMessage.warning('没有数据可导出');
    return;
  }

  const exportData = deviceList.value.map(device => ({
    车间: device.workshop,
    产线: device.line,
    设备: device.name,
    设备编码: device.deviceCode,
    资产编码: device.assetCode,
    厂商: device.manufacturer,
    类别: device.category,
    型号: device.model,
    状态: device.status,
    区域ID: device.regionId,
    寿命上限: device.lifespan ? `${device.lifespan}年` : '',
    入库时间: device.inTime,
    入库负责人: device.inCharge,
    验收时间: device.acceptTime,
    验收人: device.acceptor
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '设备清单');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `设备清单_${new Date().toLocaleDateString()}.xlsx`);
};

onMounted(() => {
  initData();
});
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.app-container {
  padding: 20px;
  max-width: 1600px;
  margin: 0 auto;
  background-color: #f5f7fa;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  color: #333;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2f3d;
  display: flex;
  align-items: center;
}
.title i {
  margin-right: 10px;
  font-size: 28px;
  color: #409EFF;
}
.filter-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}
.filter-form {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}
.operation-buttons {
  display: flex;
  gap: 13px;
  margin-top: 10px;
}
.upload-demo {
  display: inline-block;
}
.table-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 20px;
  overflow: hidden;
}
.status-tag {
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
}
.status-accepted {
  background: #e1f3d8;
  color: #67c23a;
}
.status-pending {
  background: #fdf6ec;
  color: #e6a23c;
}
.status-sample {
  background: #f0f9eb;
  color: #909399;
}
.status-idle {
  background: #fef0f0;
  color: #f56c6c;
}
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.total-text {
  font-size: 14px;
  color: #606266;
}
.device-icon {
  margin-right: 8px;
  color: #409EFF;
}
.workshop-icon {
  margin-right: 8px;
  color: #67c23a;
}
.line-icon {
  margin-right: 8px;
  color: #e6a23c;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
::v-deep .el-table .el-table__row--level-0 {
  background-color: #f5f7fa;
  font-weight: 600;
}
::v-deep .el-table .el-table__row--level-1 {
  background-color: #fafafa;
}
</style>
