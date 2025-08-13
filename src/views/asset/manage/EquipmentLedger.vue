<template>
  <div class="app-container">
    <!-- 头部标题 -->
    <div class="header">
      <div class="title">
        <i class="el-icon-s-management"></i>
        <span>设备清单管理系统</span>
      </div>
      <el-button type="primary" icon="el-icon-plus" @click="dialogVisible = true">新增设备</el-button>
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

    <!-- 新增设备弹窗 -->
    <el-dialog
        v-model="dialogVisible"
        title="新增设备"
        width="900px"
        class="add-device-dialog"
        :close-on-click-modal="false"
    >
      <div class="dialog-header">
        <i class="el-icon-cpu"></i>
        <h2>新增设备信息</h2>
      </div>

      <div class="dialog-body">
        <div class="form-section">
          <div class="section-title">
            <i class="el-icon-document"></i>
            <span>设备基本信息</span>
          </div>

          <div class="form-grid">
            <el-form :model="newDeviceForm" label-width="100px" label-position="top">
              <el-form-item label="区域ID" required>
                <el-input v-model="newDeviceForm.regionId" placeholder="请输入区域ID"></el-input>
                <div class="el-form-item__tip">关联区域表中的区域ID</div>
              </el-form-item>

              <el-form-item label="设备/产线/车间" required>
                <el-input v-model="newDeviceForm.name" placeholder="请输入设备名称"></el-input>
              </el-form-item>

              <el-form-item label="设备编码" required>
                <el-input v-model="newDeviceForm.deviceCode" placeholder="请输入设备唯一编码"></el-input>
              </el-form-item>

              <el-form-item label="资产编码">
                <el-input v-model="newDeviceForm.assetCode" placeholder="请输入资产编码"></el-input>
              </el-form-item>
            </el-form>

            <el-form :model="newDeviceForm" label-width="100px" label-position="top">
              <el-form-item label="厂商" required>
                <el-input v-model="newDeviceForm.manufacturer" placeholder="请输入厂商名称"></el-input>
              </el-form-item>

              <el-form-item label="类别">
                <el-select v-model="newDeviceForm.category" placeholder="请选择设备类别">
                  <el-option label="清洗机" value="清洗机"></el-option>
                  <el-option label="COG机" value="COG机"></el-option>
                  <el-option label="FOG机" value="FOG机"></el-option>
                  <el-option label="AOI机" value="AOI机"></el-option>
                  <el-option label="组装机" value="组装机"></el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="型号">
                <el-input v-model="newDeviceForm.model" placeholder="请输入设备型号"></el-input>
              </el-form-item>

              <el-form-item label="状态">
                <el-select v-model="newDeviceForm.status" placeholder="请选择状态">
                  <el-option label="已验收" value="已验收"></el-option>
                  <el-option label="待验收" value="待验收"></el-option>
                  <el-option label="样机" value="样机"></el-option>
                  <el-option label="闲置" value="闲置"></el-option>
                </el-select>
              </el-form-item>
            </el-form>

            <el-form :model="newDeviceForm" label-width="100px" label-position="top">
              <el-form-item label="寿命上限">
                <el-select v-model="newDeviceForm.lifespan" placeholder="请选择寿命上限">
                  <el-option label="1年" value="1"></el-option>
                  <el-option label="2年" value="2"></el-option>
                  <el-option label="3年" value="3"></el-option>
                  <el-option label="4年" value="4"></el-option>
                  <el-option label="5年及以上" value="5"></el-option>
                </el-select>
              </el-form-item>

              <el-form-item label="入库时间">
                <el-date-picker
                    v-model="newDeviceForm.inTime"
                    type="date"
                    placeholder="选择日期"
                    value-format="YYYY-MM-DD"
                ></el-date-picker>
              </el-form-item>

              <el-form-item label="入库负责人">
                <el-input v-model="newDeviceForm.inCharge" placeholder="请输入负责人姓名"></el-input>
              </el-form-item>

              <el-form-item label="验收时间">
                <el-date-picker
                    v-model="newDeviceForm.acceptTime"
                    type="date"
                    placeholder="选择日期"
                    value-format="YYYY-MM-DD"
                ></el-date-picker>
              </el-form-item>

              <el-form-item label="验收人">
                <el-input v-model="newDeviceForm.acceptor" placeholder="请输入验收人姓名"></el-input>
              </el-form-item>
            </el-form>
          </div>
        </div>

        <!-- 设备说明书管理 -->
        <div class="form-section">
          <div class="section-title">
            <i class="el-icon-document-copy"></i>
            <span>设备说明书</span>
          </div>

          <div class="file-manager">
            <div class="file-section">
              <el-upload
                  action=""
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleManualUpload"
                  accept=".pdf,.doc,.docx"
              >
                <div class="upload-area">
                  <i class="el-icon-upload upload-icon"></i>
                  <div class="upload-text">点击上传设备说明书</div>
                  <div class="upload-hint">支持PDF、Word文档格式</div>
                </div>
              </el-upload>
            </div>

            <div v-if="instructionManualList.length > 0">
              <div class="file-list">
                <div v-for="(file, index) in instructionManualList" :key="file.id" class="file-card">
                  <div class="file-preview">
                    <i v-if="file.type === 'pdf'" class="el-icon-document pdf-icon"></i>
                    <i v-else class="el-icon-document word-icon"></i>
                  </div>
                  <div class="file-info">
                    <div class="file-name">{{ file.name }}</div>
                    <div class="file-meta">{{ file.size }} KB</div>
                    <div class="file-actions">
                      <el-button type="text" @click="downloadFile(file)">下载</el-button>
                      <el-button type="text" @click="editFile(file, 'manual', index)">编辑</el-button>
                      <el-button type="text" @click="deleteFile(file, 'manual', index)">删除</el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 设备图纸管理 -->
        <div class="form-section">
          <div class="section-title">
            <i class="el-icon-picture-outline"></i>
            <span>设备图纸</span>
          </div>

          <div class="file-manager">
            <div class="file-section">
              <el-upload
                  action=""
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleDrawingUpload"
                  accept=".jpg,.jpeg,.png,.gif"
              >
                <div class="upload-area">
                  <i class="el-icon-upload upload-icon"></i>
                  <div class="upload-text">点击上传设备图纸</div>
                  <div class="upload-hint">支持JPG、PNG、GIF格式</div>
                </div>
              </el-upload>
            </div>

            <div v-if="drawingList.length > 0">
              <div class="file-list">
                <div v-for="(file, index) in drawingList" :key="file.id" class="file-card">
                  <div class="file-preview">
                    <img :src="file.preview" alt="设备图纸预览">
                  </div>
                  <div class="file-info">
                    <div class="file-name">{{ file.name }}</div>
                    <div class="file-meta">{{ file.size }} KB</div>
                    <div class="file-actions">
                      <el-button type="text" @click="downloadFile(file)">下载</el-button>
                      <el-button type="text" @click="editFile(file, 'drawing', index)">编辑</el-button>
                      <el-button type="text" @click="deleteFile(file, 'drawing', index)">删除</el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitNewDevice">确认添加</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// 控制新增设备弹窗显示
