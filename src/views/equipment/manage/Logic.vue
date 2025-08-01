<!--5.2 信息管理维护（逻辑位置创建/管理/树结构-->

<template>
  <div>
    <el-button type="primary" @click="openAdd(null)">新增根节点</el-button>
    <el-button type="warning" @click="importVisible = true">导入</el-button>
    <el-button type="info" @click="exportData">导出</el-button>

    <el-tree
        :data="treeData"
        node-key="id"
        default-expand-all
        :expand-on-click-node="false"
        style="margin-top:10px;width:400px">
      <template #default="{node, data}">
        <span class="custom-tree-node">
          <span>{{ data.label }}</span>
          <span>
            <el-button size="small" text type="primary" @click="openAdd(data)">添加</el-button>
            <el-button size="small" text type="warning" @click="edit(data)">编辑</el-button>
            <el-button size="small" text type="danger"  @click="remove(node, data)">删除</el-button>
          </span>
        </span>
      </template>
    </el-tree>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="300">
      <el-input v-model="inputLabel" placeholder="节点名称"/>
      <template #footer>
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmAdd">确定</el-button>
      </template>
    </el-dialog>

    <!-- 导入弹窗 -->
    <el-dialog v-model="importVisible" title="导入(JSON)" width="400">
      <el-input
          v-model="importText"
          type="textarea"
          rows="6"
          placeholder='[{"id":"1","label":"A","children":[]}]'/>
      <template #footer>
        <el-button @click="importVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmImport">导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue';
import eventBus from '../../../utils/eventBus';

const treeData = ref([
  { id: 'root', label: '工厂A', children: [
      { id: 'line1', label: '生产线1', children: [] }
    ]}
]);

const dialogVisible = ref(false);
const dialogTitle   = ref('');
const inputLabel    = ref('');
const importVisible = ref(false);
const importText    = ref('');

let currentParent = null;
let currentEdit   = null;

function openAdd(parent) {
  dialogTitle.value = '新增节点';
  inputLabel.value  = '';
  currentParent = parent;
  currentEdit   = null;
  dialogVisible.value = true;
}
function edit(node) {
  dialogTitle.value = '编辑节点';
  inputLabel.value  = node.label;
  currentEdit = node;
  dialogVisible.value = true;
}
function confirmAdd() {
  if (currentEdit) {
    currentEdit.label = inputLabel.value;
  } else {
    const newNode = { id: Date.now().toString(), label: inputLabel.value, children: [] };
    if (currentParent) currentParent.children.push(newNode);
    else treeData.value.push(newNode);
  }
  dialogVisible.value = false;
  eventBus.emit('location-updated', treeData.value);
}
function remove(node, data) {
  const parent = node.parent;
  const children = parent.data.children || parent.data;
  const index = children.findIndex(d => d.id === data.id);
  children.splice(index, 1);
  eventBus.emit('location-updated', treeData.value);
}
function exportData() {
  const blob = new Blob([JSON.stringify(treeData.value, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'locations.json'; a.click();
}
function confirmImport() {
  try {
    treeData.value = JSON.parse(importText.value);
    importVisible.value = false;
    eventBus.emit('location-updated', treeData.value);
  } catch { ElMessage.error('格式错误'); }
}

provide('locationTree', treeData);
</script>

<style scoped>
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>
