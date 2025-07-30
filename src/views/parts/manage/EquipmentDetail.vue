<template>
  <div class="equipment-detail">
    <!-- 头部信息 -->
    <div class="header">
      <el-page-header @back="$router.back()" content="设备详情" />
      <div class="header-info">
        <h2>{{ equipment.name }} <el-tag>{{ equipment.categoryLabel }}</el-tag></h2>
        <p>编码：{{ equipment.code }} | 型号：{{ equipment.model }}</p>
      </div>
    </div>

    <el-row :gutter="20" class="content">
      <!-- 左侧：部位结构树 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>部位结构</span>
          </template>
          <el-tree
              :data="equipment.parts"
              :props="treeProps"
              node-key="id"
              default-expand-all
              @node-click="handleNodeClick"
          />
        </el-card>
      </el-col>

      <!-- 中间：零件清单 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>零件清单</span>
          </template>
          <el-table :data="currentParts" height="400">
            <el-table-column prop="name" label="零件名称" />
            <el-table-column prop="partNo" label="零件号" width="120" />
            <el-table-column label="操作" width="80">
              <template #default="{ row }">
                <el-button type="text" size="small" @click="handlePartDetail(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 右侧：技术资料 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>技术资料</span>
            <el-button type="primary" size="small" style="float: right" @click="handleUpload">上传</el-button>
          </template>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="维护标准" name="standard">
              <div v-if="hasStandard" class="doc-list">
                <div v-for="doc in standards" :key="doc.id" class="doc-item">
                  <el-icon><Document /></el-icon>
                  <span class="doc-name" @click="previewDoc(doc)">{{ doc.name }}</span>
                </div>
              </div>
              <el-empty v-else description="暂无维护标准" />
            </el-tab-pane>

            <el-tab-pane label="SOP" name="sop">
              <div v-if="hasSop" class="doc-list">
                <div v-for="doc in sops" :key="doc.id" class="doc-item">
                  <el-icon><Document /></el-icon>
                  <span class="doc-name" @click="previewDoc(doc)">{{ doc.name }}</span>
                </div>
              </div>
              <el-empty v-else description="暂无SOP" />
            </el-tab-pane>

            <el-tab-pane label="3D模型" name="model">
              <div v-if="hasModel" class="model-preview">
                <img :src="modelThumbnail" alt="3D模型预览" @click="openModelViewer" />
                <el-button type="primary" size="small" @click="openModelViewer">查看3D模型</el-button>
              </div>
              <el-empty v-else description="暂无3D模型" />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>

    <!-- 3D模型预览弹窗 -->
    <el-dialog v-model="modelVisible" title="3D模型预览" width="80%">
      <div class="model-container">
        <!-- 这里集成Three.js或CAD模型查看器 -->
        <iframe :src="modelUrl" width="100%" height="600px" frameborder="0"></iframe>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Document } from '@element-plus/icons-vue'
import locationAPI from '@/api/location'

const route = useRoute()
const equipment = ref({
  id: null,
  name: '',
  code: '',
  categoryLabel: '',
  model: '',
  parts: [],
  documents: []
})

const activeTab = ref('standard')
const currentParts = ref([])
const modelVisible = ref(false)

const treeProps = {
  children: 'children',
  label: 'name'
}

const standards = computed(() => equipment.value.documents.filter(d => d.type === 'STANDARD'))
const sops = computed(() => equipment.value.documents.filter(d => d.type === 'SOP'))
const models = computed(() => equipment.value.documents.filter(d => d.type === 'MODEL'))

const hasStandard = computed(() => standards.value.length > 0)
const hasSop = computed(() => sops.value.length > 0)
const hasModel = computed(() => models.value.length > 0)

const modelThumbnail = computed(() => models.value[0]?.thumbnail || '')
const modelUrl = computed(() => models.value[0]?.url || '')

const loadEquipment = async () => {
  try {
    const res = await locationAPI.getEquipmentDetail(route.params.id)
    equipment.value = res.data
  } catch (error) {
    console.error('加载设备详情失败', error)
  }
}

const handleNodeClick = (data) => {
  if (data.parts) {
    currentParts.value = data.parts
  } else {
    currentParts.value = [data]
  }
}

const handlePartDetail = (part) => {
  console.log('查看零件详情:', part)
}

const handleUpload = () => {
  console.log('上传资料')
}

const previewDoc = (doc) => {
  window.open(doc.url, '_blank')
}

const openModelViewer = () => {
  modelVisible.value = true
}

onMounted(() => {
  loadEquipment()
})
</script>

<style scoped>
.equipment-detail {
  padding: 20px;
}
.header {
  margin-bottom: 20px;
}
.header-info h2 {
  margin: 10px 0 5px 0;
}
.content {
  margin-top: 20px;
}
.doc-list {
  max-height: 400px;
  overflow-y: auto;
}
.doc-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}
.doc-item:last-child {
  border-bottom: none;
}
.doc-name {
  margin-left: 8px;
  cursor: pointer;
  color: #409EFF;
}
.doc-name:hover {
  text-decoration: underline;
}
.model-preview {
  text-align: center;
}
.model-preview img {
  width: 100%;
  max-height: 200px;
  object-fit: contain;
  margin-bottom: 10px;
  cursor: pointer;
}
.model-container {
  height: 600px;
}
</style>