const dialogVisible = ref(false);

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

// 新增设备表单
const newDeviceForm = reactive({
  regionId: '',
  name: '',
  deviceCode: '',
  assetCode: '',
  manufacturer: '',
  category: '',
  model: '',
  status: '',
  lifespan: '',
  inTime: '',
  inCharge: '',
  acceptTime: '',
  acceptor: ''
});

// 说明书文件列表
const instructionManualList = ref([]);

// 图纸文件列表
const drawingList = ref([]);

// 文件ID计数器
let fileIdCounter = 1;

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

// 处理说明书上传
const handleManualUpload = (file) => {
  const fileType = file.name.split('.').pop().toLowerCase();
  if (!['pdf', 'doc', 'docx'].includes(fileType)) {
    ElMessage.error('只支持上传PDF或Word文档');
    return false;
  }

  const newFile = {
    id: fileIdCounter++,
    name: file.name,
    type: fileType === 'pdf' ? 'pdf' : 'word',
    size: Math.round(file.size / 1024),
    file: file.raw,
    uploadTime: new Date().toLocaleString()
  };

  instructionManualList.value.push(newFile);
  ElMessage.success('说明书上传成功');
};

// 处理图纸上传
const handleDrawingUpload = (file) => {
  const fileType = file.name.split('.').pop().toLowerCase();
  if (!['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
    ElMessage.error('只支持上传图片文件');
    return false;
  }

  // 生成预览图
  const reader = new FileReader();
  reader.onload = (e) => {
    const newFile = {
      id: fileIdCounter++,
      name: file.name,
      type: 'image',
      size: Math.round(file.size / 1024),
      preview: e.target.result,
      file: file.raw,
      uploadTime: new Date().toLocaleString()
    };

    drawingList.value.push(newFile);
    ElMessage.success('图纸上传成功');
  };
  reader.readAsDataURL(file.raw);
};

// 下载文件
const downloadFile = (file) => {
  if (!file.file) {
    ElMessage.warning('无法下载该文件');
    return;
  }

  const url = URL.createObjectURL(file.file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  ElMessage.success(`开始下载: ${file.name}`);
};

// 编辑文件
const editFile = (file, type, index) => {
  ElMessageBox.confirm('确定要替换此文件吗?', '编辑文件', {
    confirmButtonText: '替换',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 创建隐藏的文件输入元素
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'manual' ? '.pdf,.doc,.docx' : '.jpg,.jpeg,.png,.gif';
    input.onchange = (e) => {
      const newFile = e.target.files[0];
      if (!newFile) return;

      if (type === 'manual') {
        handleManualUpload({ raw: newFile, name: newFile.name });
        instructionManualList.value.splice(index, 1);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          drawingList.value[index] = {
            ...file,
            name: newFile.name,
            size: Math.round(newFile.size / 1024),
            preview: event.target.result,
            file: newFile
          };
          ElMessage.success('图纸已更新');
        };
        reader.readAsDataURL(newFile);
      }
    };
    input.click();
  }).catch(() => {
    // 取消操作
  });
};

// 删除文件
const deleteFile = (file, type, index) => {
  ElMessageBox.confirm('确定要删除此文件吗?', '删除文件', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    if (type === 'manual') {
      instructionManualList.value.splice(index, 1);
    } else {
      drawingList.value.splice(index, 1);
    }
    ElMessage.success('文件已删除');
  }).catch(() => {
    // 取消操作
  });
};

