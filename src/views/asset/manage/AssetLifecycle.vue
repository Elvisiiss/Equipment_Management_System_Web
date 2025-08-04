<!-- views/asset/manage/AssetLifecycle.vue -->
<template>
  <div class="lifecycle-wrapper">
<!--    &lt;!&ndash; 设备摘要卡片（父 + 子共享） &ndash;&gt;-->
<!--    <el-card shadow="hover" class="summary-card">-->
<!--      <template #header>-->
<!--        <div class="card-header">-->
<!--          <span>设备摘要</span>-->
<!--          <el-tag :type="statusTagType(device.status)">-->
<!--            {{ device.statusText }}-->
<!--          </el-tag>-->
<!--        </div>-->
<!--      </template>-->

<!--      <el-descriptions :column="4" border>-->
<!--        <el-descriptions-item label="设备编号">-->
<!--          <el-input v-model="device.code" size="small" style="width:120px" />-->
<!--        </el-descriptions-item>-->
<!--        <el-descriptions-item label="设备名称">-->
<!--          <el-input v-model="device.name" size="small" style="width:120px" />-->
<!--        </el-descriptions-item>-->
<!--        <el-descriptions-item label="当前状态">-->
<!--          <el-select v-model="device.status" size="small" style="width:120px">-->
<!--            <el-option label="创建设备" value="create" />-->
<!--            <el-option label="入库" value="store" />-->
<!--            <el-option label="上线" value="online" />-->
<!--            <el-option label="生产" value="produce" />-->
<!--            <el-option label="迁移" value="move" />-->
<!--            <el-option label="报废" value="scrap" />-->
<!--          </el-select>-->
<!--        </el-descriptions-item>-->
<!--        <el-descriptions-item label="资产净值(元)">-->
<!--          <el-input-number-->
<!--              v-model="device.value"-->
<!--              :precision="2"-->
<!--              size="small"-->
<!--              style="width:120px"-->
<!--          />-->
<!--        </el-descriptions-item>-->
<!--      </el-descriptions>-->
<!--    </el-card>-->

  <div class="sticky-steps">
    <!-- 生命周期阶段步骤条 -->
    <el-steps :active="stepIndex" finish-status="success" class="steps">
      <el-step title="创建设备" />
      <el-step title="入库" />
      <el-step title="上线" />
      <el-step title="生产" />
      <el-step title="迁移" />
      <el-step title="报废" />
    </el-steps>
  </div>
    <!-- 横向菜单 -->
    <el-menu
        :default-active="$route.path"
        mode="horizontal"
        router
        active-text-color="#409EFF"
        class="lifecycle-menu"
    >
      <el-menu-item index="/asset/manage/life/purchase">设备请购</el-menu-item>
      <el-menu-item index="/asset/manage/life/accept">设备验收</el-menu-item>
      <el-menu-item index="/asset/manage/life/capitalize">设备转固</el-menu-item>
      <el-menu-item index="/asset/manage/life/card-print">资产卡片打印</el-menu-item>
      <el-menu-item index="/asset/manage/life/base-info">基础资料录入</el-menu-item>
      <el-menu-item index="/asset/manage/life/scrap">设备报废</el-menu-item>
    </el-menu>

    <!-- 子路由出口 -->
    <div class="lifecycle-content">
      <router-view :device="device" @update="onUpdate" />
    </div>
  </div>
</template>

<script setup>
import { computed, provide, reactive } from 'vue'

// 共享给所有子组件
const device = reactive({
  code: 'FA' + Date.now().toString().slice(-6),
  name: '三坐标测量机',
  status: 'create',
  value: 120000
})

// 步骤条索引
const stepMap = ['create', 'store', 'online', 'produce', 'move', 'scrap']
const stepIndex = computed(() => stepMap.indexOf(device.status))

const statusTagType = (st) =>
    ({ create: '', store: 'info', online: 'success', produce: '', move: 'warning', scrap: 'danger' })[st]

const onUpdate = (patch) => Object.assign(device, patch)
provide('device', device) // 全局注入，子组件也可用 inject 获取
</script>

<style scoped>
.lifecycle-wrapper {
  padding: 16px;
}
.sticky-steps {
  position: sticky;
  top: 0;
  z-index: 999;
  background: #fff;
  padding: 8px 16px;
  border-bottom: 1px solid #eee;
}
.summary-card {
  margin-bottom: 16px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.steps {
  margin-bottom: 20px;
}
.lifecycle-menu {
  border-bottom: 1px solid #eee;
  margin-bottom: 16px;
}
</style>
