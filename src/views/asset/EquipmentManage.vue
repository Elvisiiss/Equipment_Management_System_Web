<template>
  <div class="container">
    <h1>车间设备管理系统</h1>

    <el-tabs v-model="activeTab" type="border-card">
      <!-- 车间列表 -->
      <el-tab-pane label="车间列表" name="workshop">
        <el-table :data="workshopData" border style="width: 100%">
          <el-table-column prop="name" label="车间名称" width="180" />
          <el-table-column prop="area" label="生产区域" width="120" />
          <el-table-column prop="location" label="位置" width="180" />
          <el-table-column prop="manager" label="负责人" width="120" />
          <el-table-column prop="equipmentRange" label="关联设备范围" />
        </el-table>

        <div class="table-actions">
          <el-button type="primary" @click="handleAddWorkshop">新增车间</el-button>
        </div>
      </el-tab-pane>

      <!-- 设备厂商 -->
      <el-tab-pane label="设备厂商" name="manufacturer">
        <el-table :data="manufacturerData" border style="width: 100%">
          <el-table-column prop="name" label="厂商名称" width="180" />
          <el-table-column prop="contact" label="联系人" width="120" />
          <el-table-column prop="phone" label="联系电话" width="150" />
          <el-table-column prop="email" label="电子邮箱" width="180" />
          <el-table-column prop="address" label="地址" />
        </el-table>

        <div class="table-actions">
          <el-button type="primary" @click="handleAddManufacturer">新增厂商</el-button>
        </div>
      </el-tab-pane>

      <!-- 设备型号 -->
      <el-tab-pane label="设备型号" name="model">
        <el-table :data="modelData" border style="width: 100%">
          <el-table-column prop="code" label="型号代码" width="120" />
          <el-table-column prop="name" label="型号名称" width="180" />
          <el-table-column prop="manufacturer" label="所属厂商" width="180" />
          <el-table-column prop="parameters" label="技术参数" width="200" />
          <el-table-column prop="scenario" label="适配场景" />
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button link type="primary" @click="viewDocuments(scope.row)">查看文档</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="table-actions">
          <el-button type="primary" @click="handleAddModel">新增型号</el-button>
        </div>
      </el-tab-pane>

      <!-- 基础设备列表 -->
      <el-tab-pane label="基础设备列表" name="equipment">
        <div class="filter-container">
          <el-input v-model="equipmentFilter.code" placeholder="设备编号" style="width: 200px;" clearable />
          <el-input v-model="equipmentFilter.name" placeholder="设备名称" style="width: 200px;" clearable />
          <el-select v-model="equipmentFilter.workshop" placeholder="所属车间" clearable>
            <el-option v-for="item in workshopOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-button type="primary" @click="searchEquipment">搜索</el-button>
        </div>

        <el-table :data="filteredEquipmentData" border style="width: 100%">
          <el-table-column prop="code" label="设备编号" width="120" />
          <el-table-column prop="name" label="设备名称" width="180" />
          <el-table-column prop="model" label="设备型号" width="180" />
          <el-table-column prop="workshop" label="所属车间" width="180" />
          <el-table-column prop="status" label="基础状态" width="120">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.status)">{{ scope.row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template #default="scope">
              <el-button link type="primary" @click="viewEquipmentDetail(scope.row)">详情</el-button>
              <el-button link type="primary" @click="editEquipment(scope.row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="table-actions">
          <el-button type="primary" @click="handleAddEquipment">新增设备</el-button>
        </div>
      </el-tab-pane>

      <!-- 联机设备详情 -->
      <el-tab-pane label="联机设备详情" name="online">
        <el-table :data="onlineEquipmentData" border style="width: 100%">
          <el-table-column prop="code" label="设备编号" width="120" />
          <el-table-column prop="name" label="设备名称" width="180" />
          <el-table-column prop="ip" label="IP地址" width="150" />
          <el-table-column prop="status" label="在线状态" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.online ? 'success' : 'danger'">
                {{ scope.row.online ? '在线' : '离线' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="beat" label="工作节拍(ms)" width="150" />
          <el-table-column label="操作" width="180">
            <template #default="scope">
              <el-button link type="primary" @click="editOnlineSettings(scope.row)">连接设置</el-button>
              <el-button link type="primary" @click="viewOnlineDetail(scope.row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 设备履历 -->
      <el-tab-pane label="设备履历" name="history">
        <div class="filter-container">
          <el-input v-model="historyFilter.code" placeholder="设备编号" style="width: 200px;" clearable />
          <el-input v-model="historyFilter.name" placeholder="设备名称" style="width: 200px;" clearable />
          <el-date-picker
              v-model="historyFilter.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
          />
          <el-button type="primary" @click="searchHistory">搜索</el-button>
        </div>

        <el-table :data="filteredHistoryData" border style="width: 100%">
          <el-table-column prop="equipmentCode" label="设备编号" width="120" />
          <el-table-column prop="equipmentName" label="设备名称" width="180" />
          <el-table-column prop="acceptanceDate" label="验收时间" width="180" />
          <el-table-column prop="supplier" label="供应商" width="180" />
          <el-table-column prop="batchNumber" label="批次号" width="120" />
          <el-table-column prop="operator" label="操作人" width="120" />
          <el-table-column prop="result" label="验收结果" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.result === '合格' ? 'success' : 'danger'">
                {{ scope.row.result }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button link type="primary" @click="viewHistoryDetail(scope.row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 设备点表管理 -->
      <el-tab-pane label="设备点表管理" name="plc">
        <div class="plc-container">
          <div class="plc-sidebar">
            <el-tree
                :data="plcEquipmentTree"
                :props="treeProps"
                @node-click="handlePlcNodeClick"
            />
          </div>

          <div class="plc-content">
            <div v-if="selectedPlcEquipment" class="plc-params">
              <h3>{{ selectedPlcEquipment.name }} - PLC参数设置</h3>

              <el-form label-width="120px">
                <el-form-item label="IP地址">
                  <el-input v-model="selectedPlcEquipment.ip" />
                </el-form-item>
                <el-form-item label="端口号">
                  <el-input v-model="selectedPlcEquipment.port" />
                </el-form-item>
                <el-form-item label="PLC类型">
                  <el-select v-model="selectedPlcEquipment.plcType">
                    <el-option label="西门子S7-1200" value="s7-1200" />
                    <el-option label="西门子S7-1500" value="s7-1500" />
                    <el-option label="三菱FX系列" value="fx" />
                    <el-option label="欧姆龙CP系列" value="cp" />
                  </el-select>
                </el-form-item>
                <el-form-item label="通信协议">
                  <el-select v-model="selectedPlcEquipment.protocol">
                    <el-option label="Modbus TCP" value="modbus-tcp" />
                    <el-option label="Profinet" value="profinet" />
                    <el-option label="EtherNet/IP" value="ethernet-ip" />
                  </el-select>
                </el-form-item>
                <el-form-item label="轮询间隔(ms)">
                  <el-input-number v-model="selectedPlcEquipment.pollingInterval" :min="100" :max="10000" />
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" @click="savePlcSettings">保存设置</el-button>
                  <el-button @click="testPlcConnection">测试连接</el-button>
                </el-form-item>
              </el-form>

              <div v-if="selectedPlcEquipment.points && selectedPlcEquipment.points.length > 0" class="point-table">
                <h4>点位列表</h4>
                <el-table :data="selectedPlcEquipment.points" border style="width: 100%">
                  <el-table-column prop="address" label="地址" width="120" />
                  <el-table-column prop="name" label="名称" width="180" />
                  <el-table-column prop="type" label="类型" width="120" />
                  <el-table-column prop="value" label="当前值" width="120" />
                  <el-table-column prop="description" label="描述" />
                </el-table>
              </div>
            </div>

            <div v-else class="plc-empty">
              <el-empty description="请从左侧选择设备进行PLC参数设置" />
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 各种对话框 -->
    <WorkshopDialog
        v-model="workshopDialogVisible"
        :data="currentWorkshop"
        @submit="handleWorkshopSubmit"
    />

    <ManufacturerDialog
        v-model="manufacturerDialogVisible"
        :data="currentManufacturer"
        @submit="handleManufacturerSubmit"
    />

    <ModelDialog
        v-model="modelDialogVisible"
        :data="currentModel"
        @submit="handleModelSubmit"
    />

    <EquipmentDialog
        v-model="equipmentDialogVisible"
        :data="currentEquipment"
        :workshops="workshopOptions"
        :models="modelOptions"
        @submit="handleEquipmentSubmit"
    />

    <OnlineSettingsDialog
        v-model="onlineSettingsDialogVisible"
        :data="currentOnlineEquipment"
        @submit="handleOnlineSettingsSubmit"
    />

    <DocumentViewer
        v-model="documentViewerVisible"
        :documents="currentDocuments"
    />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import WorkshopDialog from './components/WorkshopDialog.vue'
import ManufacturerDialog from './components/ManufacturerDialog.vue'
import ModelDialog from './components/ModelDialog.vue'
import EquipmentDialog from './components/EquipmentDialog.vue'
import OnlineSettingsDialog from './components/OnlineSettingsDialog.vue'
import DocumentViewer from './components/DocumentViewer.vue'

export default {
  components: {
    WorkshopDialog,
    ManufacturerDialog,
    ModelDialog,
    EquipmentDialog,
    OnlineSettingsDialog,
    DocumentViewer
  },

  setup() {
    // 当前激活的标签页
    const activeTab = ref('workshop')

    // 车间列表数据
    const workshopData = ref([
      { id: 1, name: '装配一车间', area: 'A区', location: '厂房A栋1楼', manager: '张三', equipmentRange: 'A001-A050' },
      { id: 2, name: '装配二车间', area: 'A区', location: '厂房A栋2楼', manager: '李四', equipmentRange: 'A051-A100' },
      { id: 3, name: '喷涂车间', area: 'B区', location: '厂房B栋1楼', manager: '王五', equipmentRange: 'B001-B030' },
      { id: 4, name: '焊接车间', area: 'C区', location: '厂房C栋1楼', manager: '赵六', equipmentRange: 'C001-C040' }
    ])

    // 设备厂商数据
    const manufacturerData = ref([
      { id: 1, name: '上海机械制造有限公司', contact: '张经理', phone: '13800138000', email: 'zhang@shanghaimech.com', address: '上海市浦东新区张江高科技园区' },
      { id: 2, name: '北京自动化设备厂', contact: '李工', phone: '13900139000', email: 'li@beijingauto.com', address: '北京市海淀区中关村科技园' },
      { id: 3, name: '广州精密仪器有限公司', contact: '王总监', phone: '13700137000', email: 'wang@guangzhouprecision.com', address: '广州市天河区珠江新城' }
    ])

    // 设备型号数据
    const modelData = ref([
      { id: 1, code: 'M-1001', name: '自动装配机器人', manufacturer: '上海机械制造有限公司', parameters: '负载10kg, 重复精度±0.02mm', scenario: '小型零件装配', documents: ['用户手册.pdf', '技术参数.xlsx'] },
      { id: 2, code: 'M-2005', name: '高精度喷涂机', manufacturer: '北京自动化设备厂', parameters: '喷涂宽度500mm, 流量控制0.1-1.0L/min', scenario: '表面喷涂处理', documents: ['操作指南.pdf', '维护手册.pdf'] },
      { id: 3, code: 'M-3002', name: '激光焊接机', manufacturer: '广州精密仪器有限公司', parameters: '功率2000W, 焊接速度0.5-5m/min', scenario: '金属件焊接', documents: ['安全规范.pdf', '安装说明.docx'] }
    ])

    // 基础设备数据
    const equipmentData = ref([
      { id: 1, code: 'A001', name: '装配机器人1号', model: 'M-1001', workshop: '装配一车间', status: '正常' },
      { id: 2, code: 'A002', name: '装配机器人2号', model: 'M-1001', workshop: '装配一车间', status: '正常' },
      { id: 3, code: 'A051', name: '装配机器人3号', model: 'M-1001', workshop: '装配二车间', status: '维修中' },
      { id: 4, code: 'B001', name: '喷涂机1号', model: 'M-2005', workshop: '喷涂车间', status: '正常' },
      { id: 5, code: 'B002', name: '喷涂机2号', model: 'M-2005', workshop: '喷涂车间', status: '待检' },
      { id: 6, code: 'C001', name: '焊接机1号', model: 'M-3002', workshop: '焊接车间', status: '正常' }
    ])

    // 联机设备数据
    const onlineEquipmentData = ref([
      { id: 1, code: 'A001', name: '装配机器人1号', ip: '192.168.1.101', online: true, beat: 500 },
      { id: 2, code: 'A002', name: '装配机器人2号', ip: '192.168.1.102', online: true, beat: 500 },
      { id: 4, code: 'B001', name: '喷涂机1号', ip: '192.168.1.201', online: false, beat: 1000 },
      { id: 6, code: 'C001', name: '焊接机1号', ip: '192.168.1.301', online: true, beat: 800 }
    ])

    // 设备履历数据
    const historyData = ref([
      { id: 1, equipmentCode: 'A001', equipmentName: '装配机器人1号', acceptanceDate: '2022-01-15', supplier: '上海机械制造有限公司', batchNumber: 'B20220101', operator: '张三', result: '合格' },
      { id: 2, equipmentCode: 'A002', equipmentName: '装配机器人2号', acceptanceDate: '2022-01-20', supplier: '上海机械制造有限公司', batchNumber: 'B20220101', operator: '张三', result: '合格' },
      { id: 3, equipmentCode: 'A051', equipmentName: '装配机器人3号', acceptanceDate: '2022-03-10', supplier: '上海机械制造有限公司', batchNumber: 'B20220301', operator: '李四', result: '不合格' },
      { id: 4, equipmentCode: 'B001', equipmentName: '喷涂机1号', acceptanceDate: '2022-02-05', supplier: '北京自动化设备厂', batchNumber: 'B20220201', operator: '王五', result: '合格' },
      { id: 5, equipmentCode: 'B002', equipmentName: '喷涂机2号', acceptanceDate: '2022-02-08', supplier: '北京自动化设备厂', batchNumber: 'B20220201', operator: '王五', result: '合格' },
      { id: 6, equipmentCode: 'C001', equipmentName: '焊接机1号', acceptanceDate: '2022-04-12', supplier: '广州精密仪器有限公司', batchNumber: 'B20220401', operator: '赵六', result: '合格' }
    ])

    // 设备点表管理数据
    const plcEquipmentTree = ref([
      {
        id: 1,
        label: '装配一车间',
        children: [
          { id: 101, label: 'A001-装配机器人1号', ip: '192.168.1.101', port: '502', plcType: 's7-1200', protocol: 'modbus-tcp', pollingInterval: 500,
            points: [
              { address: '40001', name: '运行状态', type: 'BOOL', value: '1', description: '设备运行状态' },
              { address: '40002', name: '故障代码', type: 'INT', value: '0', description: '当前故障代码' },
              { address: '40003', name: '生产计数', type: 'DINT', value: '1254', description: '累计生产数量' }
            ]
          },
          { id: 102, label: 'A002-装配机器人2号', ip: '192.168.1.102', port: '502', plcType: 's7-1200', protocol: 'modbus-tcp', pollingInterval: 500,
            points: [
              { address: '40001', name: '运行状态', type: 'BOOL', value: '1', description: '设备运行状态' },
              { address: '40002', name: '故障代码', type: 'INT', value: '0', description: '当前故障代码' },
              { address: '40003', name: '生产计数', type: 'DINT', value: '987', description: '累计生产数量' }
            ]
          }
        ]
      },
      {
        id: 2,
        label: '装配二车间',
        children: [
          { id: 201, label: 'A051-装配机器人3号', ip: '192.168.1.151', port: '502', plcType: 's7-1200', protocol: 'modbus-tcp', pollingInterval: 500,
            points: [
              { address: '40001', name: '运行状态', type: 'BOOL', value: '0', description: '设备运行状态' },
              { address: '40002', name: '故障代码', type: 'INT', value: '12', description: '当前故障代码' },
              { address: '40003', name: '生产计数', type: 'DINT', value: '654', description: '累计生产数量' }
            ]
          }
        ]
      },
      {
        id: 3,
        label: '喷涂车间',
        children: [
          { id: 301, label: 'B001-喷涂机1号', ip: '192.168.1.201', port: '502', plcType: 's7-1500', protocol: 'profinet', pollingInterval: 1000,
            points: [
              { address: '40001', name: '运行状态', type: 'BOOL', value: '0', description: '设备运行状态' },
              { address: '40002', name: '喷涂压力', type: 'REAL', value: '0.0', description: '当前喷涂压力(MPa)' },
              { address: '40003', name: '流量设定', type: 'REAL', value: '0.5', description: '喷涂流量设定(L/min)' }
            ]
          }
        ]
      },
      {
        id: 4,
        label: '焊接车间',
        children: [
          { id: 401, label: 'C001-焊接机1号', ip: '192.168.1.301', port: '502', plcType: 'fx', protocol: 'modbus-tcp', pollingInterval: 800,
            points: [
              { address: '40001', name: '运行状态', type: 'BOOL', value: '1', description: '设备运行状态' },
              { address: '40002', name: '激光功率', type: 'INT', value: '1500', description: '当前激光功率(W)' },
              { address: '40003', name: '焊接速度', type: 'INT', value: '3', description: '当前焊接速度(m/min)' }
            ]
          }
        ]
      }
    ])

    // 树形控件属性配置
    const treeProps = {
      children: 'children',
      label: 'label'
    }

    // 当前选中的PLC设备
    const selectedPlcEquipment = ref(null)

    // 设备筛选条件
    const equipmentFilter = reactive({
      code: '',
      name: '',
      workshop: ''
    })

    // 履历筛选条件
    const historyFilter = reactive({
      code: '',
      name: '',
      dateRange: []
    })

    // 车间选项
    const workshopOptions = computed(() => {
      return workshopData.value.map(item => ({
        value: item.name,
        label: item.name
      }))
    })

    // 型号选项
    const modelOptions = computed(() => {
      return modelData.value.map(item => ({
        value: item.code,
        label: `${item.code} - ${item.name}`
      }))
    })

    // 过滤后的设备数据
    const filteredEquipmentData = computed(() => {
      return equipmentData.value.filter(item => {
        const codeMatch = !equipmentFilter.code || item.code.includes(equipmentFilter.code)
        const nameMatch = !equipmentFilter.name || item.name.includes(equipmentFilter.name)
        const workshopMatch = !equipmentFilter.workshop || item.workshop === equipmentFilter.workshop
        return codeMatch && nameMatch && workshopMatch
      })
    })

    // 过滤后的履历数据
    const filteredHistoryData = computed(() => {
      return historyData.value.filter(item => {
        const codeMatch = !historyFilter.code || item.equipmentCode.includes(historyFilter.code)
        const nameMatch = !historyFilter.name || item.equipmentName.includes(historyFilter.name)

        let dateMatch = true
        if (historyFilter.dateRange && historyFilter.dateRange.length === 2) {
          const startDate = new Date(historyFilter.dateRange[0])
          const endDate = new Date(historyFilter.dateRange[1])
          const itemDate = new Date(item.acceptanceDate)
          dateMatch = itemDate >= startDate && itemDate <= endDate
        }

        return codeMatch && nameMatch && dateMatch
      })
    })

    // 对话框相关状态
    const workshopDialogVisible = ref(false)
    const manufacturerDialogVisible = ref(false)
    const modelDialogVisible = ref(false)
    const equipmentDialogVisible = ref(false)
    const onlineSettingsDialogVisible = ref(false)
    const documentViewerVisible = ref(false)

    // 当前操作的记录
    const currentWorkshop = ref(null)
    const currentManufacturer = ref(null)
    const currentModel = ref(null)
    const currentEquipment = ref(null)
    const currentOnlineEquipment = ref(null)
    const currentDocuments = ref([])

    // 获取状态标签类型
    const getStatusTagType = (status) => {
      const statusMap = {
        '正常': 'success',
        '维修中': 'danger',
        '待检': 'warning'
      }
      return statusMap[status] || ''
    }

    // 处理PLC节点点击
    const handlePlcNodeClick = (data) => {
      if (data.children) return // 只处理叶子节点
      selectedPlcEquipment.value = data
    }

    // 保存PLC设置
    const savePlcSettings = () => {
      ElMessage.success('PLC设置保存成功')
    }

    // 测试PLC连接
    const testPlcConnection = () => {
      ElMessage.info('正在测试PLC连接...')
      // 模拟异步测试
      setTimeout(() => {
        ElMessage.success('PLC连接测试成功')
      }, 1000)
    }

    // 查看文档
    const viewDocuments = (model) => {
      currentDocuments.value = model.documents
      documentViewerVisible.value = true
    }

    // 查看设备详情
    const viewEquipmentDetail = (equipment) => {
      ElMessage.info(`查看设备详情: ${equipment.name}`)
    }

    // 编辑设备
    const editEquipment = (equipment) => {
      currentEquipment.value = { ...equipment }
      equipmentDialogVisible.value = true
    }

    // 查看联机设备详情
    const viewOnlineDetail = (equipment) => {
      ElMessage.info(`查看联机设备详情: ${equipment.name}`)
    }

    // 编辑联机设置
    const editOnlineSettings = (equipment) => {
      currentOnlineEquipment.value = { ...equipment }
      onlineSettingsDialogVisible.value = true
    }

    // 查看履历详情
    const viewHistoryDetail = (history) => {
      ElMessage.info(`查看履历详情: ${history.equipmentName}`)
    }

    // 搜索设备
    const searchEquipment = () => {
      ElMessage.success('设备搜索完成')
    }

    // 搜索履历
    const searchHistory = () => {
      ElMessage.success('履历搜索完成')
    }

    // 新增车间
    const handleAddWorkshop = () => {
      currentWorkshop.value = null
      workshopDialogVisible.value = true
    }

    // 新增厂商
    const handleAddManufacturer = () => {
      currentManufacturer.value = null
      manufacturerDialogVisible.value = true
    }

    // 新增型号
    const handleAddModel = () => {
      currentModel.value = null
      modelDialogVisible.value = true
    }

    // 新增设备
    const handleAddEquipment = () => {
      currentEquipment.value = null
      equipmentDialogVisible.value = true
    }

    // 处理车间表单提交
    const handleWorkshopSubmit = (formData) => {
      if (formData.id) {
        // 更新
        const index = workshopData.value.findIndex(item => item.id === formData.id)
        if (index !== -1) {
          workshopData.value[index] = formData
        }
      } else {
        // 新增
        formData.id = Math.max(...workshopData.value.map(item => item.id)) + 1
        workshopData.value.push(formData)
      }
      workshopDialogVisible.value = false
      ElMessage.success('车间信息保存成功')
    }

    // 处理厂商表单提交
    const handleManufacturerSubmit = (formData) => {
      if (formData.id) {
        // 更新
        const index = manufacturerData.value.findIndex(item => item.id === formData.id)
        if (index !== -1) {
          manufacturerData.value[index] = formData
        }
      } else {
        // 新增
        formData.id = Math.max(...manufacturerData.value.map(item => item.id)) + 1
        manufacturerData.value.push(formData)
      }
      manufacturerDialogVisible.value = false
      ElMessage.success('厂商信息保存成功')
    }

    // 处理型号表单提交
    const handleModelSubmit = (formData) => {
      if (formData.id) {
        // 更新
        const index = modelData.value.findIndex(item => item.id === formData.id)
        if (index !== -1) {
          modelData.value[index] = formData
        }
      } else {
        // 新增
        formData.id = Math.max(...modelData.value.map(item => item.id)) + 1
        modelData.value.push(formData)
      }
      modelDialogVisible.value = false
      ElMessage.success('型号信息保存成功')
    }

    // 处理设备表单提交
    const handleEquipmentSubmit = (formData) => {
      if (formData.id) {
        // 更新
        const index = equipmentData.value.findIndex(item => item.id === formData.id)
        if (index !== -1) {
          equipmentData.value[index] = formData
        }
      } else {
        // 新增
        formData.id = Math.max(...equipmentData.value.map(item => item.id)) + 1
        equipmentData.value.push(formData)
      }
      equipmentDialogVisible.value = false
      ElMessage.success('设备信息保存成功')
    }

    // 处理联机设置表单提交
    const handleOnlineSettingsSubmit = (formData) => {
      const index = onlineEquipmentData.value.findIndex(item => item.id === formData.id)
      if (index !== -1) {
        onlineEquipmentData.value[index] = formData
      }
      onlineSettingsDialogVisible.value = false
      ElMessage.success('联机设置保存成功')
    }

    return {
      activeTab,
      workshopData,
      manufacturerData,
      modelData,
      equipmentData,
      onlineEquipmentData,
      historyData,
      plcEquipmentTree,
      treeProps,
      selectedPlcEquipment,
      equipmentFilter,
      historyFilter,
      workshopOptions,
      modelOptions,
      filteredEquipmentData,
      filteredHistoryData,
      workshopDialogVisible,
      manufacturerDialogVisible,
      modelDialogVisible,
      equipmentDialogVisible,
      onlineSettingsDialogVisible,
      documentViewerVisible,
      currentWorkshop,
      currentManufacturer,
      currentModel,
      currentEquipment,
      currentOnlineEquipment,
      currentDocuments,
      getStatusTagType,
      handlePlcNodeClick,
      savePlcSettings,
      testPlcConnection,
      viewDocuments,
      viewEquipmentDetail,
      editEquipment,
      viewOnlineDetail,
      editOnlineSettings,
      viewHistoryDetail,
      searchEquipment,
      searchHistory,
      handleAddWorkshop,
      handleAddManufacturer,
      handleAddModel,
      handleAddEquipment,
      handleWorkshopSubmit,
      handleManufacturerSubmit,
      handleModelSubmit,
      handleEquipmentSubmit,
      handleOnlineSettingsSubmit
    }
  }
}
</script>

<style scoped>
.container {
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.table-actions {
  margin-top: 20px;
  text-align: right;
}

.filter-container {
  margin-bottom: 20px;
}

.filter-container .el-input,
.filter-container .el-select {
  margin-right: 10px;
}

.plc-container {
  display: flex;
  height: 600px;
}

.plc-sidebar {
  width: 300px;
  border-right: 1px solid #eee;
  padding-right: 20px;
  overflow-y: auto;
}

.plc-content {
  flex: 1;
  padding-left: 20px;
  overflow-y: auto;
}

.plc-params {
  padding: 20px;
}

.point-table {
  margin-top: 30px;
}
</style>
