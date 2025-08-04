<template>
  <el-container style="height:100vh">
    <!-- 左侧树 -->
    <el-aside width="260px" class="aside">
      <div class="aside-header">
        <span>组织层级</span>
        <el-button type="primary" size="small" @click="openOrgDialog('add',null,'工厂')">新增工厂</el-button>
      </div>
      <el-tree
          ref="treeRef"
          :data="orgTree"
          node-key="id"
          default-expand-all
          highlight-current
          @node-click="handleNodeClick"
      >
        <template #default="{node, data}">
          <span class="tree-node">
            <span>{{ data.label }}</span>
            <span>
              <el-icon @click.stop="openOrgDialog('add',data,'车间')"><Plus /></el-icon>
              <el-icon @click.stop="openOrgDialog('edit',data)"><Edit /></el-icon>
              <el-icon @click.stop="removeNode(data)"><Delete /></el-icon>
            </span>
          </span>
        </template>
      </el-tree>
    </el-aside>

    <!-- 右侧主内容 -->
    <el-main>
      <el-tabs v-model="activeTab">
        <!-- 资产索引标签页 -->
        <el-tab-pane label="资产索引" name="index">
          <el-card>
            <template #header>
              <span>资产主数据 & 索引</span>
              <el-button type="primary" size="small" style="float:right" @click="openAssetDialog('add')">新增资产</el-button>
            </template>

            <!-- 搜索栏 -->
            <el-form :inline="true" :model="query" class="mb-12">
              <el-form-item label="工厂">
                <el-select v-model="query.factory" clearable placeholder="全部" style="width:120px">
                  <el-option v-for="f in factories" :key="f" :label="f" :value="f"/>
                </el-select>
              </el-form-item>
              <el-form-item label="车间">
                <el-select v-model="query.workshop" clearable placeholder="全部" style="width:120px">
                  <el-option v-for="w in workshops" :key="w" :label="w" :value="w"/>
                </el-select>
              </el-form-item>
              <el-form-item label="产线">
                <el-select v-model="query.line" clearable placeholder="全部" style="width:120px">
                  <el-option v-for="l in lines" :key="l" :label="l" :value="l"/>
                </el-select>
              </el-form-item>
              <el-form-item label="资产类型">
                <el-select v-model="query.assetType" clearable placeholder="全部" style="width:120px">
                  <el-option label="设备" value="设备"/>
                  <el-option label="模治具" value="模治具"/>
                  <el-option label="零配件" value="零配件"/>
                </el-select>
              </el-form-item>
              <el-form-item label="关键字">
                <el-input v-model="query.keyword" placeholder="编号/名称" style="width:150px"/>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="search">查询</el-button>
              </el-form-item>
            </el-form>

            <!-- 资产表 -->
            <el-table :data="pageData" border stripe>
              <el-table-column prop="code" label="资产编号" width="120" sortable/>
              <el-table-column prop="name" label="名称" width="150" sortable/>
              <el-table-column prop="type" label="类型" width="100" sortable/>
              <el-table-column prop="model" label="规格" width="150"/>
              <el-table-column prop="factory" label="工厂" width="120" sortable/>
              <el-table-column prop="workshop" label="车间" width="120" sortable/>
              <el-table-column prop="line" label="产线" width="120" sortable/>
              <el-table-column label="操作" width="160" fixed="right">
                <template #default="{row}">
                  <el-button size="small" @click="openTrace(row)">追溯</el-button>
                  <el-button size="small" @click="openAssetDialog('edit',row)">编辑</el-button>
                </template>
              </el-table-column>
            </el-table>

            <el-pagination background class="mt-12"
                           v-model:current-page="page.current"
                           :page-size="page.size"
                           :total="filteredAssets.length"
                           layout="prev, pager, next"/>
          </el-card>
        </el-tab-pane>

        <!-- 资产导入标签页 -->
        <el-tab-pane label="资产导入" name="import">
          <el-card>
            <template #header><span>采购同步 & Excel 导入</span></template>

            <!-- 采购同步 -->
            <el-card shadow="never" class="mb-12">
              <template #header>
                <span>采购系统自动入库</span>
                <el-button :loading="syncLoading" type="primary" size="small"
                           style="float:right" @click="handleSync">立即同步</el-button>
              </template>
              <el-descriptions border>
                <el-descriptions-item label="上次同步">{{ lastSync }}</el-descriptions-item>
                <el-descriptions-item label="成功条数">{{ syncResult.success }}</el-descriptions-item>
                <el-descriptions-item label="失败条数">{{ syncResult.fail }}</el-descriptions-item>
              </el-descriptions>
            </el-card>

            <!-- Excel 导入 -->
            <el-upload
                class="upload-demo"
                drag
                accept=".xlsx"
                :before-upload="handleExcel">
              <i class="el-icon-upload"/>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
              <template #tip>
                <div class="el-upload__tip">
                  请先下载
                  <el-link type="primary" @click="downloadTemplate">模板文件</el-link>
                </div>
              </template>
            </el-upload>

            <!-- 导入结果 -->
            <el-table v-if="importResult.length" :data="importResult" class="mt-12">
              <el-table-column prop="row" label="行号"/>
              <el-table-column prop="msg" label="结果"/>
            </el-table>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </el-main>
  </el-container>

  <!-- 组织节点弹窗（新增/编辑） -->
  <el-dialog v-model="orgDialog.visible" :title="orgDialog.mode==='add'?'新增节点':'编辑节点'" width="360">
    <el-form :model="orgForm" label-width="60">
      <el-form-item label="名称">
        <el-input v-model="orgForm.label"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="orgDialog.visible=false">取消</el-button>
      <el-button type="primary" @click="saveOrgNode">保存</el-button>
    </template>
  </el-dialog>

  <!-- 资产弹窗（新增/编辑） -->
  <el-dialog v-model="assetDialog.visible" :title="assetDialog.mode==='add'?'新增资产':'编辑资产'" width="480">
    <el-form :model="assetForm" label-width="80">
      <el-form-item label="资产编号"><el-input v-model="assetForm.code"/></el-form-item>
      <el-form-item label="名称"><el-input v-model="assetForm.name"/></el-form-item>
      <el-form-item label="类型">
        <el-select v-model="assetForm.type">
          <el-option label="设备" value="设备"/>
          <el-option label="模治具" value="模治具"/>
          <el-option label="零配件" value="零配件"/>
        </el-select>
      </el-form-item>
      <el-form-item label="规格"><el-input v-model="assetForm.model"/></el-form-item>
      <el-form-item label="工厂">
        <el-select v-model="assetForm.factory">
          <el-option v-for="f in factories" :key="f" :label="f" :value="f"/>
        </el-select>
      </el-form-item>
      <el-form-item label="车间">
        <el-select v-model="assetForm.workshop">
          <el-option v-for="w in workshops" :key="w" :label="w" :value="w"/>
        </el-select>
      </el-form-item>
      <el-form-item label="产线">
        <el-select v-model="assetForm.line">
          <el-option v-for="l in lines" :key="l" :label="l" :value="l"/>
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="assetDialog.visible=false">取消</el-button>
      <el-button type="primary" @click="saveAsset">保存</el-button>
    </template>
  </el-dialog>

  <!-- 追溯弹窗 -->
  <el-dialog v-model="traceVisible" :title="`追溯：${currentAsset.name}`" width="60%">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="编号">{{ currentAsset.code }}</el-descriptions-item>
      <el-descriptions-item label="名称">{{ currentAsset.name }}</el-descriptions-item>
      <el-descriptions-item label="类型">{{ currentAsset.type }}</el-descriptions-item>
      <el-descriptions-item label="规格">{{ currentAsset.model }}</el-descriptions-item>
      <el-descriptions-item label="位置">{{ `${currentAsset.factory}/${currentAsset.workshop}/${currentAsset.line}` }}</el-descriptions-item>
    </el-descriptions>

    <el-divider content-position="left">正向追溯（子件）</el-divider>
    <el-table :data="traceChildren" size="small" border>
      <el-table-column prop="code" label="子件编号"/>
      <el-table-column prop="name" label="名称"/>
      <el-table-column prop="type" label="类型"/>
      <el-table-column prop="model" label="规格"/>
      <el-table-column label="操作" width="120">
        <template #default="{row}">
          <el-button size="small" @click="openTrace(row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-divider content-position="left">反向追溯（父件）</el-divider>
    <el-table :data="traceParents" size="small" border>
      <el-table-column prop="code" label="父件编号"/>
      <el-table-column prop="name" label="名称"/>
      <el-table-column prop="type" label="类型"/>
      <el-table-column prop="model" label="规格"/>
      <el-table-column label="操作" width="120">
        <template #default="{row}">
          <el-button size="small" @click="openTrace(row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <el-button @click="traceVisible=false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'