// 提交新增设备
const submitNewDevice = () => {
  // 简单表单验证
  if (!newDeviceForm.regionId || !newDeviceForm.name || !newDeviceForm.deviceCode || !newDeviceForm.manufacturer) {
    ElMessage.error('请填写必填字段');
    return;
  }

  // 检查设备编码是否唯一
  const isCodeExist = deviceList.value.some(device =>
      device.deviceCode === newDeviceForm.deviceCode
  );

  if (isCodeExist) {
    ElMessage.error('设备编码已存在，请使用唯一编码');
    return;
  }

  // 创建新设备对象
  const newDevice = {
    id: deviceList.value.length > 0 ? Math.max(...deviceList.value.map(d => d.id)) + 1 : 1,
    ...newDeviceForm,
    workshop: 'C2', // 模拟车间
    line: '31',    // 模拟产线
    type: 'device',
    // 添加文件信息（实际应用中应为文件路径）
    manuals: instructionManualList.value.map(f => f.name),
    drawings: drawingList.value.map(f => f.name)
  };

  // 添加到设备列表
  deviceList.value.push(newDevice);
  tableData.value = buildTreeData(deviceList.value);
  pagination.total = deviceList.value.length;

  // 重置表单
  resetNewDeviceForm();

  // 关闭弹窗
  dialogVisible.value = false;

  ElMessage.success('设备添加成功');
};

// 重置新增设备表单
const resetNewDeviceForm = () => {
  Object.keys(newDeviceForm).forEach(key => {
    newDeviceForm[key] = '';
  });
  instructionManualList.value = [];
  drawingList.value = [];
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
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}
body {
  background-color: #f5f7fa;
  color: #333;
  padding: 20px;
}
.app-container {
  max-width: 1600px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #409EFF 0%, #337ecc 100%);
  color: white;
  border-radius: 8px 8px 0 0;
}
.title {
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
.title i {
  margin-right: 10px;
  font-size: 28px;
}
.filter-container {
  background: #fff;
  padding: 20px;
  margin: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
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
  flex-wrap: wrap;
}
.upload-demo {
  display: inline-block;
}
.table-container {
  padding: 0 20px 20px;
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
.el-table .el-table__row--level-0 {
  background-color: #f5f7fa !important;
  font-weight: 600;
}
.el-table .el-table__row--level-1 {
  background-color: #fafafa !important;
}

/* 新增设备弹窗样式 */
.add-device-dialog {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}
.dialog-header {
  display: flex;
  align-items: center;
  padding: 20px 20px 10px;
  border-bottom: 1px solid #eee;
}
.dialog-header i {
  margin-right: 10px;
  font-size: 24px;
  color: #409EFF;
}
.dialog-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2f3d;
}
.dialog-body {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}
.form-section {
  margin-bottom: 25px;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #409EFF;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #e4e7ed;
  display: flex;
  align-items: center;
}
.section-title i {
  margin-right: 8px;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
.file-manager {
  background: #f8f9fc;
  border-radius: 8px;
  padding: 15px;
  margin-top: 10px;
}
.file-section {
  margin-bottom: 20px;
}
.file-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 10px;
}
.file-card {
  width: 200px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}
.file-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}
.file-preview {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}
.file-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.file-preview i {
  font-size: 48px;
  color: #409EFF;
}
.pdf-icon {
  color: #e74c3c;
}
.word-icon {
  color: #2b579a;
}
.file-info {
  padding: 12px;
}
.file-name {
  font-weight: 500;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.file-meta {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}
.file-actions {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #ebeef5;
  padding-top: 8px;
}
.dialog-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  text-align: right;
}
.upload-area {
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s;
  background: #fafafa;
}
.upload-area:hover {
  border-color: #409EFF;
}
.upload-icon {
  font-size: 40px;
  color: #c0c4cc;
  margin-bottom: 10px;
}
.upload-text {
  color: #606266;
}
.upload-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
.file-type-tabs {
  margin-bottom: 15px;
}
</style>
