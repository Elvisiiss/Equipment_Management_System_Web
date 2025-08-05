<template>
  <el-card>
    <template #header><span>身份管理 – 权限矩阵</span></template>
    <el-table :data="table" border>
      <el-table-column prop="role" label="角色" />
      <el-table-column prop="perms" label="权限" />
      <el-table-column label="操作">
        <template #default="{row}">
          <el-button size="small" @click="edit(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
const table = [
  {role:'操作员', perms:'领用/归还/生产验证(仅本工单)'},
  {role:'班组长', perms:'包含操作员 + 强制解除报警'},
  {role:'模具管理员', perms:'状态切换、库位调整'},
  {role:'设备工程师', perms:'BOM 维护、寿命设定'}
]
const edit = (row:any)=>ElMessage.info('跳转到权限编辑：'+row.role)
</script>