const activeTab = ref('index')

/* ========= 假数据：组织树 ========= */
const orgTree = ref([
  {
    id: 1,
    label: '工厂A',
    type: '工厂',
    children: Array.from({ length: 6 }, (_, i) => ({
      id: 100 + i,
      label: `车间${i + 1}`,
      type: '车间',
      parentId: 1,
      children: Array.from({ length: 6 }, (_, j) => ({
        id: 1000 + i * 10 + j,
        label: `产线${j + 1}`,
        type: '产线',
        parentId: 100 + i
      }))
    }))
  },
  {
    id: 2,
    label: '工厂B',
    type: '工厂',
    children: Array.from({ length: 6 }, (_, i) => ({
      id: 200 + i,
      label: `车间${i + 1}`,
      type: '车间',
      parentId: 2,
      children: Array.from({ length: 6 }, (_, j) => ({
        id: 2000 + i * 10 + j,
        label: `产线${j + 1}`,
        type: '产线',
        parentId: 200 + i
      }))
    }))
  }
])

/* ========= 假数据：资产 ========= */
const allAssets = ref([])
const factories = ['工厂A', '工厂B']
const workshops = Array.from({ length: 6 }, (_, i) => `车间${i + 1}`)
const lines = Array.from({ length: 6 }, (_, i) => `产线${i + 1}`)

