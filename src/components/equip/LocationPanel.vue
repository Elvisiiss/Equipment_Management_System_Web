<template>
  <div>
    <h3>逻辑位置管理（多层级）</h3>

    <el-row :gutter="16">
      <!-- 左侧树 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <span>位置结构</span>
            <el-button style="float:right" size="small" @click="openAdd('root')">
              新增
            </el-button>
          </template>
          <el-tree
              ref="tree"
              :data="treeData"
              node-key="id"
              default-expand-all
              highlight-current
              :expand-on-click-node="false"
              @node-click="handleNodeClick"
          >
            <template #default="{ node, data }">
              <span class="tree-node">
                <span>{{ data.name }}</span>
                <span>
                  <el-button type="text" @click.stop="openAdd(data)">新增</el-button>
                  <el-button type="text" @click.stop="del(data)">删除</el-button>
                </span>
              </span>
            </template>
          </el-tree>
        </el-card>
      </el-col>

      <!-- 右侧详情 / 批量导入 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <span>{{ current.id ? '编辑' : '新增' }}逻辑位置</span>
          </template>
          <el-form :model="current" label-width="80px">
            <el-form-item label="名称">
              <el-input v-model="current.name" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="current.remark" type="textarea" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="save">保存</el-button>
              <el-button @click="current={}">重置</el-button>
            </el-form-item>
          </el-form>

          <el-divider>批量导入</el-divider>
          <el-upload
              :show-file-list="false"
              accept=".xlsx,.xls"
              :before-upload="importExcel"
          >
            <el-button type="primary">导入 Excel</el-button>
          </el-upload>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 模拟树数据
const treeData = ref([
  {
    id: 1,
    name: 'A区',
    children: [
      { id: 11, name: '1排', children: [] },
      { id: 12, name: '2排', children: [] }
    ]
  },
  { id: 2, name: 'B区', children: [] }
])

const tree = ref()
let idPool = 100
const current = ref({})

function openAdd(parent){
  current.value = { parent: parent.id || 'root' }
}
function save(){
  if(!current.value.name){ ElMessage.warning('请输入名称'); return }

  // 新增
  if(!current.value.id){
    current.value.id = ++idPool
    if(current.value.parent === 'root'){
      treeData.value.push({ ...current.value, children:[] })
    }else{
      const parent = findNode(treeData.value, current.value.parent)
      parent && parent.children.push({ ...current.value, children:[] })
    }
  }
  // 编辑
  else{
    const node = findNode(treeData.value, current.value.id)
    Object.assign(node, current.value)
  }
  current.value = {}
}
function del(data){
  ElMessageBox.confirm('确认删除？').then(()=>{
    removeNode(treeData.value, data.id)
  })
}
function findNode(arr, id){
  for(const node of arr){
    if(node.id===id) return node
    const found = findNode(node.children, id)
    if(found) return found
  }
}
function removeNode(arr, id){
  const idx = arr.findIndex(n=>n.id===id)
  if(idx>-1) return arr.splice(idx,1)
  arr.forEach(n=>removeNode(n.children, id))
}

// 模拟导入
function importExcel(file){
  ElMessage.success(`已选择 ${file.name}，实际需调用后端解析`)
  return false
}
</script>

<style scoped>
.tree-node{
  flex:1;display:flex;justify-content:space-between;align-items:center;padding-right:8px;
}
</style>