/* 生成假资产：工厂/车间/产线 各 6*6*6=216 条 */
for (let f = 0; f < 2; f++) {
  for (let w = 1; w <= 6; w++) {
    for (let l = 1; l <= 6; l++) {
      for (let i = 1; i <= 6; i++) {
        allAssets.value.push({
          id: f * 10000 + w * 1000 + l * 100 + i,
          code: `EQ${f + 1}${w}${l}${i.toString().padStart(2, '0')}`,
          name: `设备${f + 1}-${w}-${l}-${i}`,
          type: ['设备', '模治具', '零配件'][i % 3],
          model: 'M-' + Math.floor(Math.random() * 1000),
          factory: factories[f],
          workshop: `车间${w}`,
          line: `产线${l}`
        })
      }
    }
  }
}

/* ========= 左侧树操作 ========= */
const treeRef = ref()
const orgDialog = reactive({ visible: false, mode: 'add', parent: null })
const orgForm = reactive({ id: null, label: '', type: '' })

const openOrgDialog = (mode, data, childType) => {
  orgDialog.mode = mode
  if (mode === 'add') {
    orgDialog.parent = data
    orgForm.label = ''
    orgForm.type = childType
  } else {
    Object.assign(orgForm, data)
  }
  orgDialog.visible = true
}
const saveOrgNode = () => {
  if (orgDialog.mode === 'add') {
    const parent = orgDialog.parent
    const newNode = {
      id: Date.now(),
      label: orgForm.label,
      type: orgForm.type,
      children: []
    }
    if (parent) {
      parent.children = parent.children || []
      parent.children.push(newNode)
    } else {
      orgTree.value.push(newNode)
    }
  } else {
    const node = findNode(orgTree.value, orgForm.id)
    if (node) node.label = orgForm.label
  }
  orgDialog.visible = false
}
const removeNode = (data) => {
  ElMessageBox.confirm(`确定删除 ${data.label} ?`, '提示').then(() => {
    const parent = findParent(orgTree.value, data.id)
    const list = parent ? parent.children : orgTree.value
    const idx = list.findIndex(n => n.id === data.id)
    list.splice(idx, 1)
  })
}
const findNode = (nodes, id) => {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children) {
      const res = findNode(n.children, id)
      if (res) return res
    }
  }
}
const findParent = (nodes, id, parent = null) => {
  for (const n of nodes) {
    if (n.id === id) return parent
    if (n.children) {
      const res = findParent(n.children, id, n)
      if (res) return res
    }
  }
}

/* ========= 右侧资产 ========= */
const query = reactive({ factory: '', workshop: '', line: '', assetType: '', keyword: '' })
const page = reactive({ current: 1, size: 20 })
const activeNode = ref(null)

/* 点击树过滤资产 */
const handleNodeClick = (node) => {
  activeNode.value = node
  if (node.type === '工厂') query.factory = node.label
  else if (node.type === '车间') query.workshop = node.label
  else if (node.type === '产线') query.line = node.label
  nextTick(() => {
    page.current = 1
  })
}

/* 搜索框过滤 */
const filteredAssets = computed(() =>
    allAssets.value.filter(a =>
        (!query.factory  || a.factory  === query.factory) &&
        (!query.workshop || a.workshop === query.workshop) &&
        (!query.line     || a.line     === query.line) &&
        (!query.assetType || a.type === query.assetType) &&
        (!query.keyword  || a.code.includes(query.keyword) || a.name.includes(query.keyword))
    )
)
const pageData = computed(() => {
  const start = (page.current - 1) * page.size
  return filteredAssets.value.slice(start, start + page.size)
})
const search = () => {
  page.current = 1
}

/* ========= 资产弹窗 ========= */
const assetDialog = reactive({ visible: false, mode: 'add' })
const assetForm = reactive({
  id: null,
  code: '',
  name: '',
  type: '设备',
  model: '',
  factory: '',
  workshop: '',
  line: ''
})
const openAssetDialog = (mode, row) => {
  assetDialog.mode = mode
  if (mode === 'add') {
    Object.assign(assetForm, {
      id: null,
      code: '',
      name: '',
      type: '设备',
      model: '',
      factory: query.factory || '',
      workshop: query.workshop || '',
      line: query.line || ''
    })
  } else {
    Object.assign(assetForm, row)
  }
  assetDialog.visible = true
}
const saveAsset = () => {
  if (!assetForm.code || !assetForm.name) {
    ElMessage.warning('请填写资产编号和名称')
    return
  }

  if (assetDialog.mode === 'add') {
    allAssets.value.push({ ...assetForm, id: Date.now() })
    ElMessage.success('新增资产成功')
  } else {
    const idx = allAssets.value.findIndex(a => a.id === assetForm.id)
    Object.assign(allAssets.value[idx], assetForm)
    ElMessage.success('更新资产成功')
  }
  assetDialog.visible = false
}

/* ========= 追溯弹窗 ========= */
const traceVisible = ref(false)
const currentAsset = ref({})
const traceChildren = ref([])
const traceParents = ref([])

/* 模拟 BOM 结构：设备→模治具→零配件 */
const bom = {}
/* 生成更合理的 BOM 结构 */
allAssets.value.forEach(a => {
  // 设备包含模治具，模治具包含零配件
  if (a.type === '设备') {
    // 查找属于同一车间的模治具作为子件
    const children = allAssets.value.filter(x =>
        x.type === '模治具' &&
        x.workshop === a.workshop &&
        x !== a
    ).slice(0, 3)

    // 随机选择1-2个父件（通常是产线或其他设备）
    const parents = allAssets.value.filter(x =>
        (x.type === '设备' || x.type === '产线') &&
        x !== a
    ).slice(0, Math.floor(Math.random() * 2) + 1)

    bom[a.id] = { children, parents }
  } else if (a.type === '模治具') {
    // 查找属于同一车间的零配件作为子件
    const children = allAssets.value.filter(x =>
        x.type === '零配件' &&
        x.workshop === a.workshop &&
        x !== a
    ).slice(0, 5)

    // 父件是设备
    const parents = allAssets.value.filter(x =>
        x.type === '设备' &&
        x.workshop === a.workshop
    ).slice(0, 2)

    bom[a.id] = { children, parents }
  } else if (a.type === '零配件') {
    // 零配件没有子件，父件是模治具
    const parents = allAssets.value.filter(x =>
        x.type === '模治具' &&
        x.workshop === a.workshop
    ).slice(0, 2)

    bom[a.id] = { children: [], parents }
  }
})

const openTrace = (row) => {
  currentAsset.value = row
  traceChildren.value = bom[row.id]?.children || []
  traceParents.value = bom[row.id]?.parents || []
  traceVisible.value = true
}

/* ========= 导入功能 ========= */
const lastSync = ref('2025-08-01 10:00:00')
const syncResult = ref({ success: 0, fail: 0 })
const syncLoading = ref(false)
const importResult = ref([])

const handleSync = () => {
  syncLoading.value = true
  setTimeout(() => {
    // 模拟同步数据
    const newAssets = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      code: `IMP${Date.now().toString().slice(-4)}${i}`,
      name: `导入设备${i + 1}`,
      type: ['设备', '模治具', '零配件'][i % 3],
      model: 'IMP-' + Math.floor(Math.random() * 1000),
      factory: ['工厂A', '工厂B'][i % 2],
      workshop: `车间${(i % 6) + 1}`,
      line: `产线${(i % 6) + 1}`
    }))

    allAssets.value.push(...newAssets)
    syncResult.value = { success: 18, fail: 2 }
    lastSync.value = new Date().toLocaleString()
    syncLoading.value = false
    ElMessage.success('同步完成，新增18条资产')
  }, 1000)
}

const handleExcel = (file) => {
  // 模拟导入数据
  const newAssets = Array.from({ length: 10 }, (_, i) => ({
    id: Date.now() + i + 1000,
    code: `EXL${Date.now().toString().slice(-4)}${i}`,
    name: `Excel导入${i + 1}`,
    type: ['设备', '模治具', '零配件'][(i + 1) % 3],
    model: 'EXL-' + Math.floor(Math.random() * 1000),
    factory: ['工厂A', '工厂B'][(i + 1) % 2],
    workshop: `车间${((i + 1) % 6) + 1}`,
    line: `产线${((i + 1) % 6) + 1}`
  }))

  allAssets.value.push(...newAssets)

  // 模拟导入结果
  importResult.value = [
    { row: 2, msg: '导入成功' },
    { row: 3, msg: '编号已存在' },
    { row: 4, msg: '导入成功' },
    { row: 5, msg: '导入成功' }
  ]

  ElMessage.success('导入完成，新增10条资产')
  return false // 阻止真实上传
}

const downloadTemplate = () => {
  ElMessage.info('模板下载已触发')
  // 实际项目中用 window.open('/template.xlsx')
}
</script>

<style scoped>
.aside {
  border-right: 1px solid #eee;
  padding: 12px;
}
.aside-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.tree-node {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.mt-12 { margin-top: 12px; }
.mb-12 { margin-bottom: 12px; }
.upload-demo {
  margin-top: 20px;
}
</style>
